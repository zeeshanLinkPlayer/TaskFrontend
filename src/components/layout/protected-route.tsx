import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../../lib/authProvider";
import { useToast } from "../../hooks/use-toast";
// @ts-nocheck

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: string[];
}

const ProtectedRoute = ({ children, roles = [] }: ProtectedRouteProps) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate("/login");
        return;
      }

      // Check role-based access if roles are specified
      if (roles.length > 0 && user) {
        const authenticrole = user?.user?.role || user?.role;
        if (!roles.includes(authenticrole)) {
          toast({
            variant: "destructive",
            title: "Access denied",
            description: "You don't have permission to access this page.",
          });
          navigate("/"); // Redirect to home if the user doesn't have the required role
        }
      }
    }
  }, [isLoading, isAuthenticated, user, roles, navigate, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-lg font-medium text-slate-700">
          Loading...
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
};

export default ProtectedRoute;
