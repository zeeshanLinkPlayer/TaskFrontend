// @ts-nocheck

import { QueryClient, QueryFunction } from "@tanstack/react-query";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || process.env.REACT_APP_API_BASE_URL || "";

// Utility function to throw an error if response is not OK
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// API request function
export async function apiRequest(
  method: string,
  endpoint: string,
  data?: unknown,
  additionalHeaders?: Record<string, string> // Optional additional headers
): Promise<Response> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem("auth_token");

  // Default headers
  const headers: Record<string, string> = {
    ...(data && { "Content-Type": "application/json" }), // Add Content-Type if data is present
    ...(token && { Authorization: `Bearer ${token}` }), // Add Authorization header if token exists
    ...additionalHeaders, // Merge additional headers if provided
  };

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const endpoint = queryKey[0] as string;
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem("auth_token");

    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(url, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

// React Query Client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});