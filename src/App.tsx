// @ts-nocheck

import { Switch, Route,  } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./lib/authProvider";
import { Toaster } from "./components/ui/toaster";
import NotFound from "./pages/not-found";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import MyTasks from "./pages/my-tasks";
import UserManagement from "./pages/user-management";
import ProtectedRoute from "./components/layout/protected-route";
import "./index.css";
function Router() {
  return (
    <>
      <Switch>
        <Route path="/login" component={Login} />

        <Route path="/">
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        </Route>

        <Route path="/tasks">
          <ProtectedRoute>
            <MyTasks />
          </ProtectedRoute>
        </Route>

        

        <Route path="/user-management">
          <ProtectedRoute roles={["admin"]}>
            <UserManagement />
          </ProtectedRoute>
        </Route>

        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
