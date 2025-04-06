"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type Todo } from "@/lib/queries/getTodos";
import {
  toggleTodoStatus,
  deleteTodo,
  type ActionResult,
} from "@/app/actions/todoActions";

interface TodoItemProps {
  todo: Todo;
}

interface ToggleTodoVariables {
  id: string;
  completed: boolean;
}

interface DeleteTodoVariables {
  id: string;
}

interface TodoItemContext {
  previousTodos?: Todo[];
}

export function TodoItem({ todo }: TodoItemProps) {
  const queryClient = useQueryClient();
  const [itemError, setItemError] = useState<string | null>(null);

  // --- Mutation for toggling the status (with optimistic update) ---
  const { mutate: mutateToggle, isPending: isToggling } = useMutation<
    ActionResult,
    Error,
    ToggleTodoVariables,
    TodoItemContext
  >({
    mutationFn: async ({ id, completed }) => {
      const formData = new FormData();
      formData.append("id", id);
      formData.append("completed", String(completed));
      return toggleTodoStatus(formData);
    },
    onMutate: async (variables) => {
      setItemError(null);
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["todos"] });

      // Snapshot the previous value
      const previousTodos = queryClient.getQueryData<Todo[]>(["todos"]);

      // Optimistically update to the new value
      queryClient.setQueryData<Todo[]>(["todos"], (oldTodos = []) =>
        oldTodos.map((t) =>
          t.id === variables.id ? { ...t, completed: variables.completed } : t
        )
      );
      console.log(
        `Optimistic toggle for ${variables.id} to ${variables.completed}`
      );

      // Return a context object with the snapshotted value
      return { previousTodos };
    },
    onError: (error, variables, context) => {
      console.error("Error toggling todo, rolling back:", error);
      setItemError(error.message || "An error occurred.");
      // Rollback to the previous value
      if (context?.previousTodos) {
        queryClient.setQueryData(["todos"], context.previousTodos);
        console.log("Optimistic toggle rolled back.");
      }
    },
    onSuccess: (data, variables, context) => {
      if (data.success) {
        console.log(`Server confirmed toggle for ${variables.id}`);
        setItemError(null);
        // Invalidate after success to fetch server data (if needed, e.g., updatedAt)
        // and ensure the cache is consistent.
        queryClient.invalidateQueries({ queryKey: ["todos"] });
      } else {
        // Rollback if the action fails
        console.error("Server action failed for toggle:", data.error);
        setItemError(data.error || "Failed to toggle status.");
        if (context?.previousTodos) {
          queryClient.setQueryData(["todos"], context.previousTodos);
          console.log("Optimistic toggle rolled back due to server failure.");
        }
      }
    },
    onSettled: () => {
      // Always executed
      console.log(`Toggle mutation settled for ${todo.id}`);
      // Could also invalidate here, but onSuccess is more precise for syncing
    },
  });

  // --- Mutation for deleting (with optimistic update) ---
  const { mutate: mutateDelete, isPending: isDeleting } = useMutation<
    ActionResult,
    Error,
    DeleteTodoVariables,
    TodoItemContext
  >({
    mutationFn: async ({ id }) => {
      const formData = new FormData();
      formData.append("id", id);
      return deleteTodo(formData);
    },
    onMutate: async (variables) => {
      setItemError(null);
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["todos"] });

      // Snapshot previous value
      const previousTodos = queryClient.getQueryData<Todo[]>(["todos"]);

      // Optimistically remove the todo
      queryClient.setQueryData<Todo[]>(["todos"], (oldTodos = []) =>
        oldTodos.filter((t) => t.id !== variables.id)
      );
      console.log(`Optimistic delete for ${variables.id}`);

      return { previousTodos };
    },
    onError: (error, variables, context) => {
      console.error("Error deleting todo, rolling back:", error);
      setItemError(error.message || "An error occurred.");
      // Rollback
      if (context?.previousTodos) {
        queryClient.setQueryData(["todos"], context.previousTodos);
        console.log("Optimistic delete rolled back.");
      }
    },
    onSuccess: (data, variables, context) => {
      if (data.success) {
        console.log(`Server confirmed delete for ${variables.id}`);
        setItemError(null);
        // Invalidate after success to ensure the cache is consistent
        // (even though the item is gone, other things might have changed)
        queryClient.invalidateQueries({ queryKey: ["todos"] });
      } else {
        // Rollback if the action fails
        console.error("Server action failed for delete:", data.error);
        setItemError(data.error || "Failed to delete todo.");
        if (context?.previousTodos) {
          queryClient.setQueryData(["todos"], context.previousTodos);
          console.log("Optimistic delete rolled back due to server failure.");
        }
      }
    },
    onSettled: () => {
      console.log(`Delete mutation settled for ${todo.id}`);
    },
  });

  // Handler for checkbox change
  function handleToggle() {
    setItemError(null);
    mutateToggle({ id: todo.id, completed: !todo.completed });
  }

  // Handler for delete button
  function handleDelete() {
    setItemError(null);
    if (confirm(`Are you sure you want to delete "${todo.title}"?`)) {
      mutateDelete({ id: todo.id });
    }
  }

  // Combined pending state
  const isPending = isToggling || isDeleting;

  return (
    <li
      className={`p-3 rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 transition-opacity ${
        isPending ? "opacity-50" : "opacity-100"
      } ${
        todo.completed
          ? "bg-green-100 text-green-800"
          : "bg-gray-100 text-gray-700"
      }`}
    >
      <div className="flex items-center gap-3 flex-grow">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggle}
          disabled={isPending}
          id={`todo-check-${todo.id}`}
          className="h-5 w-5 rounded border-gray-300 text-gray-600 focus:ring-gray-500 disabled:opacity-70" // Updated colors
        />
        <label
          htmlFor={`todo-check-${todo.id}`}
          className={`flex-grow ${
            todo.completed ? "line-through text-green-700" : ""
          }`}
        >
          {todo.title}
        </label>
      </div>
      {/* Corrected: Only one opening div here */}
      <div className="flex items-center gap-2 self-end sm:self-center">
        {/* Error display for this item */}
        {itemError && (
          <span className="text-xs text-red-700 bg-red-50 px-2 py-1 rounded-md mr-2">
            Error: {itemError}
          </span>
        )}
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 disabled:opacity-50" // Updated colors
          aria-label={`Delete todo: ${todo.title}`}
        >
          Delete
        </button>
      </div>
    </li>
  );
}
