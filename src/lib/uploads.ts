import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/db";
import {
  SUPABASE_BUCKET,
  ensureSupabaseBucket,
  extractSupabaseObjectPath,
  getSupabaseAdmin,
  isSupabaseConfigured,
  type UploadFolder,
} from "@/lib/supabase";

const MAX_BYTES = 25 * 1024 * 1024;

export function sniffImage(buffer: Buffer) {
  if (buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "jpg";
  if (buffer.length > 8 && buffer[0] === 0x89 && buffer.toString("ascii", 1, 4) === "PNG") return "png";
  if (buffer.length > 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") return "webp";
  if (buffer.length > 12 && buffer.toString("ascii", 4, 8) === "ftyp") {
    const brand = buffer.toString("ascii", 8, 12).toLowerCase();
    if (brand.startsWith("hei") || brand.includes("mif1") || brand.includes("heic") || brand.includes("heix")) return "heic";
  }
  return null;
}

async function displayBuffer(buffer: Buffer) {
  const sharp = (await import("sharp")).default;
  return sharp(buffer)
    .rotate()
    .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
}

export async function saveImageBuffer(buffer: Buffer, folder: UploadFolder = "motorcycles"): Promise<string> {
  if (buffer.length <= 0 || buffer.length > MAX_BYTES) {
    throw new Error("Fotografija mora biti manjša od 25 MB.");
  }
  const kind = sniffImage(buffer);
  if (!kind) {
    throw new Error("Dovoljene so samo fotografije JPG, PNG ali WebP.");
  }
  let optimized: Buffer;
  try {
    optimized = await displayBuffer(buffer);
  } catch {
    if (kind === "heic") {
      throw new Error("HEIC format ni podprt. V nastavitvah fotoaparata na telefonu izberi Najbolj združljivo ali JPG.");
    }
    throw new Error("Pretvorba fotografije ni uspela. Preveri format datoteke.");
  }

  const name = `${Date.now()}-${randomBytes(6).toString("hex")}.webp`;
  const storagePath = `${folder}/${name}`;

  if (isSupabaseConfigured()) {
    await ensureSupabaseBucket();
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.storage.from(SUPABASE_BUCKET).upload(storagePath, optimized, {
      contentType: "image/webp",
      cacheControl: "31536000",
      upsert: false,
    });
    if (error) {
      console.error(`[uploads] Supabase Storage upload error (${storagePath}):`, error.message);
      throw new Error("Nalaganje fotografije v shrambo Supabase ni uspelo. Preveri nastavitve.");
    }
    const { data } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(storagePath);
    return data.publicUrl;
  }

  if (process.env.VERCEL) {
    throw new Error(
      "Shramba slik (Supabase Storage) na produkcijskem strežniku še ni nastavljena. Dodajte NEXT_PUBLIC_SUPABASE_URL in SUPABASE_SECRET_KEY v Vercel Environment Variables.",
    );
  }

  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), optimized);
  return `/uploads/${folder}/${name}`;
}

export async function saveDataUrlImage(dataUrl: string, folder: UploadFolder = "motorcycles"): Promise<string> {
  const trimmed = dataUrl.trim();
  if (!trimmed.startsWith("data:image/")) {
    return trimmed;
  }
  const commaIdx = trimmed.indexOf(",");
  if (commaIdx === -1) {
    throw new Error("Neveljaven zapis fotografije.");
  }
  const base64Data = trimmed.slice(commaIdx + 1);
  const buffer = Buffer.from(base64Data, "base64");
  return saveImageBuffer(buffer, folder);
}

export async function saveImage(file: File, folder: UploadFolder = "motorcycles"): Promise<string> {
  if (file.size <= 0 || file.size > MAX_BYTES) {
    throw new Error("Fotografija mora biti manjša od 25 MB.");
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  return saveImageBuffer(buffer, folder);
}

export async function saveRemoteImage(url: string, folder: UploadFolder = "motorcycles"): Promise<string | null> {
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== "https:") return null;
    const host = parsed.hostname.toLowerCase();
    if (host !== "images.avto.net" && host !== "www.avto.net" && host !== "avto.net") {
      return null;
    }
    const response = await fetch(parsed.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ELMOTO-Importer/1.0)",
        Accept: "image/webp,image/jpeg,image/png,image/*;q=0.8",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (buffer.length <= 0 || buffer.length > MAX_BYTES) return null;
    return await saveImageBuffer(buffer, folder);
  } catch {
    return null;
  }
}

async function isUrlStillReferenced(url: string): Promise<boolean> {
  const [motoCount, mediaCount, eqCount, settingsRows] = await Promise.all([
    prisma.motorcycleImage.count({ where: { url } }),
    prisma.mediaAsset.count({ where: { url } }),
    prisma.equipment.count({ where: { imageUrl: url } }),
    prisma.siteSetting.findMany({
      where: { key: { in: ["hero_image", "hero_image_mobile", "kove_models_json"] } },
    }),
  ]);
  if (motoCount > 0 || mediaCount > 0 || eqCount > 0) return true;
  for (const row of settingsRows) {
    if (row.value === url || row.value.includes(url)) return true;
  }
  return false;
}

export async function removeUpload(url: string): Promise<void> {
  const trimmed = (url || "").trim();
  if (!trimmed || trimmed.startsWith("/images/") || trimmed.startsWith("data:")) return;

  // Nikoli samodejno ne brišemo obstoječih Vercel Blob datotek (zahteva varne migracije)
  if (trimmed.includes(".blob.vercel-storage.com")) {
    return;
  }

  if (await isUrlStillReferenced(trimmed)) {
    return;
  }

  if (trimmed.startsWith("/uploads/") && !trimmed.includes("..")) {
    const dir = path.resolve(process.cwd(), "public", "uploads");
    const target = path.resolve(process.cwd(), "public", trimmed.replace(/^\//, ""));
    const relative = path.relative(dir, target);
    if (relative.startsWith("..") || path.isAbsolute(relative)) return;
    await unlink(target).catch(() => undefined);
    return;
  }

  if (trimmed.startsWith("https://") && isSupabaseConfigured()) {
    const objectPath = extractSupabaseObjectPath(trimmed);
    if (objectPath) {
      const supabase = getSupabaseAdmin();
      await supabase.storage.from(SUPABASE_BUCKET).remove([objectPath]).catch(() => undefined);
    }
  }
}
