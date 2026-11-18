import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureDbSynced } from "@/lib/shared-store";

export async function GET(request: Request) {
  try {
    await ensureDbSynced();
    const ids = new URL(request.url).searchParams.get("ids")?.split(",").map((id) => id.trim()).filter(Boolean).slice(0, 30) ?? [];
    if (!ids.length) return NextResponse.json([]);
    const bikes = await prisma.motorcycle.findMany({
      where: { id: { in: ids }, publication: "PUBLISHED", forSale: true },
      include: { images: { orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }], take: 1 } },
    });
    return NextResponse.json(
      bikes.map((bike) => ({
        id: bike.id,
        slug: bike.slug,
        brand: bike.brand,
        model: bike.model,
        variant: bike.variant,
        year: bike.year,
        mileageKm: bike.mileageKm,
        engineCc: bike.engineCc,
        powerKw: bike.powerKw,
        powerHp: bike.powerHp,
        transmission: bike.transmission,
        driveType: bike.driveType,
        color: bike.color,
        licenseCategory: bike.licenseCategory,
        category: bike.category,
        condition: bike.condition,
        status: bike.status,
        priceCents: bike.priceConfirmed && bike.priceCents && bike.priceCents > 0 ? bike.priceCents : null,
        priceConfirmed: Boolean(bike.priceConfirmed && bike.priceCents && bike.priceCents > 0),
        image: bike.images[0]?.url ?? null,
      })),
    );
  } catch (err) {
    const rawDb = process.env.DATABASE_URL || "";
    const rawDirect = process.env.DIRECT_URL || "";
    let diag: Record<string, unknown> = {
      hasDatabaseUrl: Boolean(rawDb),
      hasDirectUrl: Boolean(rawDirect),
      dbHasPlaceholder: rawDb.includes("YOUR-PASSWORD"),
      directHasPlaceholder: rawDirect.includes("YOUR-PASSWORD"),
      dbHasBrackets: rawDb.includes("[") || rawDb.includes("]"),
    };
    try {
      const u = new URL(rawDb.trim().replace(/^["']+|["']+$/g, ""));
      diag = { ...diag, protocol: u.protocol, username: u.username, host: u.host, pwdLen: u.password.length };
    } catch {
      diag = { ...diag, urlParseError: true };
    }
    const msg = err instanceof Error ? err.message.replace(/postgres(?:ql)?:\/\/[^\s"']+/gi, "[REDACTED_URL]") : "unknown";
    return NextResponse.json({ error: "Database connection error", detail: msg, diag }, { status: 500 });
  }
}
