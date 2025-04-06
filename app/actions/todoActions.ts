"use server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export interface ActionResult {
  success: boolean;
  error?: string;
}

/**
 * Server action for adding a new todo.
 * Accepts FormData from a form.
 * @param formData The data submitted by the form.
 * @returns A promise that resolves to an ActionResult object.
 */
export async function addTodo(formData: FormData): Promise<ActionResult> {
  // Extract the title from the form data
  const title = formData.get("title") as string;

  // Simple validation: Check if the title exists and is not just whitespace
  if (!title || title.trim().length === 0) {
    return { success: false, error: "Title cannot be empty." };
  }

  try {
    await prisma.todo.create({
      data: {
        title: title.trim(),
      },
    });

    console.log(`Todo added: ${title.trim()}`);
    return { success: true };
  } catch (error) {
    console.error("Error adding todo:", error);
    return {
      success: false,
      error: "Failed to add todo to the database. Please try again.",
    };
  }
}

/**
 * Server action for toggling the 'completed' status of a todo.
 * @param formData Must contain 'id' and 'completed' (as a string 'true'/'false').
 * @returns A promise that resolves to an ActionResult object.
 */
export async function toggleTodoStatus(
  formData: FormData
): Promise<ActionResult> {
  const id = formData.get("id") as string;
  const completed = formData.get("completed") === "true"; // Convert string to boolean

  if (!id) {
    return { success: false, error: "Todo ID is required." };
  }

  try {
    await prisma.todo.update({
      where: { id },
      data: { completed },
    });
    console.log(`Todo ${id} status toggled to ${completed}`);
    return { success: true };
  } catch (error) {
    console.error(`Error toggling todo ${id}:`, error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025" // Prisma code for "Record to update not found."
    ) {
      return { success: false, error: "Todo not found." };
    }
    return {
      success: false,
      error: "Failed to update todo status. Please try again.",
    };
  }
}

/**
 * Server action for deleting a todo.
 * @param formData Must contain 'id'.
 * @returns A promise that resolves to an ActionResult object.
 */
export async function deleteTodo(formData: FormData): Promise<ActionResult> {
  const id = formData.get("id") as string;

  if (!id) {
    return { success: false, error: "Todo ID is required." };
  }

  try {
    await prisma.todo.delete({
      where: { id },
    });
    console.log(`Todo ${id} deleted`);
    return { success: true };
  } catch (error) {
    console.error(`Error deleting todo ${id}:`, error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025" // Prisma code for "Record to delete not found."
    ) {
      return { success: false, error: "Todo not found." };
    }
    return {
      success: false,
      error: "Failed to delete todo. Please try again.",
    };
  }
}
