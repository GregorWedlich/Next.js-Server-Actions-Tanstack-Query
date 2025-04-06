import { prisma } from "@/lib/prisma";

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Fetches all todos from the database.
 * This function is intended to be called server-side
 * (e.g., by the queryFn of useQuery, which can be executed server-side in Next.js).
 * @returns A promise that resolves to an array of Todo objects.
 */
export async function getTodos(): Promise<Todo[]> {
  try {
    const todos = await prisma.todo.findMany({
      orderBy: { createdAt: "desc" },
    });
    return todos;
  } catch (error) {
    console.error("Error fetching todos:", error);
    throw new Error("Failed to fetch todos from database.");
  }
}
