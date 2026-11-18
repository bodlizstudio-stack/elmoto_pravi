import { PrismaClient } from "@prisma/client";

export function resolvePostgresUrl(): string {
  const candidates = [
    process.env.DATABASE_URL,
    process.env.DIRECT_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL,
  ];

  for (const raw of candidates) {
    if (!raw) continue;
    let cleaned = raw.trim().replace(/^["']+|["']+$/g, "").trim();
    cleaned = cleaned.replace(/^(DATABASE_URL|DIRECT_URL)\s*=\s*/i, "").replace(/^["']+|["']+$/g, "").trim();
    cleaned = cleaned.replace(/:(\[([^\]]+)\])@/, ":$2@");
    if (cleaned.startsWith("postgresql://") || cleaned.startsWith("postgres://")) {
      if (cleaned.includes(":6543/") && !cleaned.includes("pgbouncer=true")) {
        cleaned = `${cleaned}${cleaned.includes("?") ? "&" : "?"}pgbouncer=true`;
      }
      return cleaned;
    }
  }
  return "";
}

export function isPostgresConfigured(): boolean {
  return Boolean(resolvePostgresUrl());
}

const resolvedUrl = resolvePostgresUrl();
if (resolvedUrl) {
  process.env.DATABASE_URL = resolvedUrl;
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(resolvedUrl ? { datasourceUrl: resolvedUrl } : undefined);

globalForPrisma.prisma = prisma;

export function assertDurableStore() {
  return;
}
