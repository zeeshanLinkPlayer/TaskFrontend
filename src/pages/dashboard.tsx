import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import StatCard from "@/components/dashboard/stat-card";
import TaskList from "@/components/tasks/task-list";
import UserList from "@/components/users/user-list";
import { TaskStatus } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TaskForm } from "@/components/tasks/task-form";
import { queryClient } from "@/lib/queryClient";

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  
  // Fetch tasks
  const { data: tasks, isLoading } = useQuery({
    queryKey: ["/api/tasks"],
  });
  
  // Stats calculation
  const taskStats = {
    pending: tasks ? tasks.filter((task: any) => task.status === TaskStatus.PENDING).length : 0,
    inProgress: tasks ? tasks.filter((task: any) => task.status === TaskStatus.IN_PROGRESS).length : 0,
    completed: tasks ? tasks.filter((task: any) => task.status === TaskStatus.COMPLETED).length : 0,
  };
  
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
                <Button onClick={() => setIsNewTaskModalOpen(true)}>
                  <i className="ri-add-line mr-1"></i>
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
