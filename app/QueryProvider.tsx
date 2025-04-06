"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

// Define the interface for the props
interface QueryProviderProps {
  children: React.ReactNode;
}

// The provider component
export function QueryProvider({ children }: QueryProviderProps) {
  // Create a stable QueryClient instance with useState
  // to ensure it is not recreated on every render.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Default options for all queries, e.g., staleTime
            staleTime: 1000 * 60 * 5, // 5 minutes
            // refetchOnWindowFocus: false, // Optional: Disable refetch on window focus
          },
        },
      })
  );

  return (
    // Provide the client via the provider
    <QueryClientProvider client={queryClient}>
      {children}
      {/* The React Query DevTools are very useful for development */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
