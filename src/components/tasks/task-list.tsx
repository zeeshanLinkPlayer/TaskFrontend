import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "../../lib/queryClient";
import { queryClient } from "../../lib/queryClient";
import { useToast } from "../../hooks/use-toast";
import TaskFilters from "./task-filters";
import AvatarInitials from "../ui/avatar-initials";
import StatusBadge from "../ui/status-badge";
import PriorityBadge from "../ui/priority-badge";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { useAuth } from "../../lib/authProvider";
import { TaskForm } from "./task-form";
import { format } from "date-fns";

// Import Remix Icons (ensure the library is installed)
import "remixicon/fonts/remixicon.css";

interface TaskAssignee {
  id: number;
  name: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority?: string; // Make priority optional
  dueDate: string;
  creatorId: number;
  assigneeId: number;
  creator?: TaskAssignee;
  assignee?: TaskAssignee;
  createdAt: string;
}

const TaskStatus = {
  PENDING: "pending",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
};

const TaskList = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("newest");
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);

  // Fetch tasks
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    select: (data) => {
      return data.map((task) => ({
        ...task,
        priority: task.priority || "Unknown", // Provide a fallback value
      }));
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      await apiRequest("DELETE", `/api/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task deleted",
        description: "The task has been deleted successfully.",
      });
      setTaskToDelete(null);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete task.",
      });
    },
  });

  // Apply filters and sorting
  const filteredTasks = tasks
    ? tasks.filter((task) => {
        // Apply status filter
        const statusMatch =
          statusFilter === "all" || task.status === statusFilter;

        // Apply priority filter
        const priorityMatch =
          priorityFilter === "all" || task.priority === priorityFilter;

        // Only include tasks that match both filters
        return statusMatch && priorityMatch;
      })
    : [];

  // Apply sorting
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortOrder) {
      case "newest":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "oldest":
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "due-date":
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case "priority":
        // Sort by priority (urgent > high > medium > low)
        const priorityOrder = {
          urgent: 0,
          high: 1,
          medium: 2,
          low: 3,
        };
        return (
          (priorityOrder[a.priority as keyof typeof priorityOrder] || 999) -
          (priorityOrder[b.priority as keyof typeof priorityOrder] || 999)
        );
      default:
        return 0;
    }
  });

  // Stats for the cards
  const taskStats = {
    pending: tasks
      ? tasks.filter((task) => task.status === TaskStatus.PENDING).length
      : 0,
    inProgress: tasks
      ? tasks.filter((task) => task.status === TaskStatus.IN_PROGRESS).length
      : 0,
    completed: tasks
      ? tasks.filter((task) => task.status === TaskStatus.COMPLETED).length
      : 0,
  };

  // Handle task deletion
  const handleDeleteTask = (task: Task) => {
    setTaskToDelete(task);
  };

  // Confirm task deletion
  const confirmDeleteTask = () => {
    if (taskToDelete) {
      deleteTaskMutation.mutate(taskToDelete.id);
    }
  };

  // Open edit task modal
  const handleEditTask = (task: Task) => {
    setEditTask(task);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold text-slate-900">My Tasks</h3>
              <Button
                onClick={() => setIsNewTaskModalOpen(true)}
                className="ml-auto sm:ml-0"
                size="sm"
              >
                New Task
              </Button>
            </div>

            <div className="mt-3 sm:mt-0 flex flex-col sm:flex-row gap-3">
              <TaskFilters
                statusFilter={statusFilter}
                priorityFilter={priorityFilter}
                sortOrder={sortOrder}
                onStatusChange={setStatusFilter}
                onPriorityChange={setPriorityFilter}
                onSortChange={setSortOrder}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-10 text-center">
              <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent text-indigo-600 rounded-full"></div>
              <p className="mt-2 text-sm text-slate-500">Loading tasks...</p>
            </div>
          ) : sortedTasks.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-slate-500">No tasks found.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                  >
                    Task
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                  >
                    Due Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                  >
                    Status / Priority
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                  >
                    Assigned To
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-slate-200">
                {sortedTasks.map((task) => (
                  <tr key={task.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {task.title}
                          </div>
                          <div className="text-sm text-slate-500 truncate max-w-xs">
                            {task.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">
                        {format(new Date(task.dueDate), "MMM dd, yyyy")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-2">
                        <StatusBadge status={task.status} />
                        <PriorityBadge priority={task.priority || "Unknown"} />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      <div className="flex items-center">
                        <AvatarInitials name={task.assignee?.name || "User"} />
                        <span className="ml-2">{task.assignee?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Edit Button */}
                        <button
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={() => handleEditTask(task)}
                        >
                          <i className="ri-edit-line text-lg"></i>
                        </button>
                        {/* Delete Button */}
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDeleteTask(task)}
                        >
                          <i className="ri-delete-bin-line text-lg"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination placeholder */}
          {sortedTasks.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <div className="text-sm text-slate-700">
                Showing <span className="font-medium">1</span> to{" "}
                <span className="font-medium">{sortedTasks.length}</span> of{" "}
                <span className="font-medium">{tasks?.length}</span> results
              </div>

              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Previous
                </button>
                <button className="px-3 py-1 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Task Modal */}
      {editTask && (
        <Dialog open={!!editTask} onOpenChange={() => setEditTask(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
            </DialogHeader>
            <TaskForm
              task={editTask}
              onSuccess={() => {
                setEditTask(null);
                queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
              }}
              onCancel={() => setEditTask(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {/* Delete Confirmation Dialog */}
<Dialog open={!!taskToDelete} onOpenChange={() => setTaskToDelete(null)}>
  <DialogContent className="sm:max-w-[425px] bg-white z-50">
    <DialogHeader>
      <DialogTitle>Confirm Deletion</DialogTitle>
    </DialogHeader>
    <div className="py-4">
      <p>
        Are you sure you want to delete this task? This action cannot be undone.
      </p>
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setTaskToDelete(null)}>
        Cancel
      </Button>
      <Button variant="destructive" onClick={confirmDeleteTask}>
        Delete
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

      {/* New Task Modal */}
      <Dialog open={isNewTaskModalOpen} onOpenChange={setIsNewTaskModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <TaskForm
            onSuccess={() => {
              setIsNewTaskModalOpen(false);
              queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
            }}
            onCancel={() => setIsNewTaskModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TaskList;