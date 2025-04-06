import { NextResponse } from "next/server";
import { getTodos } from "@/lib/queries/getTodos"; // Import our server function

/**
 * API Route Handler for fetching all todos.
 * Called by client-side useQuery.
 */
export async function GET() {
  try {
    // Call the server-side function that uses Prisma
    const todos = await getTodos();

    return NextResponse.json(todos);
  } catch (error) {
    console.error("API Error fetching todos:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: "Failed to fetch todos", details: errorMessage },
      { status: 500 }
    );
  }
}
