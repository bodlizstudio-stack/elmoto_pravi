import { prisma } from "@/lib/db";

const CATALOG_KEY = "elmoto-shared-catalog-v2";
const IMG_KEY_PREFIX = "elmoto-shared-img-v2-";
const ONE_YEAR_SECONDS = 31536000;

type SerializedImage = {
  id: string;
  url: string;
  alt: string;
  sortOrder: number;
  isCover: boolean;
};

type SerializedSpec = {
  id: string;
  label: string;
  value: string;
};

type SerializedBike = {
  id: string;
  slug: string;
  brand: string;
  model: string;
  variant: string;
  year: number | null;
  firstRegistration: string;
  mileageKm: number | null;
  engineCc: number | null;
  powerKw: number | null;
  powerHp: number | null;
  fuelType: string;
  engineType: string;
  transmission: string;
  driveType: string;
  color: string;
  licenseCategory: string;
  category: string;
  condition: string;
  status: string;
  publication: string;
  forSale: boolean;
  forRent: boolean;
  priceCents: number | null;
  priceConfirmed: boolean;
  priceOnRequest: boolean;
  cardSummary: string;
  description: string;
  equipment: string;
  serviceHistory: string;
  featured: boolean;
  featuredOrder: number;
  seoTitle: string;
  seoDescription: string;
  source: string;
  sourcePlatform: string;
  sourceUrl: string;
  externalId: string;
  importStatus: string;
  syncEnabled: boolean;
  importedAt: string | null;
  lastSyncedAt: string | null;
  sourceCheckedAt: string | null;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  images: SerializedImage[];
  specifications: SerializedSpec[];
};

type CatalogSnapshot = {
  version: number;
  bikes: SerializedBike[];
};

const globalSync = globalThis as unknown as {
  __elmotoSyncedVersion?: number;
  __elmotoSyncPromise?: Promise<void> | null;
};

// Obtain Next.js's internal IncrementalCache instance (backed by Vercel's shared FetchCache in production)
function getIncrementalCache(): {
  get: (key: string, ctx: Record<string, unknown>) => Promise<{ value?: { data?: { body?: string } } } | null>;
  set: (key: string, data: Record<string, unknown>, ctx: Record<string, unknown>) => Promise<void>;
} | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { workAsyncStorage } = require("next/dist/server/app-render/work-async-storage.external");
    const store = workAsyncStorage?.getStore?.();
    const cache = store?.incrementalCache || (globalThis as Record<string, unknown>).__incrementalCache;
    if (cache && typeof cache.get === "function" && typeof cache.set === "function") {
      return cache;
    }
  } catch {
    // Ignore outside Next.js runtime (e.g. unit tests)
  }
  return null;
}

async function cacheGet<T>(key: string): Promise<T | null> {
  const cache = getIncrementalCache();
  if (!cache) return null;
  try {
    const entry = await cache.get(key, {
      kind: "FETCH",
      revalidate: ONE_YEAR_SECONDS,
      tags: [],
      softTags: [],
      fetchIdx: 1,
      fetchUrl: `https://elmoto.internal/${key}`,
    });
    const body = entry?.value?.data?.body;
    if (!body) return null;
    return JSON.parse(body) as T;
  } catch {
    return null;
  }
}

async function cacheSet<T>(key: string, value: T): Promise<void> {
  const cache = getIncrementalCache();
  if (!cache) return;
  try {
    await cache.set(
      key,
      {
        kind: "FETCH",
        data: {
          headers: {},
          body: JSON.stringify(value),
          status: 200,
          url: `https://elmoto.internal/${key}`,
        },
        revalidate: ONE_YEAR_SECONDS,
      },
      {
        fetchCache: true,
        tags: [],
        fetchIdx: 1,
        fetchUrl: `https://elmoto.internal/${key}`,
      },
    );
  } catch {
    // Ignore cache write errors
  }
}

export async function persistDbSnapshot(): Promise<void> {
  const cache = getIncrementalCache();
  if (!cache) return;

  const rows = await prisma.motorcycle.findMany({
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      specifications: true,
    },
    orderBy: [{ createdAt: "desc" }],
  });

  const version = Date.now();
  const bikes: SerializedBike[] = rows.map((bike) => ({
    id: bike.id,
    slug: bike.slug,
    brand: bike.brand,
    model: bike.model,
    variant: bike.variant,
    year: bike.year,
    firstRegistration: bike.firstRegistration,
    mileageKm: bike.mileageKm,
    engineCc: bike.engineCc,
    powerKw: bike.powerKw,
    powerHp: bike.powerHp,
    fuelType: bike.fuelType,
    engineType: bike.engineType,
    transmission: bike.transmission,
    driveType: bike.driveType,
    color: bike.color,
    licenseCategory: bike.licenseCategory,
    category: bike.category,
    condition: bike.condition,
    status: bike.status,
    publication: bike.publication,
    forSale: bike.forSale,
    forRent: bike.forRent,
    priceCents: bike.priceCents,
    priceConfirmed: bike.priceConfirmed,
    priceOnRequest: bike.priceOnRequest,
    cardSummary: bike.cardSummary,
    description: bike.description,
    equipment: bike.equipment,
    serviceHistory: bike.serviceHistory,
    featured: bike.featured,
    featuredOrder: bike.featuredOrder,
    seoTitle: bike.seoTitle,
    seoDescription: bike.seoDescription,
    source: bike.source,
    sourcePlatform: bike.sourcePlatform,
    sourceUrl: bike.sourceUrl,
    externalId: bike.externalId,
    importStatus: bike.importStatus,
    syncEnabled: bike.syncEnabled,
    importedAt: bike.importedAt ? bike.importedAt.toISOString() : null,
    lastSyncedAt: bike.lastSyncedAt ? bike.lastSyncedAt.toISOString() : null,
    sourceCheckedAt: bike.sourceCheckedAt ? bike.sourceCheckedAt.toISOString() : null,
    publishedAt: bike.publishedAt.toISOString(),
    createdAt: bike.createdAt.toISOString(),
    updatedAt: bike.updatedAt.toISOString(),
    images: bike.images.map((img) => ({
      id: img.id,
      url: img.url,
      alt: img.alt,
      sortOrder: img.sortOrder,
      isCover: img.isCover,
    })),
    specifications: bike.specifications.map((spec) => ({
      id: spec.id,
      label: spec.label,
      value: spec.value,
    })),
  }));

  // Store individual large images separately if needed so the catalog snapshot stays under FetchCache's 2MB limit
  const fullSnapshot: CatalogSnapshot = { version, bikes };
  const serializedSize = JSON.stringify(fullSnapshot).length;

  if (serializedSize > 1_400_000) {
    await Promise.all(
      bikes.flatMap((bike) =>
        bike.images.map(async (img) => {
          if (img.url.length > 1000) {
            await cacheSet(`${IMG_KEY_PREFIX}${img.id}`, { url: img.url });
          }
        }),
      ),
    );
    const compactBikes: SerializedBike[] = bikes.map((bike) => ({
      ...bike,
      images: bike.images.map((img) => ({
        ...img,
        url: img.url.length > 1000 ? "__SPLIT__" : img.url,
      })),
    }));
    await cacheSet(CATALOG_KEY, { version, bikes: compactBikes });
  } else {
    await cacheSet(CATALOG_KEY, fullSnapshot);
  }

  globalSync.__elmotoSyncedVersion = version;
}

export async function ensureDbSynced(): Promise<void> {
  const cache = getIncrementalCache();
  if (!cache) return;

  const snapshot = await cacheGet<CatalogSnapshot>(CATALOG_KEY);
  if (!snapshot || typeof snapshot.version !== "number" || !Array.isArray(snapshot.bikes)) {
    return;
  }

  if (globalSync.__elmotoSyncedVersion === snapshot.version) {
    return;
  }

  if (globalSync.__elmotoSyncPromise) {
    await globalSync.__elmotoSyncPromise;
    if (globalSync.__elmotoSyncedVersion === snapshot.version) return;
  }

  const doSync = async () => {
    const existingImages = await prisma.motorcycleImage.findMany({
      select: { id: true, url: true },
    });
    const localImgMap = new Map(existingImages.map((img) => [img.id, img.url]));

    for (const bike of snapshot.bikes) {
      for (const img of bike.images) {
        if (img.url === "__SPLIT__") {
          const fromLocal = localImgMap.get(img.id);
          if (fromLocal && fromLocal !== "__SPLIT__") {
            img.url = fromLocal;
          } else {
            const remote = await cacheGet<{ url: string }>(`${IMG_KEY_PREFIX}${img.id}`);
            img.url = remote?.url || "";
          }
        }
      }
      bike.images = bike.images.filter((img) => Boolean(img.url));
    }

    const snapshotIds = snapshot.bikes.map((b) => b.id);

    await prisma.$transaction(async (tx) => {
      if (snapshotIds.length === 0) {
        await tx.motorcycle.deleteMany({});
      } else {
        await tx.motorcycle.deleteMany({
          where: { id: { notIn: snapshotIds } },
        });
      }

      for (const bike of snapshot.bikes) {
        const data = {
          slug: bike.slug,
          brand: bike.brand,
          model: bike.model,
          variant: bike.variant,
          year: bike.year,
          firstRegistration: bike.firstRegistration,
          mileageKm: bike.mileageKm,
          engineCc: bike.engineCc,
          powerKw: bike.powerKw,
          powerHp: bike.powerHp,
          fuelType: bike.fuelType,
          engineType: bike.engineType,
          transmission: bike.transmission,
          driveType: bike.driveType,
          color: bike.color,
          licenseCategory: bike.licenseCategory,
          category: bike.category,
          condition: bike.condition,
          status: bike.status,
          publication: bike.publication,
          forSale: bike.forSale,
          forRent: bike.forRent,
          priceCents: bike.priceCents,
          priceConfirmed: bike.priceConfirmed,
          priceOnRequest: bike.priceOnRequest,
          cardSummary: bike.cardSummary,
          description: bike.description,
          equipment: bike.equipment,
          serviceHistory: bike.serviceHistory,
          featured: bike.featured,
          featuredOrder: bike.featuredOrder,
          seoTitle: bike.seoTitle,
          seoDescription: bike.seoDescription,
          source: bike.source,
          sourcePlatform: bike.sourcePlatform,
          sourceUrl: bike.sourceUrl,
          externalId: bike.externalId,
          importStatus: bike.importStatus,
          syncEnabled: bike.syncEnabled,
          importedAt: bike.importedAt ? new Date(bike.importedAt) : null,
          lastSyncedAt: bike.lastSyncedAt ? new Date(bike.lastSyncedAt) : null,
          sourceCheckedAt: bike.sourceCheckedAt ? new Date(bike.sourceCheckedAt) : null,
          publishedAt: new Date(bike.publishedAt),
          createdAt: new Date(bike.createdAt),
          updatedAt: new Date(bike.updatedAt),
        };

        await tx.motorcycle.upsert({
          where: { id: bike.id },
          update: data,
          create: { id: bike.id, ...data },
        });

        await tx.motorcycleImage.deleteMany({ where: { motorcycleId: bike.id } });
        if (bike.images.length > 0) {
          await tx.motorcycleImage.createMany({
            data: bike.images.map((img) => ({
              id: img.id,
              motorcycleId: bike.id,
              url: img.url,
              alt: img.alt,
              sortOrder: img.sortOrder,
              isCover: img.isCover,
            })),
          });
        }

        await tx.motorcycleSpecification.deleteMany({ where: { motorcycleId: bike.id } });
        if (bike.specifications.length > 0) {
          await tx.motorcycleSpecification.createMany({
            data: bike.specifications.map((spec) => ({
              id: spec.id,
              motorcycleId: bike.id,
              label: spec.label,
              value: spec.value,
            })),
          });
        }
      }
    });

    globalSync.__elmotoSyncedVersion = snapshot.version;
  };

  globalSync.__elmotoSyncPromise = doSync().finally(() => {
    globalSync.__elmotoSyncPromise = null;
  });
  await globalSync.__elmotoSyncPromise;
}
