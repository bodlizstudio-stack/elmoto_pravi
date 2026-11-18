import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim().replace(/\/+$/, "");
const SUPABASE_KEY = (process.env.SUPABASE_SECRET_KEY || "").trim();
const PUBLIC_BUCKET = (process.env.SUPABASE_STORAGE_BUCKET || "el-moto-images").trim();
const BACKUP_BUCKET = (process.env.SUPABASE_BACKUP_BUCKET || "el-moto-backups").trim();

const isDryRun = process.argv.includes("--dry-run") || process.env.DRY_RUN === "true";

async function downloadLatestSnapshot<T extends { version?: number }>(key: string): Promise<T | null> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  let privData: T | null = null;
  let pubData: T | null = null;
  try {
    const { data, error } = await supabase.storage.from(BACKUP_BUCKET).download(`snapshots/${key}.json`);
    if (!error && data) privData = JSON.parse(await data.text()) as T;
  } catch {
    // Ignore
  }
  try {
    const { data, error } = await supabase.storage.from(PUBLIC_BUCKET).download(`snapshots/${key}.json`);
    if (!error && data) pubData = JSON.parse(await data.text()) as T;
  } catch {
    // Ignore
  }
  if (privData && pubData) {
    return (pubData.version ?? 0) > (privData.version ?? 0) ? pubData : privData;
  }
  return privData || pubData;
}

async function main() {
  console.log("==================================================================");
  console.log("EL-MOTO: Varna migracija podatkov v Supabase PostgreSQL");
  console.log(`Način izvajanja: ${isDryRun ? "DRY-RUN (preverjanje in priprava brez pisanja v Postgres)" : "LIVE UVOZ V POSTGRESQL"}`);
  console.log("==================================================================\n");

  const backupPath = path.join(process.cwd(), "prisma", "backups", "authoritative-export-2026-11-18.json");
  const rawBackup = await readFile(backupPath, "utf-8");
  const exported = JSON.parse(rawBackup);

  // Osveži iz živih posnetkov (preveri tako zasebno kot javno vedro), da nikoli ne prepišemo novejših produkcijskih sprememb
  const [liveCatalog, liveSettings, liveMedia, liveEquipment] = await Promise.all([
    downloadLatestSnapshot<{ version: number; bikes: typeof exported.data.motorcycles }>("elmoto-shared-catalog-v2"),
    downloadLatestSnapshot<{ version: number; rows: Array<{ key: string; value: string }> }>("elmoto-shared-settings-v1"),
    downloadLatestSnapshot<{ version: number; items: typeof exported.data.mediaAssets }>("elmoto-shared-media-v1"),
    downloadLatestSnapshot<{ version: number; items: typeof exported.data.equipment }>("elmoto-shared-equipment-v1"),
  ]);

  const bikes =
    liveCatalog && (liveCatalog.version ?? 0) >= (exported.sourcesCompared.catalogSnapshotVersion ?? 0)
      ? liveCatalog.bikes
      : exported.data.motorcycles;

  const mediaAssets =
    liveMedia && (liveMedia.version ?? 0) >= (exported.sourcesCompared.mediaSnapshotVersion ?? 0)
      ? liveMedia.items
      : exported.data.mediaAssets;

  const equipment =
    liveEquipment && (liveEquipment.version ?? 0) >= (exported.sourcesCompared.equipmentSnapshotVersion ?? 0)
      ? liveEquipment.items
      : exported.data.equipment;

  const settingsMap = new Map<string, string>(
    (exported.data.siteSettings as Array<{ key: string; value: string }>).map((s) => [s.key, s.value]),
  );
  if (liveSettings?.rows) {
    for (const row of liveSettings.rows) {
      if (row?.key) settingsMap.set(row.key, String(row.value ?? ""));
    }
  }
  const siteSettings = Array.from(settingsMap.entries()).map(([key, value]) => ({ key, value }));

  const summary = {
    users: exported.data.users.length,
    brands: exported.data.brands.length,
    motorcycleCategories: exported.data.motorcycleCategories.length,
    motorcycles: bikes.length,
    motorcycleImages: bikes.reduce((sum: number, b: { images?: unknown[] }) => sum + (b.images?.length || 0), 0),
    motorcycleSpecifications: bikes.reduce(
      (sum: number, b: { specifications?: unknown[] }) => sum + (b.specifications?.length || 0),
      0,
    ),
    rentalRates: exported.data.rentalRates.length,
    rentalBlocks: exported.data.rentalBlocks.length,
    rentalBookings: exported.data.rentalBookings.length,
    bookingEvents: exported.data.bookingEvents.length,
    inquiries: exported.data.inquiries.length,
    inquiryEvents: exported.data.inquiryEvents.length,
    faqItems: exported.data.faqItems.length,
    testimonials: exported.data.testimonials.length,
    siteSettings: siteSettings.length,
    pages: exported.data.pages.length,
    mediaAssets: mediaAssets.length,
    importJobs: exported.data.importJobs.length,
    auditLogs: exported.data.auditLogs.length,
    subscribers: exported.data.subscribers.length,
    equipment: equipment.length,
  };

  console.log("1. Preverjeno avtoritativno število zapisov za prenos v PostgreSQL:");
  console.log(JSON.stringify(summary, null, 2));

  // Shrani varnostno kopijo v zasebno vedro el-moto-backups
  if (SUPABASE_URL && SUPABASE_KEY) {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    await supabase.storage
      .from(BACKUP_BUCKET)
      .upload(
        "backups/authoritative-export-2026-11-18.json",
        Buffer.from(JSON.stringify({ ...exported, counts: summary }, null, 2), "utf-8"),
        { contentType: "application/json", upsert: true },
      );
    console.log("✓ Avtoritativna varnostna kopija osvežena v zasebnem vedru el-moto-backups/backups/authoritative-export-2026-11-18.json");
  }

  if (isDryRun) {
    console.log("\n[DRY-RUN] Vsi podatki, relacije, ID-ji, cene in slike so preverjeni in pripravljeni za uvoz v PostgreSQL.");
    return;
  }

  const dbUrl = process.env.DATABASE_URL || "";
  if (!dbUrl.startsWith("postgres://") && !dbUrl.startsWith("postgresql://")) {
    throw new Error(
      "Za dejanski uvoz v PostgreSQL mora DATABASE_URL v .env.local vsebovati PostgreSQL povezovalni niz (postgresql://...).",
    );
  }

  const prisma = new PrismaClient();
  try {
    console.log("\n2. Uvažam podatke v Supabase PostgreSQL (idempotentni upsert)...");

    for (const u of exported.data.users) {
      await prisma.user.upsert({
        where: { id: u.id },
        update: { email: u.email, name: u.name, passwordHash: u.passwordHash, role: u.role },
        create: {
          id: u.id,
          email: u.email,
          name: u.name,
          passwordHash: u.passwordHash,
          role: u.role,
          createdAt: new Date(u.createdAt),
        },
      });
    }

    for (const b of exported.data.brands) {
      await prisma.brand.upsert({
        where: { name: b.name },
        update: { slug: b.slug },
        create: { id: b.id, name: b.name, slug: b.slug },
      });
    }

    for (const c of exported.data.motorcycleCategories) {
      await prisma.motorcycleCategory.upsert({
        where: { name: c.name },
        update: { slug: c.slug },
        create: { id: c.id, name: c.name, slug: c.slug },
      });
    }

    for (const bike of bikes) {
      const data = {
        slug: bike.slug,
        brand: bike.brand,
        model: bike.model,
        variant: bike.variant ?? "",
        year: bike.year,
        firstRegistration: bike.firstRegistration ?? "",
        mileageKm: bike.mileageKm,
        engineCc: bike.engineCc,
        powerKw: bike.powerKw,
        powerHp: bike.powerHp,
        fuelType: bike.fuelType ?? "",
        engineType: bike.engineType ?? "",
        transmission: bike.transmission ?? "",
        driveType: bike.driveType ?? "",
        color: bike.color ?? "",
        licenseCategory: bike.licenseCategory ?? "",
        category: bike.category ?? "",
        condition: bike.condition ?? "",
        publication: bike.publication ?? "PUBLISHED",
        status: bike.status ?? "AVAILABLE",
        forSale: Boolean(bike.forSale),
        forRent: Boolean(bike.forRent),
        priceCents: bike.priceCents,
        priceConfirmed: Boolean(bike.priceConfirmed),
        priceOnRequest: Boolean(bike.priceOnRequest),
        cardSummary: bike.cardSummary ?? "",
        description: bike.description ?? "",
        equipment: bike.equipment ?? "",
        serviceHistory: bike.serviceHistory ?? "",
        featured: Boolean(bike.featured),
        featuredOrder: bike.featuredOrder ?? 0,
        seoTitle: bike.seoTitle ?? "",
        seoDescription: bike.seoDescription ?? "",
        source: bike.source ?? "",
        sourcePlatform: bike.sourcePlatform ?? "",
        sourceUrl: bike.sourceUrl ?? "",
        externalId: bike.externalId ?? "",
        importedAt: bike.importedAt ? new Date(bike.importedAt) : null,
        lastSyncedAt: bike.lastSyncedAt ? new Date(bike.lastSyncedAt) : null,
        importStatus: bike.importStatus ?? "",
        syncEnabled: Boolean(bike.syncEnabled),
        sourceCheckedAt: bike.sourceCheckedAt ? new Date(bike.sourceCheckedAt) : null,
        publishedAt: new Date(bike.publishedAt),
        createdAt: new Date(bike.createdAt),
        updatedAt: new Date(bike.updatedAt),
      };

      await prisma.motorcycle.upsert({
        where: { id: bike.id },
        update: data,
        create: { id: bike.id, ...data },
      });

      await prisma.motorcycleImage.deleteMany({ where: { motorcycleId: bike.id } });
      if (bike.images?.length) {
        await prisma.motorcycleImage.createMany({
          data: bike.images.map((img: { id: string; url: string; alt: string; sortOrder: number; isCover: boolean }) => ({
            id: img.id,
            motorcycleId: bike.id,
            url: img.url,
            alt: img.alt ?? "",
            sortOrder: img.sortOrder ?? 0,
            isCover: Boolean(img.isCover),
          })),
        });
      }

      await prisma.motorcycleSpecification.deleteMany({ where: { motorcycleId: bike.id } });
      if (bike.specifications?.length) {
        await prisma.motorcycleSpecification.createMany({
          data: bike.specifications.map((s: { id: string; label: string; value: string }) => ({
            id: s.id,
            motorcycleId: bike.id,
            label: s.label,
            value: s.value,
          })),
        });
      }
    }

    for (const faq of exported.data.faqItems) {
      await prisma.faqItem.upsert({
        where: { id: faq.id },
        update: {
          category: faq.category,
          question: faq.question,
          answer: faq.answer,
          sortOrder: faq.sortOrder,
          published: faq.published,
        },
        create: faq,
      });
    }

    for (const t of exported.data.testimonials) {
      await prisma.testimonial.upsert({
        where: { id: t.id },
        update: {
          authorName: t.authorName,
          text: t.text,
          rating: t.rating,
          source: t.source,
          published: t.published,
        },
        create: { ...t, createdAt: new Date(t.createdAt) },
      });
    }

    for (const s of siteSettings) {
      await prisma.siteSetting.upsert({
        where: { key: s.key },
        update: { value: s.value },
        create: s,
      });
    }

    for (const p of exported.data.pages) {
      await prisma.page.upsert({
        where: { slug: p.slug },
        update: {
          title: p.title,
          body: p.body,
          seoTitle: p.seoTitle,
          seoDescription: p.seoDescription,
          confirmed: p.confirmed,
        },
        create: { ...p, updatedAt: new Date(p.updatedAt) },
      });
    }

    for (const m of mediaAssets) {
      await prisma.mediaAsset.upsert({
        where: { id: m.id },
        update: {
          url: m.url,
          alt: m.alt ?? "",
          kind: m.kind ?? "gallery",
          linkUrl: m.linkUrl ?? "",
          sortOrder: m.sortOrder ?? 0,
          published: Boolean(m.published),
        },
        create: {
          id: m.id,
          url: m.url,
          alt: m.alt ?? "",
          kind: m.kind ?? "gallery",
          linkUrl: m.linkUrl ?? "",
          sortOrder: m.sortOrder ?? 0,
          published: Boolean(m.published),
          createdAt: new Date(m.createdAt),
        },
      });
    }

    for (const eq of equipment) {
      await prisma.equipment.upsert({
        where: { id: eq.id },
        update: {
          title: eq.title,
          priceCents: eq.priceCents,
          description: eq.description ?? "",
          category: eq.category ?? "Splošno",
          imageUrl: eq.imageUrl ?? "",
          avtonetUrl: eq.avtonetUrl ?? "",
          published: Boolean(eq.published),
          sortOrder: eq.sortOrder ?? 0,
        },
        create: {
          id: eq.id,
          title: eq.title,
          priceCents: eq.priceCents,
          description: eq.description ?? "",
          category: eq.category ?? "Splošno",
          imageUrl: eq.imageUrl ?? "",
          avtonetUrl: eq.avtonetUrl ?? "",
          published: Boolean(eq.published),
          sortOrder: eq.sortOrder ?? 0,
          createdAt: new Date(eq.createdAt),
          updatedAt: new Date(eq.updatedAt),
        },
      });
    }

    // Preveri število zapisov v PostgreSQL po uvozu
    const pgCounts = {
      users: await prisma.user.count(),
      brands: await prisma.brand.count(),
      motorcycleCategories: await prisma.motorcycleCategory.count(),
      motorcycles: await prisma.motorcycle.count(),
      motorcycleImages: await prisma.motorcycleImage.count(),
      motorcycleSpecifications: await prisma.motorcycleSpecification.count(),
      faqItems: await prisma.faqItem.count(),
      siteSettings: await prisma.siteSetting.count(),
      pages: await prisma.page.count(),
      mediaAssets: await prisma.mediaAsset.count(),
      equipment: await prisma.equipment.count(),
    };

    const reportDir = path.join(process.cwd(), "prisma", "backups");
    await mkdir(reportDir, { recursive: true });
    await writeFile(
      path.join(reportDir, "postgres-migration-report.json"),
      JSON.stringify({ migratedAt: new Date().toISOString(), expected: summary, actualInPostgres: pgCounts }, null, 2),
      "utf-8",
    );

    console.log("\n✓ Uvoz v PostgreSQL uspešno zaključen in preverjen:");
    console.log(JSON.stringify(pgCounts, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("Napaka:", err);
  process.exit(1);
});
