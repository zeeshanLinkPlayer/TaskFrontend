import { useState } from "react";
import { useAuth } from "../lib/authProvider";
import Sidebar from "../components/layout/sidebar";
import Header from "../components/layout/header";
import TaskList from "../components/tasks/task-list";
import { Button } from "../components/ui/button"; // ✅ Corrected Import
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { TaskForm } from "../components/tasks/task-form";
import { queryClient } from "../lib/queryClient";

export default function MyTasks() {
  const { user } = useAuth();
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-slate-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Task List Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">My Tasks</h2>
                <p className="text-slate-500">Manage your tasks</p>
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

            {/* Task List */}
            <TaskList />
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
