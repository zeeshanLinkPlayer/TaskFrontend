import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../lib/authProvider";
import Sidebar from "../components/layout/sidebar";
import Header from "../components/layout/header";
import StatCard from "../components/dashboard/stat-card";
import TaskList from "../components/tasks/task-list";
import UserList from "../components/users/user-list";
import { Button } from "../components/ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { TaskForm } from "../components/tasks/task-form";
import { queryClient } from "../lib/queryClient";
import { API_BASE_URL } from "../config/config";

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);

  const TaskStatus = {
    PENDING: "pending",
    IN_PROGRESS: "in_progress",
    COMPLETED: "completed",
  };

  const fetchTasks = async () => {
    const token = localStorage.getItem("auth_token");

    const res = await fetch(`${API_BASE_URL}/api/tasks`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      if (res.status === 403) throw new Error("Unauthorized: Access Denied");
      throw new Error("Failed to fetch tasks");
    }

    const data = await res.json();
    console.log("Fetched tasks:", data); // Debugging: Check if completed tasks exist
    return data;
  };

  // Fetch tasks using React Query
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ["/api/tasks"],
    queryFn: fetchTasks,
  });

  // Stats calculation
  const taskStats = {
    pending: tasks?.filter((task: any) => task.status.toLowerCase() === TaskStatus.PENDING).length || 0,
    inProgress: tasks?.filter((task: any) => task.status.toLowerCase() === TaskStatus.IN_PROGRESS).length || 0,
    completed: tasks?.filter((task: any) => task.status.toLowerCase() === TaskStatus.COMPLETED).length || 0,
  };

  console.log("Pending:", taskStats.pending, "In Progress:", taskStats.inProgress, "Completed:", taskStats.completed);

  return (
    <div className="flex h-screen w-full bg-slate-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
                <p className="text-slate-500">Welcome back, {user?.name}!</p>
              </div>

              <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => setIsNewTaskModalOpen(true)}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  <i className="ri-add-line mr-1 text-white"></i>
                  <span>New Task</span>
                </Button>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <StatCard
                title="Pending Tasks"
                value={taskStats.pending}
                icon={<i className="ri-time-line text-xl"></i>}
                iconBgColor="bg-indigo-100"
                iconColor="text-indigo-600"
              />

              <StatCard
                title="In Progress"
                value={taskStats.inProgress}
                icon={<i className="ri-loader-4-line text-xl"></i>}
                iconBgColor="bg-amber-100"
                iconColor="text-amber-600"
              />

              <StatCard
                title="Completed"
                value={taskStats.completed}
                icon={<i className="ri-check-double-line text-xl"></i>}
                iconBgColor="bg-emerald-100"
                iconColor="text-emerald-600"
              />
            </div>

            {/* Task List */}
            <TaskList />

            {/* User Management (Admin Only) */}
            {isAdmin && <UserList />}
          </div>
        </main>
      </div>

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
    </div>
  );
}
