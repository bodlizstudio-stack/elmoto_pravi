import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  fetchAvtoNetListing,
  isSyncSupported,
  validateAvtoNetUrl,
  type AvtoNetImportResponse,
} from "@/lib/avtonet-import";
import { displayName } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await readSession();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json(
      { ok: false, error: "Prijava skrbnika je potrebna.", syncSupported: false } satisfies AvtoNetImportResponse,
      { status: 401 },
    );
  }

  let body: { url?: string; pastedContent?: string };
  try {
    body = (await request.json()) as { url?: string; pastedContent?: string };
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Vnesite veljavno povezavo do oglasa na Avto.net.",
        syncSupported: isSyncSupported(),
      } satisfies AvtoNetImportResponse,
      { status: 400 },
    );
  }

  const rawUrl = String(body.url ?? "").trim();
  const pastedContent = String(body.pastedContent ?? "").trim();

  const validation = validateAvtoNetUrl(rawUrl);
  if (!validation.valid || !validation.normalizedUrl) {
    return NextResponse.json(
      {
        ok: false,
        error: validation.error || "Vnesite veljavno povezavo do oglasa na Avto.net.",
        syncSupported: isSyncSupported(),
      } satisfies AvtoNetImportResponse,
      { status: 400 },
    );
  }

  // Check for existing duplicate motorcycle by externalId or sourceUrl
  const duplicateConditions: Record<string, unknown>[] = [
    { sourceUrl: validation.normalizedUrl },
    { source: validation.normalizedUrl },
  ];
  if (validation.externalId) {
    duplicateConditions.unshift({ externalId: validation.externalId });
  }

  const existing = await prisma.motorcycle.findFirst({
    where: { OR: duplicateConditions },
    select: { id: true, slug: true, brand: true, model: true, variant: true, updatedAt: true },
  });

  const duplicate = existing
    ? {
        id: existing.id,
        slug: existing.slug,
        title: displayName(existing),
        updatedAt: existing.updatedAt.toISOString(),
      }
    : null;

  const result = await fetchAvtoNetListing({
    url: validation.normalizedUrl,
    pastedContent,
  });

  if (!result.ok || !result.data) {
    return NextResponse.json(
      {
        ok: false,
        error: result.error || "Podatkov oglasa ni bilo mogoče pridobiti.",
        syncSupported: isSyncSupported(),
        duplicate,
      } satisfies AvtoNetImportResponse,
      { status: 422 },
    );
  }

  return NextResponse.json({
    ok: true,
    warning: result.warning,
    cloudflareBlocked: result.cloudflareBlocked,
    syncSupported: isSyncSupported(),
    duplicate,
    data: result.data,
  } satisfies AvtoNetImportResponse);
}
