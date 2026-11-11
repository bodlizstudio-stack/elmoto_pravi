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
  __elmotoLastCheckedAt?: number;
};

const SNAPSHOT_BASE_URL =
  process.env.BLOB_BASE_URL ||
  (process.env.BLOB_STORE_ID
    ? `https://${process.env.BLOB_STORE_ID.replace(/^store_/i, "").toLowerCase()}.public.blob.vercel-storage.com`
    : "https://js2xtopypf0trcpc.public.blob.vercel-storage.com");

type MemoryEntry<T> = {
  data: T | null;
  etag: string | null;
  checkedAt: number;
  version?: number;
};

const memoryStore = new Map<string, MemoryEntry<unknown>>();

// Premor med preverjanji na aktivnih instancah: 5 minut za javne obiskovalce
const PUBLIC_SYNC_COOLDOWN_MS = 5 * 60 * 1000;

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

async function blobSet<T>(key: string, value: T): Promise<void> {
  const hasBlob = Boolean(process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN);
  const version = (value as { version?: number })?.version ?? Date.now();

  // Takoj posodobi lokalni pomnilnik te instance
  memoryStore.set(key, {
    data: value,
    etag: null,
    checkedAt: Date.now(),
    version,
  });

  if (hasBlob) {
    try {
      const { put } = await import("@vercel/blob");
      await put(`snapshots/${key}.json`, JSON.stringify(value), {
        access: "public",
        contentType: "application/json",
        addRandomSuffix: false,
        allowOverwrite: true,
        cacheControlMaxAge: 300, // 5 min CDN cache
        ...(process.env.BLOB_READ_WRITE_TOKEN ? { token: process.env.BLOB_READ_WRITE_TOKEN } : {}),
      });

      try {
        const { revalidateTag } = await import("next/cache");
        revalidateTag(`snapshot-${key}`, { expire: 0 });
      } catch {
        // Ignoriraj izven zahteve
      }
      return;
    } catch (err) {
      console.error(`[shared-store] Error writing blob snapshot for ${key}:`, err);
    }
  }
  await cacheSet(key, value);
}

async function blobGet<T>(key: string, force = false): Promise<T | null> {
  const now = Date.now();
  const cached = memoryStore.get(key) as MemoryEntry<T> | undefined;

  // Če je instanca pred kratkim že preverila in ni vsiljeno, takoj vrni iz pomnilnika (0 Vercel Blob klicev)
  if (!force && cached && now - cached.checkedAt < PUBLIC_SYNC_COOLDOWN_MS) {
    return cached.data;
  }

  const hasBlob = Boolean(process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN);
  if (hasBlob) {
    try {
      const url = `${SNAPSHOT_BASE_URL}/snapshots/${key}.json`;
      const headers: Record<string, string> = {};
      if (cached?.etag && !force) {
        headers["If-None-Match"] = cached.etag;
      }

      // Uporabi Next.js Data Cache za 5 minut predpomnjenja, brez klicanja head() API
      const res = await fetch(url, {
        headers,
        next: {
          revalidate: 300,
          tags: [`snapshot-${key}`],
        },
      });

      if (res.status === 304 && cached) {
        cached.checkedAt = now;
        return cached.data;
      }

      if (res.ok) {
        const etag = res.headers.get("etag");
        const data = (await res.json()) as T;
        memoryStore.set(key, {
          data,
          etag,
          checkedAt: now,
          version: (data as { version?: number })?.version,
        });
        return data;
      }
    } catch {
      // Snapshot še ne obstaja ali je omrežna napaka
    }
  }

  if (cached?.data) {
    cached.checkedAt = now;
    return cached.data;
  }

  return cacheGet<T>(key);
}

export async function persistDbSnapshot(): Promise<void> {
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

  const fullSnapshot: CatalogSnapshot = { version, bikes };
  await blobSet(CATALOG_KEY, fullSnapshot);
  globalSync.__elmotoSyncedVersion = version;
  globalSync.__elmotoLastCheckedAt = Date.now();
}

export async function ensureDbSynced(options?: { force?: boolean }): Promise<void> {
  const now = Date.now();
  if (
    !options?.force &&
    globalSync.__elmotoSyncedVersion &&
    globalSync.__elmotoLastCheckedAt &&
    now - globalSync.__elmotoLastCheckedAt < PUBLIC_SYNC_COOLDOWN_MS
  ) {
    return;
  }

  if (globalSync.__elmotoSyncPromise) {
    await globalSync.__elmotoSyncPromise;
    if (!options?.force && globalSync.__elmotoSyncedVersion) return;
  }

  const snapshot = await blobGet<CatalogSnapshot>(CATALOG_KEY, options?.force);
  globalSync.__elmotoLastCheckedAt = now;

  if (!snapshot || typeof snapshot.version !== "number" || !Array.isArray(snapshot.bikes)) {
    return;
  }

  if (globalSync.__elmotoSyncedVersion === snapshot.version) {
    return;
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

// ---------------------------------------------------------------------------
// Nastavitve strani (SiteSetting) – enaka trajna shramba kot za katalog, da so
// spremembe naslovnice in podatkov podjetja vidne na vseh strežniških instancah.
// ---------------------------------------------------------------------------

const SETTINGS_KEY = "elmoto-shared-settings-v1";

type SettingsSnapshot = { version: number; rows: { key: string; value: string }[] };

const globalSettingsSync = globalThis as unknown as {
  __elmotoSettingsVersion?: number;
  __elmotoLastCheckedAt?: number;
};

const PRIVATE_SETTING_KEYS = new Set(["admin_reset"]);

export async function persistSettingsSnapshot(): Promise<void> {
  const rows = (await prisma.siteSetting.findMany()).filter((row) => !PRIVATE_SETTING_KEYS.has(row.key));
  const version = Date.now();
  await blobSet(SETTINGS_KEY, { version, rows });
  globalSettingsSync.__elmotoSettingsVersion = version;
  globalSettingsSync.__elmotoLastCheckedAt = Date.now();
}

export async function ensureSettingsSynced(options?: { force?: boolean }): Promise<void> {
  const now = Date.now();
  if (
    !options?.force &&
    globalSettingsSync.__elmotoSettingsVersion &&
    globalSettingsSync.__elmotoLastCheckedAt &&
    now - globalSettingsSync.__elmotoLastCheckedAt < PUBLIC_SYNC_COOLDOWN_MS
  ) {
    return;
  }

  const snapshot = await blobGet<SettingsSnapshot>(SETTINGS_KEY, options?.force);
  globalSettingsSync.__elmotoLastCheckedAt = now;

  if (!snapshot || typeof snapshot.version !== "number" || !Array.isArray(snapshot.rows)) return;
  if (globalSettingsSync.__elmotoSettingsVersion === snapshot.version) return;
  for (const row of snapshot.rows) {
    if (!row?.key || PRIVATE_SETTING_KEYS.has(row.key)) continue;
    await prisma.siteSetting.upsert({
      where: { key: row.key },
      update: { value: String(row.value ?? "") },
      create: { key: row.key, value: String(row.value ?? "") },
    });
  }
  globalSettingsSync.__elmotoSettingsVersion = snapshot.version;
}

// ---------------------------------------------------------------------------
// MediaAsset (Galerija in slike)
// ---------------------------------------------------------------------------

const MEDIA_KEY = "elmoto-shared-media-v1";
type MediaSnapshot = {
  version: number;
  items: {
    id: string;
    url: string;
    alt: string;
    kind: string;
    linkUrl: string;
    sortOrder: number;
    published: boolean;
    createdAt: string;
  }[];
};
const globalMediaSync = globalThis as unknown as {
  __elmotoMediaVersion?: number;
  __elmotoLastCheckedAt?: number;
};

export async function persistMediaSnapshot(): Promise<void> {
  const items = await prisma.mediaAsset.findMany();
  const version = Date.now();
  await blobSet(MEDIA_KEY, {
    version,
    items: items.map((m) => ({
      ...m,
      createdAt: m.createdAt.toISOString(),
    })),
  });
  globalMediaSync.__elmotoMediaVersion = version;
  globalMediaSync.__elmotoLastCheckedAt = Date.now();
}

export async function ensureMediaSynced(options?: { force?: boolean }): Promise<void> {
  const now = Date.now();
  if (
    !options?.force &&
    globalMediaSync.__elmotoMediaVersion &&
    globalMediaSync.__elmotoLastCheckedAt &&
    now - globalMediaSync.__elmotoLastCheckedAt < PUBLIC_SYNC_COOLDOWN_MS
  ) {
    return;
  }

  const snapshot = await blobGet<MediaSnapshot>(MEDIA_KEY, options?.force);
  globalMediaSync.__elmotoLastCheckedAt = now;

  if (!snapshot || typeof snapshot.version !== "number" || !Array.isArray(snapshot.items)) return;
  if (globalMediaSync.__elmotoMediaVersion === snapshot.version) return;

  const currentIds = snapshot.items.map((i) => i.id);
  await prisma.$transaction(async (tx) => {
    if (currentIds.length === 0) {
      await tx.mediaAsset.deleteMany({});
    } else {
      await tx.mediaAsset.deleteMany({
        where: { id: { notIn: currentIds } },
      });
    }
    for (const item of snapshot.items) {
      await tx.mediaAsset.upsert({
        where: { id: item.id },
        update: {
          url: item.url,
          alt: item.alt,
          kind: item.kind,
          linkUrl: item.linkUrl,
          sortOrder: item.sortOrder,
          published: item.published,
        },
        create: {
          id: item.id,
          url: item.url,
          alt: item.alt,
          kind: item.kind,
          linkUrl: item.linkUrl,
          sortOrder: item.sortOrder,
          published: item.published,
          createdAt: new Date(item.createdAt),
        },
      });
    }
  });
  globalMediaSync.__elmotoMediaVersion = snapshot.version;
}

// ---------------------------------------------------------------------------
// Equipment (Moto oprema)
// ---------------------------------------------------------------------------

const EQUIPMENT_KEY = "elmoto-shared-equipment-v1";
type EquipmentSnapshot = {
  version: number;
  items: {
    id: string;
    title: string;
    priceCents: number | null;
    description: string;
    category: string;
    imageUrl: string;
    avtonetUrl: string;
    published: boolean;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
  }[];
};
const globalEquipmentSync = globalThis as unknown as {
  __elmotoEquipmentVersion?: number;
  __elmotoLastCheckedAt?: number;
};

export async function persistEquipmentSnapshot(): Promise<void> {
  const items = await prisma.equipment.findMany();
  const version = Date.now();
  await blobSet(EQUIPMENT_KEY, {
    version,
    items: items.map((e) => ({
      ...e,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    })),
  });
  globalEquipmentSync.__elmotoEquipmentVersion = version;
  globalEquipmentSync.__elmotoLastCheckedAt = Date.now();
}

export async function ensureEquipmentSynced(options?: { force?: boolean }): Promise<void> {
  const now = Date.now();
  if (
    !options?.force &&
    globalEquipmentSync.__elmotoEquipmentVersion &&
    globalEquipmentSync.__elmotoLastCheckedAt &&
    now - globalEquipmentSync.__elmotoLastCheckedAt < PUBLIC_SYNC_COOLDOWN_MS
  ) {
    return;
  }

  const snapshot = await blobGet<EquipmentSnapshot>(EQUIPMENT_KEY, options?.force);
  globalEquipmentSync.__elmotoLastCheckedAt = now;

  if (!snapshot || typeof snapshot.version !== "number" || !Array.isArray(snapshot.items)) return;
  if (globalEquipmentSync.__elmotoEquipmentVersion === snapshot.version) return;

  const currentIds = snapshot.items.map((i) => i.id);
  await prisma.$transaction(async (tx) => {
    if (currentIds.length === 0) {
      await tx.equipment.deleteMany({});
    } else {
      await tx.equipment.deleteMany({
        where: { id: { notIn: currentIds } },
      });
    }
    for (const item of snapshot.items) {
      await tx.equipment.upsert({
        where: { id: item.id },
        update: {
          title: item.title,
          priceCents: item.priceCents,
          description: item.description,
          category: item.category,
          imageUrl: item.imageUrl,
          avtonetUrl: item.avtonetUrl,
          published: item.published,
          sortOrder: item.sortOrder,
        },
        create: {
          id: item.id,
          title: item.title,
          priceCents: item.priceCents,
          description: item.description,
          category: item.category,
          imageUrl: item.imageUrl,
          avtonetUrl: item.avtonetUrl,
          published: item.published,
          sortOrder: item.sortOrder,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        },
      });
    }
  });
  globalEquipmentSync.__elmotoEquipmentVersion = snapshot.version;
}
