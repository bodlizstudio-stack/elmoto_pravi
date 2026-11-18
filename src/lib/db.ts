import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

export function isPostgresConfigured(): boolean {
  const url = (process.env.DATABASE_URL || "").trim();
  return url.startsWith("postgresql://") || url.startsWith("postgres://");
}

function databaseUrl() {
  if (isPostgresConfigured()) {
    return (process.env.DATABASE_URL || "").trim();
  }
  const target = "/tmp/elmoto.db";
  if (!fs.existsSync(target)) {
    fs.copyFileSync(path.join(process.cwd(), "prisma", "catalog.db"), target);
  }
  return `file:${target}`;
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(
    isPostgresConfigured()
      ? { datasourceUrl: (process.env.DATABASE_URL || "").trim() }
      : process.env.VERCEL
        ? { datasourceUrl: databaseUrl() }
        : undefined,
  );

globalForPrisma.prisma = prisma;

export function assertDurableStore() {
  return;
}
