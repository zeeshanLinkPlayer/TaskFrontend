import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import { useAuth } from "../../lib/authProvider";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useToast } from "../../hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../lib/queryClient";
import { format } from "date-fns";

// ✅ Define Task Schema
const taskFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  status: z.enum(["pending", "in-progress", "completed"]),
  priority: z.enum(["Low", "Medium", "High", "Urgent"]),
  dueDate: z.string(),
  assigneeId: z.string().min(1, "Invalid assignee").nullable().optional(), // Expect a string
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  task?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TaskForm({ task, onSuccess, onCancel }: TaskFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  // ✅ Ensure user role is properly checked
  const isAdmin = user?.role === "admin" || user?.user?.role === "admin";
  const isManager = user?.role === "manager" || user?.user?.role === "manager";

  // ✅ Use React Hook Form with validation
  const taskFormSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(5, "Description must be at least 5 characters"),
    status: z.enum(["pending", "in-progress", "completed"]),
    priority: z.enum(["Low", "Medium", "High", "Urgent"]),
    dueDate: z.string(),
    assigneeId: isAdmin || isManager 
      ? z.string().min(1, "Assignee is required") // Required for Admins & Managers
      : z.string().optional().nullable(), // Not required for Users
  });
  
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      status: task?.status || "pending",
      priority: task?.priority || "High",
      dueDate: task?.dueDate
        ? format(new Date(task.dueDate), "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd"),
      assigneeId: isAdmin || isManager 
        ? task?.assigneeId || "" // Admins & Managers must select an assignee
        : user?.id || "", // Users auto-assign themselves
    },
  });

  // ✅ Fetch users for assignment dropdown
  const { data: users = [] } = useQuery({
    queryKey: isAdmin ? ["/api/users"] : ["/api/users/managed"],
    queryFn: async () => {
      console.log("Fetching users...");
  
      const res = await apiRequest(
        "GET",
        isAdmin ? "/api/users" : "/api/users/managed"
      );
  
      const data = typeof res.json === "function" ? await res.json() : res;
  
      console.log("Fetched Users:", data); // Debugging
  
      return data ?? [];
    },
    enabled: Boolean(isAdmin || isManager),
  });
  // ✅ Handle task creation/updating
  const taskMutation = useMutation({
    mutationFn: async (values: TaskFormValues) => {
      console.log("Submitting task...");
      const payload = { ...values, dueDate: new Date(values.dueDate) };
      return task
      ? apiRequest("PUT", `/api/tasks/${task._id}`, payload)
        : apiRequest("POST", "/api/tasks", payload);
    },
    onSuccess: () => {
      toast({
        title: task ? "Task updated" : "Task created",
        description: task
          ? "Task updated successfully."
          : "Task created successfully.",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    },
  });

  function onSubmit(values: TaskFormValues) {
    console.log("Form Values:", values); // Debugging
    taskMutation.mutate(values);
  }

  console.log("Errors:", form.formState.errors);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg mx-auto">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        {task ? "Edit Task" : "Create Task"}
      </h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Title Field */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter task title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description Field */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter task description"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Due Date Field */}
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Status & Priority Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Dropdown */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white text-black border border-gray-300">
                        <SelectValue placeholder="Select task status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white text-black border border-gray-300">
                      <SelectItem value="pending" className="hover:bg-gray-100">
                        Pending
                      </SelectItem>
                      <SelectItem value="in-progress" className="hover:bg-gray-100">
                        In Progress
                      </SelectItem>
                      <SelectItem value="completed" className="hover:bg-gray-100">
                        Completed
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Priority Dropdown */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white text-black border border-gray-300">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white text-black border border-gray-300">
                      <SelectItem value="Low" className="hover:bg-gray-100">
                        Low
                      </SelectItem>
                      <SelectItem value="Medium" className="hover:bg-gray-100">
                        Medium
                      </SelectItem>
                      <SelectItem value="High" className="hover:bg-gray-100">
                        High
                      </SelectItem>
                      <SelectItem value="Urgent" className="hover:bg-gray-100">
                        Urgent
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Assignee Dropdown */}
          {(isAdmin || isManager) && (
            <FormField
              control={form.control}
              name="assigneeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign To</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      console.log("Selected Assignee ID:", value); // Debugging
                      field.onChange(value); // Pass the string value directly
                    }}
                    defaultValue={field.value ?? undefined}
                    >
                    <FormControl>
                      <SelectTrigger className="bg-white text-black border border-gray-300">
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white text-black border border-gray-300">
                      {users.length > 0 ? (
                        users.map((user: any) => (
                          <SelectItem
                            key={user._id}
                            value={user._id} // Use the full _id as the value
                            className="hover:bg-gray-100"
                          >
                            {user.name} ({user.role})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-users" disabled className="text-gray-500">
                          No users found
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Form Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="destructive" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={taskMutation.isPending}>
              {taskMutation.isPending
                ? "Saving..."
                : task
                ? "Update Task"
                : "Create Task"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}