// @ts-nocheck

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../lib/authProvider";
import Sidebar from "../components/layout/sidebar";
import Header from "../components/layout/header";
import AvatarInitials from "../components/ui/avatar-initials";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { TaskForm } from "../components/tasks/task-form";
import { queryClient } from "../lib/queryClient";
import StatusBadge from "../components/ui/status-badge";
import { format } from "date-fns";

export default function TeamManagement() {
  const { user } = useAuth();
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [selectedTeamMember, setSelectedTeamMember] = useState<number | null>(
    null
  );

  // Fetch team members (users managed by current user)
  const { data: teamMembers, isLoading: loadingTeam } = useQuery({
    queryKey: ["/api/users/managed"],
  });

  // Fetch all tasks
  const { data: tasks, isLoading: loadingTasks } = useQuery({
    queryKey: ["/api/tasks"],
  });

  // Filter tasks for team members
  const getTeamMemberTasks = (userId: number) => {
    if (!Array.isArray(tasks)) return []; // Ensure tasks is an array
    return tasks.filter((task: any) => task.assigneeId === userId);
  };
  return (
    <div className="flex h-screen w-full bg-slate-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Team Management Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Team Management
                </h2>
                <p className="text-slate-500">
                  Manage your team and their tasks
                </p>
              </div>

              <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
                <Button onClick={() => setIsNewTaskModalOpen(true)}>
                  <i className="ri-add-line mr-1"></i>
                  <span>Assign Task</span>
                </Button>
              </div>
            </div>

            {/* Team Members */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Your Team
              </h3>

              {loadingTeam ? (
                <div className="text-center py-10">
                  <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent text-indigo-600 rounded-full"></div>
                  <p className="mt-2 text-sm text-slate-500">
                    Loading team members...
                  </p>
                </div>
              ) : !teamMembers || teamMembers.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-slate-500">
                      No team members found.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teamMembers.map((member: any) => (
                    <Card
                      key={member.id}
                      className="overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center space-x-3">
                          <AvatarInitials
                            name={member.name}
                            className="h-10 w-10 text-sm"
                          />
                          <div>
                            <CardTitle className="text-base">
                              {member.name}
                            </CardTitle>
                            <p className="text-xs text-slate-500">
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-slate-500">
                              Task Summary:
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-indigo-50 rounded p-2">
                              <p className="text-xs text-slate-500">Pending</p>
                              <p className="font-semibold text-indigo-600">
                                {
                                  getTeamMemberTasks(member.id).filter(
                                    (t: any) => t.status === "pending"
                                  ).length
                                }
                              </p>
                            </div>
                            <div className="bg-amber-50 rounded p-2">
                              <p className="text-xs text-slate-500">
                                In Progress
                              </p>
                              <p className="font-semibold text-amber-600">
                                {
                                  getTeamMemberTasks(member.id).filter(
                                    (t: any) => t.status === "in-progress"
                                  ).length
                                }
                              </p>
                            </div>
                            <div className="bg-emerald-50 rounded p-2">
                              <p className="text-xs text-slate-500">
                                Completed
                              </p>
                              <p className="font-semibold text-emerald-600">
                                {
                                  getTeamMemberTasks(member.id).filter(
                                    (t: any) => t.status === "completed"
                                  ).length
                                }
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 flex justify-end">
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedTeamMember(member.id);
                                setIsNewTaskModalOpen(true);
                              }}
                            >
                              Assign Task
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Team Tasks */}
            {teamMembers && teamMembers.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 md:p-6 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Team Tasks
                  </h3>
                </div>

                <Tabs defaultValue="all" className="w-full">
                  <div className="px-4 md:px-6 pt-2">
                    <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3 md:grid-cols-4">
                      <TabsTrigger value="all">All Tasks</TabsTrigger>
                      <TabsTrigger value="pending">Pending</TabsTrigger>
                      <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                      <TabsTrigger value="completed">Completed</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="all" className="p-0">
                    {renderTaskTable(tasks, teamMembers)}
                  </TabsContent>

                  <TabsContent value="pending" className="p-0">
                    {renderTaskTable(
                      tasks?.filter((t: any) => t.status === "pending"),
                      teamMembers
                    )}
                  </TabsContent>

                  <TabsContent value="in-progress" className="p-0">
                    {renderTaskTable(
                      tasks?.filter((t: any) => t.status === "in-progress"),
                      teamMembers
                    )}
                  </TabsContent>

                  <TabsContent value="completed" className="p-0">
                    {renderTaskTable(
                      tasks?.filter((t: any) => t.status === "completed"),
                      teamMembers
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* New Task Modal */}
      <Dialog open={isNewTaskModalOpen} onOpenChange={setIsNewTaskModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign New Task</DialogTitle>
          </DialogHeader>
          <TaskForm
            onSuccess={() => {
              setIsNewTaskModalOpen(false);
              setSelectedTeamMember(null);
              queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
            }}
            onCancel={() => {
              setIsNewTaskModalOpen(false);
              setSelectedTeamMember(null);
            }}
            task={
              selectedTeamMember
                ? { assigneeId: selectedTeamMember }
                : undefined
            }
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper function to render task table
function renderTaskTable(tasks: any[], teamMembers: any[]) {
  // Filter tasks to only include those assigned to team members
  const teamMemberIds = teamMembers.map((m) => m.id);
  const filteredTasks = tasks?.filter((task: any) =>
    teamMemberIds.includes(task.assigneeId)
  );

  if (!filteredTasks || filteredTasks.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-slate-500">No tasks found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
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
              Status
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
            >
              Assigned To
            </th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-slate-200">
          {filteredTasks.map((task: any) => (
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
                <StatusBadge status={task.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                <div className="flex items-center">
                  <AvatarInitials name={task.assignee?.name || "User"} />
                  <span className="ml-2">{task.assignee?.name}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
