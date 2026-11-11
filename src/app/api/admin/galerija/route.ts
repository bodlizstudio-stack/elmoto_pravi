import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { readSession } from "@/lib/auth";
import { audit } from "@/lib/guard";
import { prisma } from "@/lib/db";
import { removeUpload, saveImage, saveImageBuffer } from "@/lib/uploads";
import { ensureMediaSynced, persistMediaSnapshot } from "@/lib/shared-store";

export const dynamic = "force-dynamic";

async function requireAdminSession() {
  const user = await readSession();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

export async function GET() {
  const user = await requireAdminSession();
  if (!user) return NextResponse.json({ error: "Prijava je potrebna." }, { status: 401 });
  await ensureMediaSynced({ force: true });
  const photos = await prisma.mediaAsset.findMany({
    where: { kind: "gallery" },
    orderBy: [{ createdAt: "desc" }, { sortOrder: "asc" }],
  });
  return NextResponse.json({ photos });
}

export async function POST(request: Request) {
  const user = await requireAdminSession();
  if (!user) return NextResponse.json({ error: "Prijava je potrebna." }, { status: 401 });

  await ensureMediaSynced({ force: true });

  const contentType = request.headers.get("content-type") || "";

  try {
    if (contentType.includes("application/json")) {
      const body = await request.json();
      const action = String(body.action || "upload");

      if (action === "delete") {
        const id = String(body.id || "");
        if (!id) return NextResponse.json({ error: "Manjka ID fotografije." }, { status: 400 });
        const asset = await prisma.mediaAsset.findUnique({ where: { id } });
        if (asset) {
          await prisma.mediaAsset.delete({ where: { id } });
          if (asset.url && !asset.url.startsWith("/images/")) {
            await removeUpload(asset.url).catch(() => undefined);
          }
        } else {
          await prisma.mediaAsset.deleteMany({ where: { id } });
        }
        await persistMediaSnapshot();
        await audit(user.id, "DELETE", "MediaAsset", id);
        revalidatePath("/", "layout");
        revalidatePath("/galerija");
        revalidatePath("/admin/galerija");
        return NextResponse.json({ ok: true });
      }

      if (action === "delete_samples") {
        await prisma.mediaAsset.deleteMany({
          where: { kind: "gallery", url: { startsWith: "/images/galerija/" } },
        });
        await persistMediaSnapshot();
        await audit(user.id, "DELETE_SAMPLES", "MediaAsset", "gallery");
        revalidatePath("/", "layout");
        revalidatePath("/galerija");
        revalidatePath("/admin/galerija");
        return NextResponse.json({ ok: true });
      }

      if (action === "delete_all") {
        const photos = await prisma.mediaAsset.findMany({ where: { kind: "gallery" } });
        for (const p of photos) {
          if (p.url && !p.url.startsWith("/images/")) {
            await removeUpload(p.url).catch(() => undefined);
          }
        }
        await prisma.mediaAsset.deleteMany({ where: { kind: "gallery" } });
        await persistMediaSnapshot();
        await audit(user.id, "DELETE_ALL", "MediaAsset", "gallery");
        revalidatePath("/", "layout");
        revalidatePath("/galerija");
        revalidatePath("/admin/galerija");
        return NextResponse.json({ ok: true });
      }

      if (action === "upload_data_urls" && Array.isArray(body.items)) {
        if (body.items.length === 0) {
          return NextResponse.json({ error: "Ni izbranih fotografij." }, { status: 400 });
        }
        const createdItems = [];
        for (const item of body.items) {
          const dataUrl = String(item.dataUrl || "");
          const alt = String(item.alt || "").trim();
          const linkUrl = String(item.linkUrl || "").trim();
          const base64Data = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
          if (!base64Data) continue;
          const buffer = Buffer.from(base64Data, "base64");
          const url = await saveImageBuffer(buffer);
          const record = await prisma.mediaAsset.create({
            data: {
              url,
              alt,
              kind: "gallery",
              linkUrl: linkUrl || "",
              sortOrder: 0,
              published: true,
              createdAt: new Date(),
            },
          });
          createdItems.push(record);
        }
        await persistMediaSnapshot();
        await audit(user.id, "UPLOAD", "MediaAsset", "gallery");
        revalidatePath("/", "layout");
        revalidatePath("/galerija");
        revalidatePath("/admin/galerija");
        return NextResponse.json({ ok: true, created: createdItems.length });
      }
    }

    // Multipart/form-data
    const form = await request.formData();
    const action = String(form.get("action") || "upload");

    if (action === "upload") {
      const files = form.getAll("files").filter((f) => f instanceof File && f.size > 0) as File[];
      const singleFile = form.get("file");
      if (singleFile instanceof File && singleFile.size > 0 && !files.includes(singleFile)) {
        files.unshift(singleFile);
      }
      const imageUrl = String(form.get("imageUrl") || "").trim();
      const alt = String(form.get("alt") || "").trim();
      const linkUrl = String(form.get("linkUrl") || "").trim();

      if (files.length === 0 && !imageUrl) {
        return NextResponse.json({ error: "Izberi vsaj eno fotografijo ali vnesi URL." }, { status: 400 });
      }

      if (imageUrl) {
        await prisma.mediaAsset.create({
          data: {
            url: imageUrl,
            alt,
            kind: "gallery",
            linkUrl: linkUrl || "",
            sortOrder: 0,
            published: true,
            createdAt: new Date(),
          },
        });
      }

      for (const file of files) {
        const url = await saveImage(file);
        await prisma.mediaAsset.create({
          data: {
            url,
            alt: alt || file.name.replace(/\.[^.]+$/, ""),
            kind: "gallery",
            linkUrl: linkUrl || "",
            sortOrder: 0,
            published: true,
            createdAt: new Date(),
          },
        });
      }

      await persistMediaSnapshot();
      await audit(user.id, "UPLOAD", "MediaAsset", "gallery");
      revalidatePath("/", "layout");
      revalidatePath("/galerija");
      revalidatePath("/admin/galerija");
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Neznano dejanje." }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Napaka pri obdelavi.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
