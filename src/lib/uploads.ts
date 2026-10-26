import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/db";

const MAX_BYTES = 8 * 1024 * 1024;

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
  return sharp(buffer).rotate().resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
}

export async function saveImage(file: File) {
  if (file.size <= 0 || file.size > MAX_BYTES) throw new Error("Fotografija mora biti manjša od 8 MB.");
  const buffer = Buffer.from(await file.arrayBuffer());
  const kind = sniffImage(buffer);
  if (kind === "heic") {
    throw new Error("HEIC ni podprt. V telefonu pri izbiri fotografije izberi Najbolj združljivo ali JPG.");
  }
  if (!kind) throw new Error("Dovoljene so samo fotografije JPG, PNG ali WebP.");
  const optimized = await displayBuffer(buffer);
  const name = `${Date.now()}-${randomBytes(6).toString("hex")}.webp`;
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (token) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`motorji/${name}`, optimized, {
      access: "public",
      token,
      contentType: "image/webp",
      addRandomSuffix: false,
    });
    return blob.url;
  }
  if (process.env.VERCEL) {
    return `data:image/webp;base64,${optimized.toString("base64")}`;
  }
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), optimized);
  return `/uploads/${name}`;
}

export async function removeUpload(url: string) {
  const shared = await prisma.motorcycleImage.count({ where: { url } });
  if (shared > 0) return;
  if (url.startsWith("/uploads/") && !url.includes("..")) {
    const dir = path.resolve(process.cwd(), "public", "uploads");
    const target = path.resolve(process.cwd(), "public", url.replace(/^\//, ""));
    const relative = path.relative(dir, target);
    if (relative.startsWith("..") || path.isAbsolute(relative)) return;
    await unlink(target).catch(() => undefined);
    return;
  }
  if (url.startsWith("https://") && process.env.BLOB_READ_WRITE_TOKEN) {
    const { del } = await import("@vercel/blob");
    await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN }).catch(() => undefined);
  }
}
