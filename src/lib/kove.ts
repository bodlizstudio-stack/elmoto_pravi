import { prisma } from "@/lib/db";
import { ensureSettingsSynced } from "@/lib/shared-store";

/**
 * Predstavitev modelov z uradnega kataloga kove.si.
 * Podatke lahko administrator ureja v /admin/kove.
 */
export type KoveModel = {
  slug: string;
  name: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
  description: string;
  features: string[];
  sourceUrl: string;
  checkedOn: string;
  published: boolean;
};

export const koveModels: KoveModel[] = [
  {
    slug: "800x-touring",
    name: "KOVE 800X TOURING",
    image: "/images/kove/800x-touring.jpg",
    imageWidth: 1200,
    imageHeight: 800,
    description:
      "Potovalni motocikel z dvovaljnim motorjem. Po uradni specifikaciji ima sedež na 826 mm in maso 215 kg s tremi kovčki.",
    features: ["799 ccm", "69,5 kW", "sedež 826 mm"],
    sourceUrl: "https://kove.si/kove-800x-touring/",
    checkedOn: "2026-10-26",
    published: true,
  },
  {
    slug: "625x-pro",
    name: "KOVE 625X PRO",
    image: "/images/kove/625x-pro.jpg",
    imageWidth: 1200,
    imageHeight: 800,
    description:
      "Motocikel z dvovaljnim motorjem in nastavljivo višino sedeža za različne načine vožnje.",
    features: ["581 ccm", "46 kW", "sedež 795–850 mm"],
    sourceUrl: "https://kove.si/kove-625x-pro/",
    checkedOn: "2026-10-26",
    published: true,
  },
  {
    slug: "450-rally",
    name: "KOVE 450 RALLY",
    image: "/images/kove/450-rally.jpg",
    imageWidth: 1200,
    imageHeight: 800,
    description:
      "Rally motocikel z enovaljnim motorjem in rezervoarjem 32 l.",
    features: ["449 ccm", "38 kW", "rezervoar 32 l"],
    sourceUrl: "https://kove.si/kove-450-rally/",
    checkedOn: "2026-10-26",
    published: true,
  },
];

export const publishedKoveModels = koveModels.filter((model) => model.published && model.image);

export async function getKoveModels(): Promise<KoveModel[]> {
  try {
    await ensureSettingsSynced();
    const row = await prisma.siteSetting.findUnique({
      where: { key: "kove_models_json" },
    });
    if (row?.value) {
      const parsed = JSON.parse(row.value);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback na koveModels
  }
  return koveModels;
}

export async function getPublishedKoveModels(): Promise<KoveModel[]> {
  const all = await getKoveModels();
  return all.filter((model) => model.published && model.image);
}
