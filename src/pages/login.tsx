import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "../lib/authProvider";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { useLocation } from "wouter";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const { login, isLoading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate("/");
    return null;
  }

  // Define form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Form submission handler
  async function onSubmit(values: LoginFormValues) {
    await login(values.username, values.password);
  }

  // Demo credentials for easy login
  const demoCredentials = [
    { role: "Admin", username: "admin", password: "admin123" },
    { role: "Manager", username: "manager", password: "manager123" },
    { role: "User", username: "user", password: "user123" },
  ];

  // Fill form with demo credentials
  const fillCredentials = (username: string, password: string) => {
    form.setValue("username", username);
    form.setValue("password", password);
  };

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md">
          <Card className="shadow-lg">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">TaskMaster</CardTitle>
              <CardDescription>
                Enter your credentials to login to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your username"
                            {...field}
                            autoComplete="username"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter your password"
                            {...field}
                            autoComplete="current-password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    className="w-full"
                    variant="default"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </Form>

              <div className="mt-4 text-center">
                <Button
                  variant="link"
                  className="text-sm text-slate-500"
                  onClick={() => setShowDemoCredentials(!showDemoCredentials)}
                >
                  {showDemoCredentials
                    ? "Hide demo credentials"
                    : "Show demo credentials"}
                </Button>
              </div>

              {showDemoCredentials && (
                <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3">
                  <h3 className="mb-2 text-sm font-medium text-slate-700">
                    Demo Credentials:
                  </h3>
                  <div className="space-y-2">
                    {demoCredentials.map((cred) => (
                      <div
                        key={cred.role}
                        className="flex justify-between rounded-sm border border-slate-200 bg-white p-2 text-sm"
                      >
                        <div>
                          <span className="font-medium">{cred.role}:</span>{" "}
                          {cred.username} / {cred.password}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-indigo-600 hover:text-indigo-800"
                          onClick={() =>
                            fillCredentials(cred.username, cred.password)
                          }
                        >
                          Use
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="text-center text-xs text-slate-500">
              <p className="w-full">
                TaskMaster - Role-Based Task Management System
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
}
