import { PrismaClient } from "@prisma/client";

function extractCleanPostgresUrl(raw: string | undefined): string {
  if (!raw) return "";
  const match = raw.match(/postgres(?:ql)?:\/\/[^\s"']+/i);
  let cleaned = match ? match[0].trim() : raw.trim().replace(/^["']+|["']+$/g, "").trim();
  cleaned = cleaned.replace(/:[<\[]([^>\]@]+)[>\]]@/, ":$1@");
  if (cleaned.startsWith("postgresql://") || cleaned.startsWith("postgres://")) {
    if (cleaned.includes(".pooler.supabase.com") && /^postgres(?:ql)?:\/\/postgres:/i.test(cleaned)) {
      cleaned = cleaned.replace(/^(postgres(?:ql)?:\/\/)postgres:/i, "$1postgres.cewjffougzewilewyjpc:");
    }
    if (cleaned.includes(":6543/") && !cleaned.includes("pgbouncer=true")) {
      cleaned = `${cleaned}${cleaned.includes("?") ? "&" : "?"}pgbouncer=true`;
    }
    return cleaned;
  }
  return "";
}

export function resolvePostgresUrl(): string {
  const candidates = [
    process.env.DATABASE_URL,
    process.env.DIRECT_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL,
  ];

  // 1. Najprej poišči kandidat, ki nima placeholderja YOUR-PASSWORD / GESLO
  for (const raw of candidates) {
    if (!raw || raw.includes("YOUR-PASSWORD") || raw.includes("VASE-GESLO") || raw.includes("GESLO")) continue;
    const url = extractCleanPostgresUrl(raw);
    if (url) return url;
  }

  // 2. Fallback na kateregakoli veljavnega kandidata
  for (const raw of candidates) {
    const url = extractCleanPostgresUrl(raw);
    if (url) return url;
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
