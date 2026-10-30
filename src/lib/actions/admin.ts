"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { assertDurableStore, prisma } from "@/lib/db";
import { createSession, clearSession } from "@/lib/auth";
import { audit, requireAdmin } from "@/lib/guard";
import { rateLimit } from "@/lib/rate-limit";
import { parseMotorcycleImport } from "@/lib/import-motorcycles";
import { canPublish } from "@/lib/offer";
import { displayName, extractMileageFromText, parseSpecs, slugify, euroToCents } from "@/lib/utils";
import { createHash, timingSafeEqual } from "node:crypto";
import { findOverlap } from "@/lib/availability";
import { parseInTimeZone } from "@/lib/time";
import { removeUpload, saveImage, saveRemoteImage } from "@/lib/uploads";
import { validateAvtoNetImageUrl } from "@/lib/avtonet-import";
import { ensureDbSynced, ensureSettingsSynced, persistDbSnapshot, persistSettingsSnapshot, ensureMediaSynced, persistMediaSnapshot, ensureEquipmentSynced, persistEquipmentSnapshot } from "@/lib/shared-store";
import { getKoveModels, koveModels, type KoveModel } from "@/lib/kove";

export type ActionState = { error?: string; ok?: string } | null;

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function optionalInt(formData: FormData, key: string) {
  const value = text(formData, key)
    .replace(/\b(km|ccm|cc|leto|letnik)\b/gi, "")
    .replace(/[.\s]/g, "")
    .trim();
  if (!value) return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return null;
  return Math.round(number);
}

function checked(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

async function rememberBrand(name: string) {
  const slug = slugify(name);
  if (!slug) return;
  await prisma.brand.upsert({
    where: { name },
    update: {},
    create: { name, slug },
  }).catch(async () => {
    const existing = await prisma.brand.findUnique({ where: { slug } });
    if (!existing) await prisma.brand.create({ data: { name, slug: `${slug}-${Date.now()}` } }).catch(() => undefined);
  });
}

async function rememberCategory(name: string) {
  if (!name) return;
  const slug = slugify(name);
  if (!slug) return;
  await prisma.motorcycleCategory.upsert({
    where: { name },
    update: {},
    create: { name, slug },
  }).catch(() => undefined);
}

async function uniqueSlug(base: string, ignoreId?: string) {
  const root = slugify(base) || "motor";
  let slug = root;
  let n = 2;
  while (await prisma.motorcycle.findFirst({ where: { slug, NOT: ignoreId ? { id: ignoreId } : undefined } })) {
    slug = `${root}-${n}`;
    n += 1;
  }
  return slug;
}

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`login:${ip}`, 8, 15 * 60 * 1000)) {
    return { error: "Preveč poskusov. Počakaj in poskusi znova." };
  }
  const loginName = text(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const user = loginName.includes("@")
    ? await prisma.user.findUnique({ where: { email: loginName } })
    : await prisma.user.findFirst({ where: { role: "ADMIN", email: { startsWith: `${loginName}@` } } });
  if (!user || user.role !== "ADMIN" || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Napačno uporabniško ime ali geslo." };
  }
  await createSession(user.id);
  redirect("/admin");
}

export async function logout() {
  await clearSession();
  redirect("/admin/prijava");
}

function optionalNumber(raw: string) {
  const cleaned = raw
    .replace(/\b(kw|km|hp|ks)\b/gi, "")
    .replace(/\s+/g, "")
    .replace(",", ".")
    .trim();
  if (!cleaned) return null;
  const number = Number(cleaned);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

const HOMEPAGE_FEATURED_LIMIT = 3;

async function enforceHomepageFeaturedLimit(activeBikeId: string) {
  const others = await prisma.motorcycle.findMany({
    where: {
      publication: "PUBLISHED",
      featured: true,
      NOT: { id: activeBikeId },
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    select: { id: true },
  });
  const toUnfeature = others.slice(HOMEPAGE_FEATURED_LIMIT - 1).map((item) => item.id);
  if (toUnfeature.length > 0) {
    await prisma.motorcycle.updateMany({
      where: { id: { in: toUnfeature } },
      data: { featured: false },
    });
  }
}

export async function saveMotorcycle(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  try {
    assertDurableStore();
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Shranjevanje ni trajno." };
  }
  await ensureDbSynced();
  const id = text(formData, "id");
  const brand = text(formData, "brand");
  const model = text(formData, "model");
  if (!brand || !model) return { error: "Vnesi znamko in model." };
  const yearRaw = optionalInt(formData, "year");
  const year = yearRaw != null && yearRaw >= 1970 && yearRaw <= 2035 ? yearRaw : null;
  const descriptionRaw = text(formData, "description").slice(0, 8000);
  const specsRaw = formData.has("specs") ? text(formData, "specs") : "";
  const mileage =
    optionalInt(formData, "mileageKm") ??
    extractMileageFromText(descriptionRaw) ??
    extractMileageFromText(specsRaw);
  const engine = optionalInt(formData, "engineCc");
  const featuredOrder = optionalInt(formData, "featuredOrder");
  const price = euroToCents(text(formData, "priceEur"));
  if ("error" in price && price.error) return { error: price.error };
  const powerKwRaw = optionalNumber(text(formData, "powerKw"));
  const powerHpRaw = optionalNumber(text(formData, "powerHp"));
  const powerKw =
    powerKwRaw && powerKwRaw > 0
      ? powerKwRaw
      : powerHpRaw && powerHpRaw > 0
        ? Math.round((powerHpRaw / 1.35962) * 10) / 10
        : null;
  const powerHp =
    powerHpRaw && powerHpRaw > 0
      ? powerHpRaw
      : powerKwRaw && powerKwRaw > 0
        ? Math.round(powerKwRaw * 1.35962)
        : null;
  const description = descriptionRaw;
  const conditionRaw = text(formData, "condition");
  const condition = conditionRaw === "NEW" || conditionRaw === "USED" ? conditionRaw : "";
  const statusRaw = text(formData, "status");
  const existing = id
    ? await prisma.motorcycle.findUnique({ where: { id }, include: { images: true } })
    : null;
  const status = ["AVAILABLE", "RESERVED", "SOLD"].includes(statusRaw)
    ? statusRaw
    : existing?.status && existing.status !== "UNKNOWN"
      ? existing.status
      : "AVAILABLE";
  const problem = canPublish({ brand, model });
  if (problem) return { error: problem };
  const publication = "PUBLISHED";
  const slug = existing ? existing.slug : await uniqueSlug(`${brand}-${model}-${year ?? ""}`);
  const variant = formData.has("variant") ? text(formData, "variant") : (existing?.variant ?? "");
  const firstRegistration = formData.has("firstRegistration") ? text(formData, "firstRegistration") : (existing?.firstRegistration ?? "");
  const fuelType = formData.has("fuelType") ? text(formData, "fuelType") : (existing?.fuelType ?? "");
  const engineType = formData.has("engineType") ? text(formData, "engineType") : (existing?.engineType ?? "");
  const transmission = formData.has("transmission") ? text(formData, "transmission") : (existing?.transmission ?? "");
  const driveType = formData.has("driveType") ? text(formData, "driveType") : (existing?.driveType ?? "");
  const color = formData.has("color") ? text(formData, "color") : (existing?.color ?? "");
  const licenseCategory = formData.has("licenseCategory") ? text(formData, "licenseCategory") : (existing?.licenseCategory ?? "");
  const category = formData.has("category") ? text(formData, "category") : (existing?.category ?? "");
  const equipment = formData.has("equipment") ? text(formData, "equipment") : (existing?.equipment ?? "");
  const serviceHistory = formData.has("serviceHistory") ? text(formData, "serviceHistory") : (existing?.serviceHistory ?? "");
  const sourcePlatform = formData.has("sourcePlatform") ? text(formData, "sourcePlatform") : (existing?.sourcePlatform ?? "");
  const sourceUrl = formData.has("sourceUrl") ? text(formData, "sourceUrl") : (existing?.sourceUrl ?? "");
  const externalId = formData.has("externalId") ? text(formData, "externalId") : (existing?.externalId ?? "");
  const importStatus = formData.has("importStatus") ? text(formData, "importStatus") : (existing?.importStatus ?? "");
  const syncEnabled = formData.has("syncEnabled") ? checked(formData, "syncEnabled") : (existing?.syncEnabled ?? false);
  const now = new Date();
  const isAvtoNetImport = sourcePlatform === "Avto.net" || Boolean(sourceUrl);

  const data = {
    slug,
    brand,
    model,
    variant,
    year,
    firstRegistration,
    mileageKm: mileage,
    engineCc: engine ?? existing?.engineCc ?? null,
    powerKw: powerKw && powerKw > 0 ? powerKw : null,
    powerHp: powerHp && powerHp > 0 ? powerHp : null,
    fuelType,
    engineType,
    transmission,
    driveType,
    color,
    licenseCategory,
    category,
    condition,
    status,
    publication,
    forSale: existing?.forSale ?? true,
    forRent: existing?.forRent ?? false,
    priceCents: price.cents,
    priceConfirmed: Boolean(price.cents),
    priceOnRequest: !price.cents,
    cardSummary: description.slice(0, 280),
    description,
    equipment,
    serviceHistory,
    featured: checked(formData, "featured"),
    featuredOrder: featuredOrder ?? existing?.featuredOrder ?? 0,
    seoTitle: existing?.seoTitle ?? "",
    seoDescription: existing?.seoDescription ?? "",
    source: sourceUrl || existing?.source || "",
    sourcePlatform,
    sourceUrl,
    externalId,
    importStatus,
    syncEnabled,
    importedAt: isAvtoNetImport ? (existing?.importedAt ?? now) : (existing?.importedAt ?? null),
    lastSyncedAt: isAvtoNetImport ? now : (existing?.lastSyncedAt ?? null),
    sourceCheckedAt: isAvtoNetImport ? now : (existing?.sourceCheckedAt ?? null),
    publishedAt: existing ? existing.publishedAt : now,
  };
  await rememberBrand(brand);
  await rememberCategory(data.category);
  const bike = existing
    ? await prisma.motorcycle.update({ where: { id: existing.id }, data })
    : await prisma.motorcycle.create({ data });
  if (data.featured) {
    await enforceHomepageFeaturedLimit(bike.id);
  }
  if (formData.has("specs")) {
    const specs = parseSpecs(text(formData, "specs"));
    await prisma.motorcycleSpecification.deleteMany({ where: { motorcycleId: bike.id } });
    if (specs.length) {
      await prisma.motorcycleSpecification.createMany({
        data: specs.map((spec) => ({ motorcycleId: bike.id, label: spec.label, value: spec.value })),
      });
    }
  }
  try {
    await attachPhotos(bike.id, brand, model, existing?.images ?? [], formData);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Fotografije ni bilo mogoče dodati.";
    await persistDbSnapshot();
    revalidateOffer(bike.slug);
    redirect(`/admin?error=${encodeURIComponent(message)}`);
  }
  await persistDbSnapshot();
  await audit(
    admin.id,
    existing ? "UPDATE" : isAvtoNetImport ? "AVTONET_IMPORT" : "CREATE",
    "Motorcycle",
    bike.id,
    `${brand} ${model}${externalId ? ` (Avto.net #${externalId})` : ""}`,
  );
  revalidateOffer(bike.slug);
  redirect("/admin?ok=1");
}

async function attachPhotos(
  motorcycleId: string,
  brand: string,
  model: string,
  images: { sortOrder: number }[],
  formData: FormData,
) {
  if (formData.has("galleryJson")) {
    const rawGallery = text(formData, "galleryJson");
    try {
      const parsed = JSON.parse(rawGallery) as unknown;
      if (Array.isArray(parsed)) {
        const items = parsed
          .map((item) => {
            if (!item || typeof item !== "object") return null;
            const rec = item as Record<string, unknown>;
            const url = String(rec.url ?? "").trim();
            if (!url) return null;
            return {
              url,
              alt: String(rec.alt ?? "").trim() || `${brand} ${model}`.trim(),
              isCover: Boolean(rec.isCover),
            };
          })
          .filter((item): item is { url: string; alt: string; isCover: boolean } => Boolean(item))
          .slice(0, 30);

        if (items.length > 0 && !items.some((item) => item.isCover)) {
          items[0].isCover = true;
        }

        await prisma.motorcycleImage.deleteMany({ where: { motorcycleId } });
        for (let idx = 0; idx < items.length; idx += 1) {
          await prisma.motorcycleImage.create({
            data: {
              motorcycleId,
              url: items[idx].url,
              alt: items[idx].alt,
              sortOrder: idx + 1,
              isCover: items[idx].isCover,
            },
          });
        }
        return;
      }
    } catch {
      // Fallback to importedImages / photos below
    }
  }

  let importedUrls: string[] = [];
  const rawImported = text(formData, "importedImages");
  if (rawImported) {
    try {
      const parsed = JSON.parse(rawImported) as unknown;
      if (Array.isArray(parsed)) {
        importedUrls = parsed.map((u) => String(u ?? "").trim()).filter(Boolean);
      }
    } catch {
      importedUrls = [];
    }
  }

  const files = formData.getAll("photos").filter((file): file is File => file instanceof File && file.size > 0);
  if (!importedUrls.length && !files.length) return;
  if (images.length + importedUrls.length + files.length > 30) {
    throw new Error("Na enem motorju je lahko največ 30 fotografij.");
  }

  const preferredCoverIdx = optionalInt(formData, "coverIndex") ?? 0;
  let order = images.reduce((max, image) => Math.max(max, image.sortOrder), 0);
  let addedCount = 0;

  for (const remoteUrl of importedUrls) {
    const storedUrl = (await saveRemoteImage(remoteUrl)) || validateAvtoNetImageUrl(remoteUrl);
    if (!storedUrl) continue;
    order += 1;
    const isCover = images.length === 0 && addedCount === preferredCoverIdx;
    addedCount += 1;
    await prisma.motorcycleImage.create({
      data: {
        motorcycleId,
        url: storedUrl,
        alt: `${brand} ${model}`.trim(),
        sortOrder: order,
        isCover,
      },
    });
  }

  for (const file of files) {
    const url = await saveImage(file);
    order += 1;
    const isCover = images.length === 0 && addedCount === preferredCoverIdx;
    addedCount += 1;
    await prisma.motorcycleImage.create({
      data: {
        motorcycleId,
        url,
        alt: `${brand} ${model}`.trim(),
        sortOrder: order,
        isCover,
      },
    });
  }

  // Ensure at least one cover image exists if photos were added
  const hasCover = await prisma.motorcycleImage.findFirst({ where: { motorcycleId, isCover: true } });
  if (!hasCover) {
    const firstImg = await prisma.motorcycleImage.findFirst({
      where: { motorcycleId },
      orderBy: { sortOrder: "asc" },
    });
    if (firstImg) {
      await prisma.motorcycleImage.update({ where: { id: firstImg.id }, data: { isCover: true } });
    }
  }
}

function revalidateOffer(slug: string) {
  revalidatePath("/", "layout");
  revalidatePath("/motorji");
  revalidatePath(`/motorji/${slug}`);
}

export async function uploadMotorcycleImages(formData: FormData) {
  const admin = await requireAdmin();
  try {
    assertDurableStore();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Shranjevanje ni trajno.";
    redirect(`/admin?error=${encodeURIComponent(message)}`);
  }
  await ensureDbSynced();
  const id = text(formData, "id");
  const bike = await prisma.motorcycle.findUnique({ where: { id }, include: { images: true } });
  if (!bike) return;
  const files = formData.getAll("images").filter((file): file is File => file instanceof File && file.size > 0);
  if (bike.images.length + files.length > 30) redirect(`/admin/motorji/${id}?error=prevec-fotografij`);
  let order = bike.images.reduce((max, image) => Math.max(max, image.sortOrder), 0);
  for (const file of files.slice(0, 12)) {
    const url = await saveImage(file);
    order += 1;
    await prisma.motorcycleImage.create({
      data: {
        motorcycleId: id,
        url,
        alt: text(formData, "alt") || `${bike.brand} ${bike.model}`,
        sortOrder: order,
        isCover: bike.images.length === 0 && order === 1,
      },
    });
  }
  await persistDbSnapshot();
  await audit(admin.id, "UPLOAD", "MotorcycleImage", id, `${files.length} fotografij`);
  revalidatePath("/", "layout");
  redirect(`/admin/motorji/${id}?saved=1`);
}

export async function updateImage(formData: FormData) {
  const admin = await requireAdmin();
  await ensureDbSynced();
  const imageId = text(formData, "imageId");
  const action = text(formData, "imageAction");
  const image = await prisma.motorcycleImage.findUnique({ where: { id: imageId } });
  if (!image) return;
  if (action === "delete") {
    await prisma.motorcycleImage.delete({ where: { id: imageId } });
    await removeUpload(image.url);
    if (image.isCover) {
      const next = await prisma.motorcycleImage.findFirst({
        where: { motorcycleId: image.motorcycleId },
        orderBy: { sortOrder: "asc" },
      });
      if (next) await prisma.motorcycleImage.update({ where: { id: next.id }, data: { isCover: true } });
    }
  } else if (action === "cover") {
    await prisma.motorcycleImage.updateMany({ where: { motorcycleId: image.motorcycleId }, data: { isCover: false } });
    await prisma.motorcycleImage.update({ where: { id: imageId }, data: { isCover: true } });
  } else if (action === "up" || action === "down") {
    const sibling = await prisma.motorcycleImage.findFirst({
      where: {
        motorcycleId: image.motorcycleId,
        sortOrder: action === "up" ? { lt: image.sortOrder } : { gt: image.sortOrder },
      },
      orderBy: { sortOrder: action === "up" ? "desc" : "asc" },
    });
    if (sibling) {
      await prisma.motorcycleImage.update({ where: { id: image.id }, data: { sortOrder: sibling.sortOrder } });
      await prisma.motorcycleImage.update({ where: { id: sibling.id }, data: { sortOrder: image.sortOrder } });
    }
  }
  await persistDbSnapshot();
  await audit(admin.id, action.toUpperCase(), "MotorcycleImage", image.motorcycleId, imageId);
  revalidatePath("/", "layout");
  redirect(`/admin/motorji/${image.motorcycleId}?saved=1`);
}

export async function setOfferAction(formData: FormData) {
  const admin = await requireAdmin();
  try {
    assertDurableStore();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Shranjevanje ni trajno.";
    redirect(`/admin?error=${encodeURIComponent(message)}`);
  }
  await ensureDbSynced();
  const id = text(formData, "id");
  const offerAction = text(formData, "offerAction");
  const back = text(formData, "back") || "/admin";
  const bike = await prisma.motorcycle.findUnique({ where: { id }, include: { images: true } });
  if (!bike) redirect(`${back}?ok=1`);
  if (offerAction === "publish") {
    const problem = canPublish({ brand: bike.brand, model: bike.model });
    if (problem) redirect(`${back}?error=${encodeURIComponent(problem)}`);
    await prisma.motorcycle.update({ where: { id }, data: { publication: "PUBLISHED" } });
  } else if (offerAction === "draft" || offerAction === "restore") {
    await prisma.motorcycle.update({ where: { id }, data: { publication: "DRAFT" } });
  } else if (offerAction === "sold") {
    await prisma.motorcycle.update({ where: { id }, data: { status: "SOLD" } });
  } else if (offerAction === "reserved") {
    await prisma.motorcycle.update({ where: { id }, data: { status: "RESERVED" } });
  } else if (offerAction === "available") {
    await prisma.motorcycle.update({ where: { id }, data: { status: "AVAILABLE" } });
  } else if (offerAction === "feature") {
    await prisma.motorcycle.update({ where: { id }, data: { featured: true, publishedAt: new Date() } });
    await enforceHomepageFeaturedLimit(id);
  } else if (offerAction === "unfeature") {
    await prisma.motorcycle.update({ where: { id }, data: { featured: false } });
  } else if (offerAction === "delete") {
    const images = bike.images;
    await prisma.motorcycle.delete({ where: { id } });
    await Promise.all(images.map((image) => removeUpload(image.url)));
  } else if (offerAction === "archive") {
    await prisma.motorcycle.update({ where: { id }, data: { publication: "ARCHIVED" } });
  } else {
    return;
  }
  await persistDbSnapshot();
  await audit(admin.id, offerAction.toUpperCase(), "Motorcycle", id, bike.slug);
  revalidatePath("/", "layout");
  redirect(`${back}?ok=1`);
}

export async function deleteMotorcycle(formData: FormData) {
  const admin = await requireAdmin();
  try {
    assertDurableStore();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Shranjevanje ni trajno.";
    redirect(`/admin?error=${encodeURIComponent(message)}`);
  }
  await ensureDbSynced();
  const id = text(formData, "id");
  const bike = await prisma.motorcycle.findUnique({ where: { id }, include: { images: true } });
  if (!bike) redirect("/admin?ok=1");
  const images = bike.images;
  await prisma.motorcycle.delete({ where: { id } });
  await Promise.all(images.map((image) => removeUpload(image.url)));
  await persistDbSnapshot();
  await audit(admin.id, "DELETE", "Motorcycle", id, bike.slug);
  revalidatePath("/", "layout");
  redirect("/admin?ok=1");
}

export async function changePassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  try {
    assertDurableStore();
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Shranjevanje ni trajno." };
  }
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const again = String(formData.get("again") ?? "");
  if (next.length < 12) return { error: "Novo geslo naj ima vsaj 12 znakov." };
  if (next !== again) return { error: "Novi gesli se ne ujemata." };
  const user = await prisma.user.findUnique({ where: { id: admin.id } });
  if (!user || !(await bcrypt.compare(current, user.passwordHash))) return { error: "Trenutno geslo ni pravilno." };
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(next, 12) } });
  await audit(admin.id, "PASSWORD", "User", user.id);
  return { ok: "Geslo je spremenjeno." };
}

export async function resetPasswordWithToken(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`reset:${ip}`, 8, 15 * 60 * 1000)) {
    return { error: "Preveč poskusov. Počakaj in poskusi znova." };
  }
  try {
    assertDurableStore();
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Shranjevanje ni trajno." };
  }
  const token = text(formData, "token");
  const next = String(formData.get("next") ?? "");
  const again = String(formData.get("again") ?? "");
  if (next.length < 12) return { error: "Novo geslo naj ima vsaj 12 znakov." };
  if (next !== again) return { error: "Gesli se ne ujemata." };
  const row = await prisma.siteSetting.findUnique({ where: { key: "admin_reset" } });
  if (!row) return { error: "Povezava za ponastavitev ni veljavna." };
  let stored: { userId?: string; hash?: string; exp?: number };
  try {
    stored = JSON.parse(row.value) as { userId?: string; hash?: string; exp?: number };
  } catch {
    return { error: "Povezava za ponastavitev ni veljavna." };
  }
  const hash = createHash("sha256").update(token).digest("hex");
  const left = Buffer.from(hash);
  const right = Buffer.from(stored.hash ?? "");
  if (!stored.userId || !stored.exp || stored.exp < Date.now() || left.length !== right.length || !timingSafeEqual(left, right)) {
    return { error: "Povezava je potekla ali ni veljavna. Za novo jo pripravi skrbnik strežnika." };
  }
  const user = await prisma.user.findUnique({ where: { id: stored.userId } });
  if (!user || user.role !== "ADMIN") return { error: "Povezava ni veljavna." };
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(next, 12) } });
  await prisma.siteSetting.delete({ where: { key: "admin_reset" } });
  await audit(user.id, "PASSWORD_RESET", "User", user.id);
  redirect("/admin/prijava?ponastavljeno=1");
}

export async function importMotorcycles(formData: FormData) {
  const admin = await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) redirect("/admin/uvoz?error=datoteka");
  if (file.size > 2_000_000) redirect("/admin/uvoz?error=velikost");
  const textContent = await file.text();
  const parsed = parseMotorcycleImport(textContent, file.name);
  let created = 0;
  for (const row of parsed.rows) {
    const slug = await uniqueSlug(`${row.brand}-${row.model}-${row.variant}-${row.year}`);
    const bike = await prisma.motorcycle.create({
      data: {
        slug,
        brand: row.brand,
        model: row.model,
        variant: row.variant,
        year: row.year,
        mileageKm: row.mileageKm,
        engineCc: row.engineCc,
        powerKw: row.powerKw && row.powerKw > 0 ? row.powerKw : null,
        powerHp: row.powerHp && row.powerHp > 0 ? row.powerHp : null,
        engineType: row.engineType,
        transmission: row.transmission,
        driveType: row.driveType,
        color: row.color,
        licenseCategory: row.licenseCategory,
        category: row.category,
        condition: row.condition === "NEW" || row.condition === "USED" ? row.condition : "",
        status: ["AVAILABLE", "RESERVED", "SOLD", "UNKNOWN"].includes(row.status) ? row.status : "UNKNOWN",
        publication: row.status === "ARCHIVED" || row.status === "HIDDEN" ? "ARCHIVED" : "DRAFT",
        forSale: row.forSale,
        forRent: row.forRent,
        priceCents: row.priceCents,
        priceConfirmed: row.priceConfirmed,
        description: row.description,
        equipment: row.equipment,
        serviceHistory: row.serviceHistory,
        featured: row.featured,
        seoTitle: row.seoTitle,
        seoDescription: row.seoDescription,
        source: row.source,
        sourceCheckedAt: row.sourceCheckedAt ? new Date(row.sourceCheckedAt) : null,
        images: {
          create: row.imageUrls.map((url, index) => ({
            url,
            alt: `${row.brand} ${row.model}`,
            sortOrder: index,
            isCover: index === 0,
          })),
        },
        specifications: { create: parseSpecs(row.specs) },
      },
    });
    await rememberBrand(row.brand);
    await rememberCategory(row.category);
    created += 1;
    await audit(admin.id, "IMPORT", "Motorcycle", bike.id, slug);
  }
  await prisma.importJob.create({
    data: {
      filename: file.name,
      status: parsed.errors.length ? "PARTIAL" : "DONE",
      summary: `Uvoženih: ${created}. Napake: ${parsed.errors.join(" | ") || "ni"}`.slice(0, 2000),
    },
  });
  revalidatePath("/", "layout");
  redirect(`/admin/uvoz?imported=${created}&errors=${parsed.errors.length}`);
}

export async function updateBooking(formData: FormData) {
  const admin = await requireAdmin();
  const id = text(formData, "id");
  const status = text(formData, "status");
  const notes = text(formData, "internalNotes");
  const booking = await prisma.rentalBooking.findUnique({ where: { id } });
  if (!booking) return;
  if (!["NEW", "IN_PROGRESS", "CONFIRMED", "REJECTED", "CANCELLED", "COMPLETED"].includes(status)) return;
  if (status === "CONFIRMED") {
    const overlap = await findOverlap(booking.motorcycleId, booking.pickupAt, booking.returnAt, booking.id);
    if (overlap) redirect("/admin/najem?error=prekrivanje");
    await prisma.$transaction(async (tx) => {
      const again = await tx.rentalBooking.findFirst({
        where: {
          motorcycleId: booking.motorcycleId,
          status: "CONFIRMED",
          NOT: { id: booking.id },
          pickupAt: { lt: booking.returnAt },
          returnAt: { gt: booking.pickupAt },
        },
      });
      const block = await tx.rentalBlock.findFirst({
        where: {
          motorcycleId: booking.motorcycleId,
          startAt: { lt: booking.returnAt },
          endAt: { gt: booking.pickupAt },
        },
      });
      if (again || block) throw new Error("OVERLAP");
      await tx.rentalBooking.update({ where: { id }, data: { status, internalNotes: notes } });
      await tx.bookingEvent.create({ data: { bookingId: id, action: status, note: notes } });
    }).catch(() => {
      redirect("/admin/najem?error=prekrivanje");
    });
  } else {
    await prisma.rentalBooking.update({ where: { id }, data: { status, internalNotes: notes } });
    await prisma.bookingEvent.create({ data: { bookingId: id, action: status, note: notes } });
  }
  await audit(admin.id, "BOOKING", "RentalBooking", id, status);
  revalidatePath("/admin/najem");
  redirect("/admin/najem?saved=1");
}

export async function createBlock(formData: FormData) {
  const admin = await requireAdmin();
  const motorcycleId = text(formData, "motorcycleId");
  let start: Date;
  let end: Date;
  try {
    start = parseInTimeZone(text(formData, "startDate"), text(formData, "startTime") || "00:00");
    end = parseInTimeZone(text(formData, "endDate"), text(formData, "endTime") || "23:59");
  } catch {
    redirect("/admin/najem?error=datum");
  }
  if (end <= start) redirect("/admin/najem?error=datum");
  const overlap = await findOverlap(motorcycleId, start, end);
  if (overlap === "booking") redirect("/admin/najem?error=prekrivanje");
  await prisma.rentalBlock.create({
    data: { motorcycleId, startAt: start, endAt: end, reason: text(formData, "reason") },
  });
  await audit(admin.id, "BLOCK", "RentalBlock", motorcycleId, text(formData, "reason"));
  revalidatePath("/admin/najem");
  redirect("/admin/najem?saved=1");
}

export async function deleteBlock(formData: FormData) {
  const admin = await requireAdmin();
  const id = text(formData, "id");
  await prisma.rentalBlock.delete({ where: { id } });
  await audit(admin.id, "DELETE", "RentalBlock", id);
  revalidatePath("/admin/najem");
  redirect("/admin/najem?saved=1");
}

export async function saveRate(formData: FormData) {
  const admin = await requireAdmin();
  const motorcycleId = text(formData, "motorcycleId");
  const id = text(formData, "rateId");
  const daily = euroToCents(text(formData, "dailyEur"));
  const weekend = euroToCents(text(formData, "weekendEur"));
  const multi = euroToCents(text(formData, "multidayEur"));
  const extra = euroToCents(text(formData, "extraKmEur"));
  const deposit = euroToCents(text(formData, "depositEur"));
  if ([daily, weekend, multi, extra, deposit].some((item) => "error" in item && item.error)) {
    redirect("/admin/najem?error=cena");
  }
  const data = {
    motorcycleId,
    label: text(formData, "label") || "Osnovni cenik",
    dailyCents: daily.cents,
    weekendCents: weekend.cents,
    multidayCents: multi.cents,
    seasonStart: text(formData, "seasonStart"),
    seasonEnd: text(formData, "seasonEnd"),
    kmLimitPerDay: optionalInt(formData, "kmLimitPerDay"),
    extraKmCents: extra.cents,
    depositCents: deposit.cents,
    extrasNote: text(formData, "extrasNote"),
    confirmed: checked(formData, "confirmed") && Boolean(daily.cents || weekend.cents || multi.cents),
  };
  if (id) await prisma.rentalRate.update({ where: { id }, data });
  else await prisma.rentalRate.create({ data });
  await audit(admin.id, "RATE", "RentalRate", motorcycleId);
  revalidatePath("/", "layout");
  redirect("/admin/najem?saved=1");
}

export async function updateInquiry(formData: FormData) {
  const admin = await requireAdmin();
  const id = text(formData, "id");
  const status = text(formData, "status");
  const notes = text(formData, "internalNotes");
  if (!["NEW", "IN_PROGRESS", "DONE"].includes(status)) return;
  await prisma.inquiry.update({ where: { id }, data: { status, internalNotes: notes } });
  await prisma.inquiryEvent.create({ data: { inquiryId: id, action: status, note: notes } });
  await audit(admin.id, "INQUIRY", "Inquiry", id, status);
  revalidatePath("/admin/povprasevanja");
  redirect(`/admin/povprasevanja/${id}?saved=1`);
}

export async function saveHeroSettings(formData: FormData) {
  const admin = await requireAdmin();
  await ensureSettingsSynced();

  let heroImage = text(formData, "heroImage") || "/images/hero/hero-elmoto.webp";
  let heroImageMobile = text(formData, "heroImageMobile") || "/images/hero/hero-elmoto-mobile.webp";

  const desktopFile = formData.get("heroImageFile");
  if (desktopFile instanceof File && desktopFile.size > 0) {
    heroImage = await saveImage(desktopFile);
  }

  const mobileFile = formData.get("heroImageMobileFile");
  if (mobileFile instanceof File && mobileFile.size > 0) {
    heroImageMobile = await saveImage(mobileFile);
  }

  const entries = [
    ["hero_image", heroImage],
    ["hero_image_mobile", heroImageMobile],
    ["hero_kicker", text(formData, "heroKicker")],
    ["hero_title", text(formData, "heroTitle")],
    ["hero_text", text(formData, "heroText")],
    ["hero_button", text(formData, "heroButton")],
    ["hero_focus_x", String(optionalInt(formData, "heroFocusX") ?? 68)],
    ["hero_focus_y", String(optionalInt(formData, "heroFocusY") ?? 28)],
    ["hero_overlay", String(optionalInt(formData, "heroOverlay") ?? 72)],
  ] as const;

  for (const [key, value] of entries) {
    await prisma.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
  await persistSettingsSnapshot();
  await audit(admin.id, "HERO_SETTINGS", "SiteSetting");
  revalidatePath("/", "layout");
  redirect("/admin/vsebina?saved=1");
}

export async function saveSettings(formData: FormData) {
  const admin = await requireAdmin();
  await ensureSettingsSynced();
  const entries = [
    ["phone", text(formData, "phone")],
    ["email", text(formData, "email")],
    ["facebook", text(formData, "facebook")],
    ["instagram", text(formData, "instagram")],
    ["street", text(formData, "street")],
    ["postal_code", text(formData, "postalCode")],
    ["city", text(formData, "city")],
    ["hours", text(formData, "hours")],
    ["notify_email", text(formData, "notifyEmail")],
    ["newsletter_enabled", checked(formData, "newsletter") ? "true" : "false"],
    ["seo_home_title", text(formData, "seoHomeTitle")],
    ["seo_home_description", text(formData, "seoHomeDescription")],
  ] as const;
  for (const [key, value] of entries) {
    await prisma.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
  await persistSettingsSnapshot();
  await audit(admin.id, "SETTINGS", "SiteSetting");
  revalidatePath("/", "layout");
  redirect("/admin/vsebina?saved=1");
}

export async function savePage(formData: FormData) {
  const admin = await requireAdmin();
  const slug = text(formData, "slug");
  await prisma.page.upsert({
    where: { slug },
    update: {
      title: text(formData, "title"),
      body: String(formData.get("body") ?? ""),
      seoTitle: text(formData, "seoTitle"),
      seoDescription: text(formData, "seoDescription"),
      confirmed: checked(formData, "confirmed"),
    },
    create: {
      slug,
      title: text(formData, "title"),
      body: String(formData.get("body") ?? ""),
      seoTitle: text(formData, "seoTitle"),
      seoDescription: text(formData, "seoDescription"),
      confirmed: checked(formData, "confirmed"),
    },
  });
  await audit(admin.id, "PAGE", "Page", slug);
  revalidatePath("/", "layout");
  redirect("/admin/vsebina?saved=1");
}

export async function saveFaq(formData: FormData) {
  const admin = await requireAdmin();
  const id = text(formData, "id");
  const data = {
    category: text(formData, "category") || "Splošno",
    question: text(formData, "question"),
    answer: text(formData, "answer"),
    sortOrder: optionalInt(formData, "sortOrder") ?? 0,
    published: checked(formData, "published"),
  };
  if (!data.question || !data.answer) redirect("/admin/vsebina?error=faq");
  if (id) await prisma.faqItem.update({ where: { id }, data });
  else await prisma.faqItem.create({ data });
  await audit(admin.id, id ? "UPDATE" : "CREATE", "FaqItem", id);
  revalidatePath("/pogosta-vprasanja");
  redirect("/admin/vsebina?saved=1");
}

export async function deleteFaq(formData: FormData) {
  const admin = await requireAdmin();
  const id = text(formData, "id");
  await prisma.faqItem.delete({ where: { id } });
  await audit(admin.id, "DELETE", "FaqItem", id);
  revalidatePath("/pogosta-vprasanja");
  redirect("/admin/vsebina?saved=1");
}

export async function saveTestimonial(formData: FormData) {
  const admin = await requireAdmin();
  const id = text(formData, "id");
  const ratingRaw = optionalInt(formData, "rating");
  const data = {
    authorName: text(formData, "authorName"),
    text: text(formData, "text"),
    rating: ratingRaw && ratingRaw >= 1 && ratingRaw <= 5 ? ratingRaw : null,
    source: text(formData, "source"),
    published: checked(formData, "published"),
  };
  if (!data.authorName || !data.text) redirect("/admin/vsebina?error=ocena");
  if (id) await prisma.testimonial.update({ where: { id }, data });
  else await prisma.testimonial.create({ data });
  await audit(admin.id, "TESTIMONIAL", "Testimonial", id);
  revalidatePath("/");
  redirect("/admin/vsebina?saved=1");
}

export async function deleteTestimonial(formData: FormData) {
  const admin = await requireAdmin();
  const id = text(formData, "id");
  await prisma.testimonial.delete({ where: { id } });
  await audit(admin.id, "DELETE", "Testimonial", id);
  revalidatePath("/");
  redirect("/admin/vsebina?saved=1");
}

export async function saveMedia(formData: FormData) {
  const admin = await requireAdmin();
  const returnTo = text(formData, "returnTo") || "/admin/galerija";
  const id = text(formData, "id");
  const kind = text(formData, "kind") || "gallery";
  const file = formData.get("file");
  let url = text(formData, "imageUrl");

  if (file instanceof File && file.size > 0) {
    try {
      url = await saveImage(file);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "datoteka";
      redirect(`${returnTo}?error=${encodeURIComponent(msg)}`);
    }
  }

  if (id) {
    const existing = await prisma.mediaAsset.findUnique({ where: { id } });
    if (!existing) redirect(`${returnTo}?error=neobstojece`);

    const finalUrl = url || existing.url;
    if (url && url !== existing.url) {
      await removeUpload(existing.url);
    }

    const sortOrderVal = optionalInt(formData, "sortOrder");

    await prisma.mediaAsset.update({
      where: { id },
      data: {
        url: finalUrl,
        alt: text(formData, "alt"),
        linkUrl: text(formData, "linkUrl"),
        published: formData.has("published") ? checked(formData, "published") : existing.published,
        ...(sortOrderVal !== null ? { sortOrder: sortOrderVal } : {}),
      },
    });
    await persistMediaSnapshot();
    await audit(admin.id, "UPDATE", "MediaAsset", id);
    revalidatePath("/", "layout");
    revalidatePath("/galerija");
    revalidatePath("/admin/galerija");
    redirect(`${returnTo}?saved=1`);
  }

  if (!url) {
    redirect(`${returnTo}?error=datoteka`);
  }

  const count = await prisma.mediaAsset.count({ where: { kind } });
  await prisma.mediaAsset.create({
    data: {
      url,
      alt: text(formData, "alt"),
      kind,
      linkUrl: text(formData, "linkUrl"),
      sortOrder: optionalInt(formData, "sortOrder") ?? count,
      published: formData.has("published") ? checked(formData, "published") : true,
    },
  });
  await persistMediaSnapshot();
  await audit(admin.id, "UPLOAD", "MediaAsset", kind);
  revalidatePath("/", "layout");
  revalidatePath("/galerija");
  revalidatePath("/admin/galerija");
  redirect(`${returnTo}?saved=1`);
}

export const uploadMedia = saveMedia;

export async function deleteMedia(formData: FormData) {
  const admin = await requireAdmin();
  const returnTo = text(formData, "returnTo") || "/admin/galerija";
  const id = text(formData, "id");
  if (!id) redirect(`${returnTo}?saved=1`);
  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) redirect(`${returnTo}?saved=1`);
  await prisma.mediaAsset.delete({ where: { id } });
  await removeUpload(asset.url);
  await persistMediaSnapshot();
  await audit(admin.id, "DELETE", "MediaAsset", id);
  revalidatePath("/", "layout");
  revalidatePath("/galerija");
  revalidatePath("/admin/galerija");
  redirect(`${returnTo}?saved=1`);
}

export async function saveEquipment(formData: FormData) {
  const admin = await requireAdmin();
  const id = text(formData, "id");
  const title = text(formData, "title");
  if (!title) redirect("/admin/oprema?error=naziv");

  const priceEurStr = text(formData, "priceEur");
  let priceCents: number | null = null;
  if (priceEurStr) {
    const priceParsed = euroToCents(priceEurStr);
    if (!("error" in priceParsed)) {
      priceCents = priceParsed.cents;
    }
  }

  let imageUrl = text(formData, "imageUrl");
  const file = formData.get("file");
  if (file instanceof File && file.size > 0) {
    try {
      imageUrl = await saveImage(file);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "slika";
      redirect(`/admin/oprema?error=${encodeURIComponent(msg)}`);
    }
  }

  let finalImageUrl = imageUrl || "";
  if (id) {
    const existing = await prisma.equipment.findUnique({ where: { id } });
    if (imageUrl && existing?.imageUrl && existing.imageUrl !== imageUrl) {
      await removeUpload(existing.imageUrl);
    }
    if (!finalImageUrl && existing?.imageUrl) {
      finalImageUrl = existing.imageUrl;
    }
  }

  const data = {
    title,
    priceCents,
    description: text(formData, "description"),
    category: text(formData, "category") || "Splošno",
    imageUrl: finalImageUrl,
    avtonetUrl: text(formData, "avtonetUrl"),
    sortOrder: optionalInt(formData, "sortOrder") ?? 0,
    published: checked(formData, "published"),
  };

  if (id) {
    await prisma.equipment.update({ where: { id }, data });
  } else {
    await prisma.equipment.create({ data });
  }

  await persistEquipmentSnapshot();
  await audit(admin.id, id ? "UPDATE" : "CREATE", "Equipment", id || title);
  revalidatePath("/");
  revalidatePath("/oprema");
  revalidatePath("/admin/oprema");
  redirect("/admin/oprema?saved=1");
}

export async function deleteEquipment(formData: FormData) {
  const admin = await requireAdmin();
  const id = text(formData, "id");
  if (!id) redirect("/admin/oprema");
  const item = await prisma.equipment.findUnique({ where: { id } });
  if (!item) redirect("/admin/oprema?saved=1");

  if (item.imageUrl) {
    await removeUpload(item.imageUrl);
  }

  await prisma.equipment.delete({ where: { id } });
  await persistEquipmentSnapshot();
  await audit(admin.id, "DELETE", "Equipment", id);
  revalidatePath("/");
  revalidatePath("/oprema");
  revalidatePath("/admin/oprema");
  redirect("/admin/oprema?saved=1");
}

export async function createManualBooking(formData: FormData) {
  const admin = await requireAdmin();
  const motorcycleId = text(formData, "motorcycleId");
  const pickup = parseInTimeZone(text(formData, "pickupDate"), text(formData, "pickupTime") || "09:00");
  const ret = parseInTimeZone(text(formData, "returnDate"), text(formData, "returnTime") || "18:00");
  if (ret <= pickup) redirect("/admin/najem?error=datum");
  const overlap = await findOverlap(motorcycleId, pickup, ret);
  if (overlap) redirect("/admin/najem?error=prekrivanje");
  const days = Math.ceil((ret.getTime() - pickup.getTime()) / 86_400_000);
  await prisma.$transaction(async (tx) => {
    const again = await tx.rentalBooking.findFirst({
      where: {
        motorcycleId,
        status: "CONFIRMED",
        pickupAt: { lt: ret },
        returnAt: { gt: pickup },
      },
    });
    if (again) throw new Error("OVERLAP");
    await tx.rentalBooking.create({
      data: {
        motorcycleId,
        name: text(formData, "name") || "Ročni vnos",
        email: text(formData, "email") || "rocno@elmoto.local",
        phone: text(formData, "phone") || "",
        licenseCategory: text(formData, "licenseCategory") || "ni navedeno",
        message: text(formData, "message"),
        pickupAt: pickup,
        returnAt: ret,
        days,
        status: "CONFIRMED",
        termsAccepted: true,
        privacyAccepted: true,
        internalNotes: "Ročni vnos obstoječe rezervacije.",
        events: { create: { action: "CONFIRMED", note: "Ročni vnos administratorja." } },
      },
    });
  }).catch(() => redirect("/admin/najem?error=prekrivanje"));
  await audit(admin.id, "MANUAL_BOOKING", "RentalBooking", motorcycleId);
  revalidatePath("/admin/najem");
  redirect("/admin/najem?saved=1");
}

export async function saveKoveModel(formData: FormData) {
  const admin = await requireAdmin();
  const slug = text(formData, "slug")?.toLowerCase().trim() || "";
  const originalSlug = text(formData, "originalSlug")?.trim() || "";
  const name = text(formData, "name") || "";
  if (!name) redirect("/admin/kove?error=naziv");
  const modelSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  let imageUrl = text(formData, "imageUrl");
  const file = formData.get("file");
  if (file instanceof File && file.size > 0) {
    try {
      imageUrl = await saveImage(file);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "slika";
      redirect(`/admin/kove?error=${encodeURIComponent(msg)}`);
    }
  }

  const rawFeatures = text(formData, "features") || "";
  const features = rawFeatures
    .split(/[\n,;]+/)
    .map((f) => f.trim())
    .filter(Boolean);

  const existingModels = await getKoveModels();
  let updatedModels: KoveModel[];

  const newModelData: KoveModel = {
    slug: modelSlug,
    name,
    image: imageUrl || "",
    imageWidth: 1200,
    imageHeight: 800,
    description: text(formData, "description") || "",
    features,
    sourceUrl: text(formData, "sourceUrl") || "https://kove.si",
    checkedOn: new Date().toISOString().slice(0, 10),
    published: checked(formData, "published"),
  };

  const targetSlug = originalSlug || modelSlug;
  const foundIndex = existingModels.findIndex((m) => m.slug === targetSlug);

  if (foundIndex >= 0) {
    if (!newModelData.image && existingModels[foundIndex].image) {
      newModelData.image = existingModels[foundIndex].image;
    }
    updatedModels = [...existingModels];
    updatedModels[foundIndex] = newModelData;
  } else {
    updatedModels = [...existingModels, newModelData];
  }

  await prisma.siteSetting.upsert({
    where: { key: "kove_models_json" },
    update: { value: JSON.stringify(updatedModels) },
    create: { key: "kove_models_json", value: JSON.stringify(updatedModels) },
  });

  await persistSettingsSnapshot();
  await audit(admin.id, originalSlug ? "UPDATE" : "CREATE", "KoveModel", modelSlug);
  revalidatePath("/");
  revalidatePath("/kove");
  revalidatePath("/admin/kove");
  redirect("/admin/kove?saved=1");
}

export async function deleteKoveModel(formData: FormData) {
  const admin = await requireAdmin();
  const slug = text(formData, "slug");
  if (!slug) redirect("/admin/kove");

  const existingModels = await getKoveModels();
  const updatedModels = existingModels.filter((m) => m.slug !== slug);

  await prisma.siteSetting.upsert({
    where: { key: "kove_models_json" },
    update: { value: JSON.stringify(updatedModels) },
    create: { key: "kove_models_json", value: JSON.stringify(updatedModels) },
  });

  await persistSettingsSnapshot();
  await audit(admin.id, "DELETE", "KoveModel", slug);
  revalidatePath("/");
  revalidatePath("/kove");
  revalidatePath("/admin/kove");
  redirect("/admin/kove?saved=1");
}

export async function resetKoveModels() {
  const admin = await requireAdmin();
  await prisma.siteSetting.upsert({
    where: { key: "kove_models_json" },
    update: { value: JSON.stringify(koveModels) },
    create: { key: "kove_models_json", value: JSON.stringify(koveModels) },
  });
  await persistSettingsSnapshot();
  await audit(admin.id, "RESET", "KoveModel", "defaults");
  revalidatePath("/");
  revalidatePath("/kove");
  revalidatePath("/admin/kove");
  redirect("/admin/kove?saved=1");
}
