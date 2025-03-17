import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../lib/authProvider";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Link } from "wouter";
import AvatarInitials from "../ui/avatar-initials";
const Header = () => {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!user) return null;

  const isAdmin = user.role === "admin";
  const isManager = user.role === "manager";

  return (
    <header className="flex items-center justify-between p-4 border-b border-slate-200 bg-white">
      {/* Mobile Menu Button */}
      <Sheet>
        <SheetTrigger asChild>
          <button className="md:hidden text-slate-500 hover:text-slate-700">
            <i className="ri-menu-line text-xl"></i>
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-slate-200">
              <h1 className="text-xl font-semibold text-slate-900">
                TaskMaster
              </h1>
              <p className="text-sm text-slate-500">Task Management System</p>
            </div>

            <div className="flex-1 p-4">
              {/* User Role */}
              <div className="flex items-center space-x-2 px-3 py-2 bg-slate-100 rounded-md mb-6">
                <AvatarInitials name={user?.name} />
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {user?.name}
                  </p>
                  <p className="text-xs text-slate-500 capitalize">
                    {user?.role}
                  </p>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-2">
                <Link href="/">
                  <a className="flex items-center space-x-2 px-3 py-2 rounded-md text-slate-700 hover:bg-slate-100">
                    <i className="ri-dashboard-line"></i>
                    <span>Dashboard</span>
                  </a>
                </Link>

                <Link href="/tasks">
                  <a className="flex items-center space-x-2 px-3 py-2 rounded-md text-slate-700 hover:bg-slate-100">
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
                        <a className="flex items-center space-x-2 px-3 py-2 rounded-md text-slate-700 hover:bg-slate-100">
                          <i className="ri-group-line"></i>
                          <span>Team Management</span>
                        </a>
                      </Link>

                      {/* Admin Only */}
                      {isAdmin && (
                        <Link href="/user-management">
                          <a className="flex items-center space-x-2 px-3 py-2 rounded-md text-slate-700 hover:bg-slate-100">
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
            <div className="p-4 border-t border-slate-200">
              <button
                onClick={logout}
                className="flex items-center space-x-2 w-full px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-md"
              >
                <i className="ri-logout-box-line"></i>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <h1 className="text-xl font-semibold text-slate-900 md:hidden">
        TaskMaster
      </h1>

      {/* Search */}
      <div className="hidden md:flex flex-1 mx-4">
        <div className="relative w-full max-w-md">
          <i className="ri-search-line absolute left-3 top-3 text-slate-400"></i>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* User Menu */}
      <div className="flex items-center space-x-4">
        <button className="p-1 text-slate-500 hover:text-slate-700 relative">
          <i className="ri-notification-3-line text-xl"></i>
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="relative" ref={dropdownRef}>
          {/* Using state instead of CSS hover for better control */}
          <button
            className="flex items-center"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <AvatarInitials name={user?.name} />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  logout();
                }}
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <i className="ri-logout-box-line mr-2"></i>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
