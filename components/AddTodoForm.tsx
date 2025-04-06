"use client";

import { addTodo, type ActionResult } from "@/app/actions/todoActions"; // Use ActionResult
import { type Todo } from "@/lib/queries/getTodos"; // Import Todo type
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";

interface AddTodoContext {
  previousTodos?: Todo[];
}

export function AddTodoForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // useMutation hook for the addTodo action with optimistic updates
  const { mutate, isPending } = useMutation<
    ActionResult,
    Error,
    FormData,
    AddTodoContext
  >({
    mutationFn: addTodo,
    // Optimistic update logic
    onMutate: async (newTodoFormData) => {
      setErrorMessage(null); // Reset error
      // Cancel ongoing queries for 'todos'
      await queryClient.cancelQueries({ queryKey: ["todos"] });

      // Snapshot of the previous state
      const previousTodos = queryClient.getQueryData<Todo[]>(["todos"]);

      // Create a new optimistic todo (with temporary ID)
      const title = newTodoFormData.get("title") as string;
      const tempId = `temp-${Date.now()}`;
      const optimisticTodo: Todo = {
        id: tempId, // Temporary ID
        title: title ? title.trim() : "...", // Title from FormData or placeholder
        completed: false,
        createdAt: new Date(), // Current date as placeholder
        updatedAt: new Date(),
        // Optional: A flag to mark optimistic todos
        // isOptimistic?: true;
      };

      // Update cache optimistically
      queryClient.setQueryData<Todo[]>(["todos"], (oldTodos = []) => [
        optimisticTodo,
        ...oldTodos,
      ]);

      console.log("Optimistic update applied for:", optimisticTodo.title);

      // Return context with previous state
      return { previousTodos };
    },
    onError: (error, _variables, context) => {
      // Rollback in case of error
      console.error("Mutation error, rolling back optimistic update:", error);
      setErrorMessage(error.message || "Failed to submit the form.");
      // Restore the previous state from the context
      if (context?.previousTodos) {
        queryClient.setQueryData(["todos"], context.previousTodos);
        console.log("Optimistic update rolled back.");
      }
    },
    onSuccess: (data, variables, context) => {
      // Called when the mutationFn was successful
      if (data.success) {
        console.log("Server confirmed todo addition.");
        formRef.current?.reset();
        setErrorMessage(null);
        // Invalidating is still important here to replace the temporary todo
        // with the real one from the server (with correct ID, etc.).
        queryClient.invalidateQueries({ queryKey: ["todos"] });
      } else {
        // If the action returns { success: false }, perform a rollback
        console.error("Server action failed:", data.error);
        setErrorMessage(data.error || "An unknown server error occurred.");
        if (context?.previousTodos) {
          queryClient.setQueryData(["todos"], context.previousTodos);
          console.log(
            "Optimistic update rolled back due to server action failure."
          );
        }
      }
    },
    onSettled: () => {
      // Always executed after onSuccess or onError
      // Could also be used for invalidation, but it's fine in onSuccess
      // since we only want to invalidate on success to replace the temp item.
      console.log("Mutation settled.");
    },
  });

  // Function called when the form is submitted
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); // Prevent default form submission
    const formData = new FormData(event.currentTarget); // Collect form data
    const title = formData.get("title") as string; // Get title for validation

    // Client-side validation (optional, in addition to server action validation)
    if (!title || title.trim().length === 0) {
      setErrorMessage("Title cannot be empty.");
      return;
    }

    setErrorMessage(null);
    mutate(formData);
  }

  return (
    // Use onSubmit instead of action
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 p-4 bg-white shadow-md rounded-lg mt-8 w-full max-w-md"
    >
      <div className="flex items-center gap-2">
        <input
          type="text"
          name="title"
          placeholder="Add a new todo..."
          required
          disabled={isPending} // Disable while loading
          className="flex-grow p-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:bg-gray-100" // Added text color, changed focus ring
        />
        <button
          type="submit"
          disabled={isPending} // Disable while loading
          className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50" // Changed colors
        >
          {isPending ? "Adding..." : "Add"}
        </button>
      </div>
      {errorMessage && (
        <p className="text-sm text-red-700 bg-red-50 p-2 rounded-md">
          {/* Adjusted colors */}
          Error: {errorMessage}
        </p>
      )}
    </form>
  );
}
