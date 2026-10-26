import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { readSession } from "@/lib/auth";
import { audit } from "@/lib/guard";
import { assertDurableStore, prisma } from "@/lib/db";
import { removeUpload, saveImage } from "@/lib/uploads";

export const dynamic = "force-dynamic";

async function admin() {
  const user = await readSession();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

function imagePayload(image: { id: string; url: string; alt: string; isCover: boolean; sortOrder: number }) {
  return {
    id: image.id,
    url: image.url,
    alt: image.alt,
    isCover: image.isCover,
    sortOrder: image.sortOrder,
  };
}

export async function GET() {
  const user = await admin();
  if (!user) return NextResponse.json({ error: "Prijava je potrebna." }, { status: 401 });
  return NextResponse.json({ error: "Zahteva ni podprta." }, { status: 405 });
}

export async function POST(request: Request) {
  const user = await admin();
  if (!user) return NextResponse.json({ error: "Prijava je potrebna." }, { status: 401 });
  const form = await request.formData();
  const id = String(form.get("id") ?? "");
  const action = String(form.get("action") ?? "upload");
  const bike = await prisma.motorcycle.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
  if (!bike) return NextResponse.json({ error: "Motor še ni shranjen." }, { status: 404 });
  try {
    assertDurableStore();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Shranjevanje ni trajno.";
    return NextResponse.json({ error: message }, { status: 503 });
  }

  try {
    if (action === "upload") {
      const file = form.get("file");
      if (!(file instanceof File) || file.size <= 0) {
        return NextResponse.json({ error: "Izberi fotografijo." }, { status: 400 });
      }
      if (bike.images.length >= 30) {
        return NextResponse.json({ error: "Na enem motorju je lahko največ 30 fotografij." }, { status: 400 });
      }
      const url = await saveImage(file);
      const order = bike.images.reduce((max, image) => Math.max(max, image.sortOrder), 0) + 1;
      await prisma.motorcycleImage.create({
        data: {
          motorcycleId: id,
          url,
          alt: `${bike.brand} ${bike.model}`.trim(),
          sortOrder: order,
          isCover: bike.images.length === 0,
        },
      });
      await audit(user.id, "UPLOAD", "MotorcycleImage", id);
    } else {
      const imageId = String(form.get("imageId") ?? "");
      const image = bike.images.find((item) => item.id === imageId);
      if (!image) return NextResponse.json({ error: "Fotografije ni." }, { status: 404 });
      if (action === "delete") {
        await prisma.motorcycleImage.delete({ where: { id: image.id } });
        await removeUpload(image.url);
        if (image.isCover) {
          const next = await prisma.motorcycleImage.findFirst({
            where: { motorcycleId: id },
            orderBy: { sortOrder: "asc" },
          });
          if (next) await prisma.motorcycleImage.update({ where: { id: next.id }, data: { isCover: true } });
        }
      } else if (action === "cover") {
        await prisma.motorcycleImage.updateMany({ where: { motorcycleId: id }, data: { isCover: false } });
        await prisma.motorcycleImage.update({ where: { id: image.id }, data: { isCover: true } });
      } else if (action === "up" || action === "down") {
        const sibling = await prisma.motorcycleImage.findFirst({
          where: {
            motorcycleId: id,
            sortOrder: action === "up" ? { lt: image.sortOrder } : { gt: image.sortOrder },
          },
          orderBy: { sortOrder: action === "up" ? "desc" : "asc" },
        });
        if (sibling) {
          await prisma.motorcycleImage.update({ where: { id: image.id }, data: { sortOrder: sibling.sortOrder } });
          await prisma.motorcycleImage.update({ where: { id: sibling.id }, data: { sortOrder: image.sortOrder } });
        }
      } else {
        return NextResponse.json({ error: "Neznano dejanje." }, { status: 400 });
      }
      await audit(user.id, action.toUpperCase(), "MotorcycleImage", id, imageId);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nalaganje ni uspelo. Prejšnje fotografije so ostale.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  revalidatePath("/", "layout");
  const images = await prisma.motorcycleImage.findMany({
    where: { motorcycleId: id },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json({ images: images.map(imagePayload) });
}
