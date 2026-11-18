import { createHash } from "node:crypto";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";

type Folder = "motorcycles" | "equipment" | "kove" | "gallery" | "homepage";

type MigrationItem = {
  sourceType: "vercel-blob" | "data-url";
  entityType: string;
  entityId: string;
  label: string;
  folder: Folder;
  oldUrlPreview: string;
  newPath: string;
  newPublicUrl: string;
  status: "dry-run-verified" | "migrated" | "already-supabase" | "failed";
  bytes?: number;
  error?: string;
};

const BUCKET = (process.env.SUPABASE_STORAGE_BUCKET || "el-moto-images").trim();
const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
const SUPABASE_KEY = (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
const LEGACY_BLOB_BASE =
  process.env.BLOB_BASE_URL ||
  (process.env.BLOB_STORE_ID
    ? `https://${process.env.BLOB_STORE_ID.replace(/^store_/i, "").toLowerCase()}.public.blob.vercel-storage.com`
    : "https://js2xtopypf0trcpc.public.blob.vercel-storage.com");

const isDryRun = process.argv.includes("--dry-run") || process.env.DRY_RUN === "true";

function isMigratableUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (SUPABASE_URL && trimmed.startsWith(SUPABASE_URL)) return false;
  return trimmed.includes(".blob.vercel-storage.com") || trimmed.startsWith("data:image/");
}

async function optimizeToWebp(buffer: Buffer): Promise<Buffer> {
  const sharp = (await import("sharp")).default;
  return sharp(buffer)
    .rotate()
    .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
}

async function fetchSourceBuffer(rawUrl: string): Promise<Buffer> {
  const trimmed = rawUrl.trim();
  if (trimmed.startsWith("data:image/")) {
    const commaIdx = trimmed.indexOf(",");
    if (commaIdx === -1) throw new Error("Invalid data:image URL");
    return Buffer.from(trimmed.slice(commaIdx + 1), "base64");
  }
  const res = await fetch(trimmed, {
    headers: { "User-Agent": "ELMOTO-Storage-Migrator/1.0" },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} when downloading ${trimmed}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

async function fetchCurrentSnapshot<T>(key: string): Promise<T | null> {
  if (SUPABASE_URL) {
    try {
      const supaRes = await fetch(
        `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/snapshots/${key}.json`,
        { signal: AbortSignal.timeout(10000) },
      );
      if (supaRes.ok) {
        return (await supaRes.json()) as T;
      }
    } catch {
      // Fallback na legacy posnetek
    }
  }
  try {
    const res = await fetch(`${LEGACY_BLOB_BASE}/snapshots/${key}.json`, {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function main() {
  console.log("==============================================================");
  console.log(`EL-MOTO: Migracija slik iz Vercel Blob v Supabase Storage`);
  console.log(`Način izvajanja: ${isDryRun ? "DRY-RUN (brez spreminjanja podatkov)" : "LIVE MIGRACIJA"}`);
  console.log("==============================================================\n");

  if (!isDryRun && (!SUPABASE_URL || !SUPABASE_KEY)) {
    console.error("NAPAKA: Za dejansko migracijo morata biti v .env nastavljeni spremenljivki:");
    console.error("  NEXT_PUBLIC_SUPABASE_URL");
    console.error("  SUPABASE_SECRET_KEY");
    console.error("Za testni pregled brez ključev zaženite: npm run storage:migrate:dry");
    process.exit(1);
  }

  let supabase: SupabaseClient | null = null;
  if (SUPABASE_URL && SUPABASE_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    if (!isDryRun) {
      const { data: bucket } = await supabase.storage.getBucket(BUCKET);
      if (!bucket) {
        const { error: createErr } = await supabase.storage.createBucket(BUCKET, {
          public: true,
          fileSizeLimit: 25 * 1024 * 1024,
          allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "application/json"],
        });
        if (createErr && !createErr.message.toLowerCase().includes("already exists")) {
          throw new Error(`Ustvarjanje vedra ${BUCKET} ni uspelo: ${createErr.message}`);
        }
      }
    }
  }

  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL || "file:./catalog.db",
  });
  const reportItems: MigrationItem[] = [];
  const urlCache = new Map<string, string>();

  async function processImage(
    rawUrl: string,
    folder: Folder,
    entityType: string,
    entityId: string,
    label: string,
  ): Promise<string> {
    const trimmed = rawUrl.trim();
    if (!isMigratableUrl(trimmed)) return trimmed;

    if (urlCache.has(trimmed)) {
      return urlCache.get(trimmed)!;
    }

    const hash = createHash("sha256").update(trimmed).digest("hex").slice(0, 16);
    const newPath = `${folder}/migrated-${hash}.webp`;
    const previewUrl = SUPABASE_URL
      ? `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${newPath}`
      : `https://<supabase-project>.supabase.co/storage/v1/object/public/${BUCKET}/${newPath}`;
    const sourceType = trimmed.startsWith("data:image/") ? "data-url" : "vercel-blob";
    const oldUrlPreview = trimmed.startsWith("data:image/")
      ? `${trimmed.slice(0, 48)}... (base64, ${trimmed.length} znakov)`
      : trimmed;

    try {
      const rawBuffer = await fetchSourceBuffer(trimmed);
      const optimized = await optimizeToWebp(rawBuffer);

      if (isDryRun) {
        reportItems.push({
          sourceType,
          entityType,
          entityId,
          label,
          folder,
          oldUrlPreview,
          newPath,
          newPublicUrl: previewUrl,
          status: "dry-run-verified",
          bytes: optimized.length,
        });
        console.log(`[DRY-RUN] ✓ ${entityType} (${label}) -> ${newPath} (${Math.round(optimized.length / 1024)} KB)`);
        urlCache.set(trimmed, previewUrl);
        return previewUrl;
      }

      if (!supabase) throw new Error("Supabase odjemalec ni inicializiran.");

      const { error: upErr } = await supabase.storage.from(BUCKET).upload(newPath, optimized, {
        contentType: "image/webp",
        cacheControl: "31536000",
        upsert: true,
      });
      if (upErr) {
        throw new Error(`Nalaganje v Supabase ni uspelo: ${upErr.message}`);
      }

      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(newPath);
      const publicUrl = pub.publicUrl;

      // Preveri javno dostopnost naložene slike pred posodobitvijo baze
      const verifyRes = await fetch(publicUrl, { method: "HEAD", signal: AbortSignal.timeout(10000) });
      if (!verifyRes.ok) {
        throw new Error(`Preverjanje javnega URL-ja (${publicUrl}) je vrnilo HTTP ${verifyRes.status}`);
      }

      reportItems.push({
        sourceType,
        entityType,
        entityId,
        label,
        folder,
        oldUrlPreview,
        newPath,
        newPublicUrl: publicUrl,
        status: "migrated",
        bytes: optimized.length,
      });
      console.log(`[MIGRIRANO] ✓ ${entityType} (${label}) -> ${publicUrl}`);
      urlCache.set(trimmed, publicUrl);
      return publicUrl;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      reportItems.push({
        sourceType,
        entityType,
        entityId,
        label,
        folder,
        oldUrlPreview,
        newPath,
        newPublicUrl: previewUrl,
        status: "failed",
        error: msg,
      });
      console.error(`[NAPAKA] ✕ ${entityType} (${label}): ${msg}`);
      return trimmed;
    }
  }

  try {
    // 1. Preveri oddaljene posnetke na Vercel Blob (produkcijsko stanje)
    console.log("1. Preverjam produkcijske posnetke (Vercel Blob snapshots) in lokalno bazo...");
    const [catalogSnap, settingsSnap, mediaSnap, equipmentSnap] = await Promise.all([
      fetchCurrentSnapshot<{ version: number; bikes: Array<{ id: string; brand: string; model: string; images: Array<{ id: string; url: string; alt: string; sortOrder: number; isCover: boolean }> }> }>("elmoto-shared-catalog-v2"),
      fetchCurrentSnapshot<{ version: number; rows: Array<{ key: string; value: string }> }>("elmoto-shared-settings-v1"),
      fetchCurrentSnapshot<{ version: number; items: Array<{ id: string; url: string; alt: string; kind: string }> }>("elmoto-shared-media-v1"),
      fetchCurrentSnapshot<{ version: number; items: Array<{ id: string; title: string; imageUrl: string }> }>("elmoto-shared-equipment-v1"),
    ]);

    // A) Posnetek kataloga motorjev
    if (catalogSnap?.bikes) {
      for (const bike of catalogSnap.bikes) {
        for (const img of bike.images || []) {
          if (isMigratableUrl(img.url)) {
            const newUrl = await processImage(
              img.url,
              "motorcycles",
              "MotorcycleImage (Snapshot)",
              img.id,
              `${bike.brand} ${bike.model}`,
            );
            if (!isDryRun && newUrl !== img.url) {
              img.url = newUrl;
            }
          }
        }
      }
    }

    // B) Lokalna baza MotorcycleImage
    const localMotoImages = await prisma.motorcycleImage.findMany({
      include: { motorcycle: { select: { brand: true, model: true } } },
    });
    for (const img of localMotoImages) {
      if (isMigratableUrl(img.url)) {
        const newUrl = await processImage(
          img.url,
          "motorcycles",
          "MotorcycleImage (DB)",
          img.id,
          `${img.motorcycle.brand} ${img.motorcycle.model}`,
        );
        if (!isDryRun && newUrl !== img.url) {
          await prisma.motorcycleImage.update({ where: { id: img.id }, data: { url: newUrl } });
        }
      }
    }

    // C) Posnetek moto opreme
    if (equipmentSnap?.items) {
      for (const item of equipmentSnap.items) {
        if (isMigratableUrl(item.imageUrl)) {
          const newUrl = await processImage(
            item.imageUrl,
            "equipment",
            "Equipment (Snapshot)",
            item.id,
            item.title,
          );
          if (!isDryRun && newUrl !== item.imageUrl) {
            item.imageUrl = newUrl;
          }
        }
      }
    }

    // D) Lokalna baza Equipment
    const localEquipment = await prisma.equipment.findMany();
    for (const item of localEquipment) {
      if (isMigratableUrl(item.imageUrl)) {
        const newUrl = await processImage(item.imageUrl, "equipment", "Equipment (DB)", item.id, item.title);
        if (!isDryRun && newUrl !== item.imageUrl) {
          await prisma.equipment.update({ where: { id: item.id }, data: { imageUrl: newUrl } });
        }
      }
    }

    // E) Posnetek galerije / MediaAsset
    if (mediaSnap?.items) {
      for (const item of mediaSnap.items) {
        if (isMigratableUrl(item.url)) {
          const folder: Folder = item.kind === "hero" ? "homepage" : "gallery";
          const newUrl = await processImage(item.url, folder, "MediaAsset (Snapshot)", item.id, item.alt || item.kind);
          if (!isDryRun && newUrl !== item.url) {
            item.url = newUrl;
          }
        }
      }
    }

    // F) Lokalna baza MediaAsset
    const localMedia = await prisma.mediaAsset.findMany();
    for (const item of localMedia) {
      if (isMigratableUrl(item.url)) {
        const folder: Folder = item.kind === "hero" ? "homepage" : "gallery";
        const newUrl = await processImage(item.url, folder, "MediaAsset (DB)", item.id, item.alt || item.kind);
        if (!isDryRun && newUrl !== item.url) {
          await prisma.mediaAsset.update({ where: { id: item.id }, data: { url: newUrl } });
        }
      }
    }

    // G) Nastavitve (Hero in KOVE modeli) v posnetku in lokalni bazi
    if (settingsSnap?.rows) {
      for (const row of settingsSnap.rows) {
        if ((row.key === "hero_image" || row.key === "hero_image_mobile") && isMigratableUrl(row.value)) {
          const newUrl = await processImage(row.value, "homepage", "SiteSetting (Snapshot)", row.key, row.key);
          if (!isDryRun && newUrl !== row.value) {
            row.value = newUrl;
          }
        } else if (row.key === "kove_models_json" && row.value) {
          try {
            const models = JSON.parse(row.value) as Array<{ slug: string; name: string; image: string }>;
            let changed = false;
            for (const m of models) {
              if (isMigratableUrl(m.image)) {
                const newUrl = await processImage(m.image, "kove", "KoveModel (Snapshot)", m.slug, m.name);
                if (!isDryRun && newUrl !== m.image) {
                  m.image = newUrl;
                  changed = true;
                }
              }
            }
            if (!isDryRun && changed) {
              row.value = JSON.stringify(models);
            }
          } catch {
            // Ignore malformed JSON
          }
        }
      }
    }

    const localSettings = await prisma.siteSetting.findMany();
    for (const row of localSettings) {
      if ((row.key === "hero_image" || row.key === "hero_image_mobile") && isMigratableUrl(row.value)) {
        const newUrl = await processImage(row.value, "homepage", "SiteSetting (DB)", row.key, row.key);
        if (!isDryRun && newUrl !== row.value) {
          await prisma.siteSetting.update({ where: { key: row.key }, data: { value: newUrl } });
        }
      } else if (row.key === "kove_models_json" && row.value) {
        try {
          const models = JSON.parse(row.value) as Array<{ slug: string; name: string; image: string }>;
          let changed = false;
          for (const m of models) {
            if (isMigratableUrl(m.image)) {
              const newUrl = await processImage(m.image, "kove", "KoveModel (DB)", m.slug, m.name);
              if (!isDryRun && newUrl !== m.image) {
                m.image = newUrl;
                changed = true;
              }
            }
          }
          if (!isDryRun && changed) {
            await prisma.siteSetting.update({
              where: { key: row.key },
              data: { value: JSON.stringify(models) },
            });
          }
        } catch {
          // Ignore malformed JSON
        }
      }
    }

    // 2. Če ni dry-run, shrani posodobljene posnetke v Supabase Storage (snapshots/*.json)
    if (!isDryRun && supabase) {
      console.log("\n2. Shranjujem posodobljene posnetke (snapshots) v Supabase Storage...");
      const snapshotsToUpload: Array<[string, unknown]> = [
        ["elmoto-shared-catalog-v2", catalogSnap],
        ["elmoto-shared-settings-v1", settingsSnap],
        ["elmoto-shared-media-v1", mediaSnap],
        ["elmoto-shared-equipment-v1", equipmentSnap],
      ];
      for (const [key, data] of snapshotsToUpload) {
        if (!data) continue;
        const payload = Buffer.from(JSON.stringify(data), "utf-8");
        const { error } = await supabase.storage.from(BUCKET).upload(`snapshots/${key}.json`, payload, {
          contentType: "application/json",
          cacheControl: "300",
          upsert: true,
        });
        if (error) {
          console.error(`  ✕ Napaka pri zapisu posnetka ${key}: ${error.message}`);
        } else {
          console.log(`  ✓ Posnetek snapshots/${key}.json shranjen v Supabase Storage.`);
        }
      }
    }

    // 3. Izpiši in shrani poročilo o migraciji
    const report = {
      timestamp: new Date().toISOString(),
      dryRun: isDryRun,
      bucket: BUCKET,
      totalFound: reportItems.length,
      succeeded: reportItems.filter((i) => i.status === "migrated" || i.status === "dry-run-verified").length,
      failed: reportItems.filter((i) => i.status === "failed").length,
      items: reportItems,
    };

    const reportPath = path.join(process.cwd(), "migration-report.json");
    await writeFile(reportPath, JSON.stringify(report, null, 2), "utf-8");

    console.log("\n==============================================================");
    console.log("POROČILO O MIGRACIJI:");
    console.log(`- Način: ${isDryRun ? "DRY-RUN (testni zagon)" : "LIVE"}`);
    console.log(`- Skupaj najdenih slik za prenos: ${report.totalFound}`);
    console.log(`- Uspešno preverjenih / prenesenih: ${report.succeeded}`);
    console.log(`- Napake: ${report.failed}`);
    console.log(`- Podrobno poročilo shranjeno v: ${reportPath}`);
    console.log("==============================================================");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("Kritična napaka pri migraciji:", err);
  process.exit(1);
});
