"use client";
import { useQuery } from "@tanstack/react-query";
import { type Todo } from "@/lib/queries/getTodos";

import { TodoItem } from "./TodoItem";

// Function to fetch todos from our API endpoint
async function fetchTodos(): Promise<Todo[]> {
  const response = await fetch("/api/todos");
  if (!response.ok) {
    // Attempt to extract error details from the JSON response
    const errorData = await response.json().catch(() => ({})); // Fallback in case of parsing errors
    throw new Error(
      errorData?.details || errorData?.error || "Failed to fetch todos"
    );
  }
  return response.json();
}

export function TodoList() {
  // Use useQuery to fetch the todos
  const {
    data: todos,
    isLoading,
    isError,
    error,
  } = useQuery<Todo[], Error>({
    // queryKey remains the same
    queryKey: ["todos"],
    // queryFn now calls our fetchTodos function
    queryFn: fetchTodos,
  });

  if (isLoading)
    return (
      <div className="text-center text-gray-500">
        <p>Loading todos...</p>
      </div>
    );
  if (isError)
    return (
      <div className="text-center text-red-600 bg-red-100 p-4 rounded-md">
        <p>Error: {error?.message}</p>
      </div>
    );

  return (
    <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
      <h1 className="text-2xl font-semibold mb-4 text-center text-gray-800">
        My Todos
      </h1>
      {todos && todos.length > 0 ? (
        <ul className="space-y-3">
          {/* Render a TodoItem component for each todo */}
          {todos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} />
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500">No todos yet!</p>
      )}
    </div>
  );
}
