import { PrismaClient } from "@prisma/client";

// Declare a global variable to hold the PrismaClient instance.
// This is necessary to retain the instance across hot reloads during development.
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Create the PrismaClient instance or use the existing global instance.
// In production mode, a new instance is always created.
// In development, the global instance is reused if it exists,
// to prevent creating a new connection on every hot reload.
export const prisma =
  global.prisma ||
  new PrismaClient({
    // Optional: Log configuration for debugging
    // log: ['query', 'info', 'warn', 'error'],
  });

// If we are in development mode, assign the created instance
// to the global variable.
if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
