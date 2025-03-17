import { useAuth } from "@/lib/auth";
import { Link, useLocation } from "wouter";
import AvatarInitials from "@/components/ui/avatar-initials";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  
  if (!user) return null;
  
  const isAdmin = user.role === "admin";
  const isManager = user.role === "manager";
  
  // Check if path is active
  const isActivePath = (path: string) => {
    return location === path;
  };
  
  return (
    <div className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200">
      <div className="p-4 border-b border-slate-200">
        <h1 className="text-xl font-semibold text-slate-900">TaskMaster</h1>
        <p className="text-sm text-slate-500">Task Management System</p>
      </div>
      
      <div className="flex flex-col justify-between flex-1 p-4">
        <div className="space-y-8">
          {/* User Role Indicator */}
          <div className="flex items-center space-x-2 px-3 py-2 bg-slate-100 rounded-md">
            <AvatarInitials name={user.name} />
            <div>
              <p className="text-sm font-medium text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user.role}</p>
            </div>
          </div>
          
          {/* Navigation Links */}
          <nav className="space-y-1">
            <Link href="/">
              <a className={`flex items-center space-x-2 px-3 py-2 rounded-md ${
                isActivePath("/") 
                  ? "bg-indigo-50 text-indigo-700" 
                  : "text-slate-700 hover:bg-slate-100"
              }`}>
                <i className="ri-dashboard-line"></i>
                <span>Dashboard</span>
              </a>
            </Link>
            
            <Link href="/tasks">
              <a className={`flex items-center space-x-2 px-3 py-2 rounded-md ${
                isActivePath("/tasks") 
                  ? "bg-indigo-50 text-indigo-700" 
                  : "text-slate-700 hover:bg-slate-100"
              }`}>
                <i className="ri-task-line"></i>
                <span>My Tasks</span>
              </a>
            </Link>
            
            {/* Admin & Manager Only */}
            {(isAdmin || isManager) && (
              <div className="pt-2">
                <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Management
                </h3>
                
                <div className="mt-2 space-y-1">
                  <Link href="/team-management">
                    <a className={`flex items-center space-x-2 px-3 py-2 rounded-md ${
                      isActivePath("/team-management") 
                        ? "bg-indigo-50 text-indigo-700" 
                        : "text-slate-700 hover:bg-slate-100"
                    }`}>
                      <i className="ri-group-line"></i>
                      <span>Team Management</span>
                    </a>
                  </Link>
                  
                  {/* Admin Only */}
                  {isAdmin && (
                    <Link href="/user-management">
                      <a className={`flex items-center space-x-2 px-3 py-2 rounded-md ${
                        isActivePath("/user-management") 
                          ? "bg-indigo-50 text-indigo-700" 
                          : "text-slate-700 hover:bg-slate-100"
                      }`}>
                        <i className="ri-user-settings-line"></i>
                        <span>User Management</span>
                      </a>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </nav>
        </div>
        
        {/* Logout Button */}
        <div>
          <button 
            onClick={logout}
            className="flex items-center space-x-2 w-full px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-md"
          >
            <i className="ri-logout-box-line"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
