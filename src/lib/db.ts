import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prismaInstance: PrismaClient;

if (typeof window === "undefined") {
  // Server-side initialization
  const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/placeholder";
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  
  prismaInstance = globalForPrisma.prisma ?? new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
  
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prismaInstance;
  }
} else {
  // Client-side fallback to avoid compile-time issues
  prismaInstance = {} as PrismaClient;
}

export const db = prismaInstance;
export default db;
