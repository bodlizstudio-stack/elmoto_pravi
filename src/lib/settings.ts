import "server-only";
import { prisma } from "@/lib/db";
import { ensureSettingsSynced } from "@/lib/shared-store";
import { site } from "@/lib/site";

function publicPhone(stored?: string) {
  const raw = (stored || "").trim();
  const digits = raw.replace(/\D/g, "");
  if (!raw || digits === "38670868600" || digits === "070868600" || digits === "70868600") {
    return { phoneDisplay: site.phoneDisplay, phoneTel: site.phoneTel };
  }
  const tel = raw.replace(/[^\d+]/g, "");
  return { phoneDisplay: raw, phoneTel: tel || site.phoneTel };
}

function whatsappFromTel(tel: string) {
  const digits = tel.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : site.whatsappUrl;
}

function clampNumber(raw: string | undefined, min: number, max: number, fallback: number) {
  const value = Number(raw);
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value)));
}

export const heroDefaults = {
  image: "/images/hero/hero-elmoto.webp",
  imageMobile: "/images/hero/hero-elmoto-mobile.webp",
  kicker: "Novi in rabljeni motorji z garancijo",
  title: "Tvoja pot. Tvoj motor.",
  text: "Odkrij skrbno izbrano ponudbo novih in rabljenih motornih koles. Pri EL-MOTO ti pomagamo najti motor za tvojo naslednjo pustolovščino.",
  button: "Preveri ponudbo",
  focusX: 72,
  focusY: 30,
  overlay: 80,
};

export type HeroSettings = typeof heroDefaults;

export async function getSettings() {
  await ensureSettingsSynced();
  const rows = await prisma.siteSetting.findMany();
  const map = new Map(rows.map((row) => [row.key, row.value]));
  const phone = publicPhone(map.get("phone"));
  const storedEmail = map.get("email")?.trim();
  const hero: HeroSettings = {
    image: map.get("hero_image") || heroDefaults.image,
    imageMobile: map.get("hero_image_mobile") || map.get("hero_image") || heroDefaults.imageMobile,
    kicker: map.get("hero_kicker") ?? heroDefaults.kicker,
    title: map.get("hero_title") || heroDefaults.title,
    text: map.get("hero_text") ?? heroDefaults.text,
    button: map.get("hero_button") || heroDefaults.button,
    focusX: clampNumber(map.get("hero_focus_x"), 0, 100, heroDefaults.focusX),
    focusY: clampNumber(map.get("hero_focus_y"), 0, 100, heroDefaults.focusY),
    overlay: clampNumber(map.get("hero_overlay"), 0, 100, heroDefaults.overlay),
  };
  return {
    phoneDisplay: phone.phoneDisplay,
    phoneTel: phone.phoneTel,
    whatsappUrl: whatsappFromTel(phone.phoneTel),
    email: !storedEmail || storedEmail === "info@elmoto.si" ? site.email : storedEmail,
    instagram: map.get("instagram") || site.instagram,
    facebook: map.get("facebook") || site.facebook,
    street: map.get("street") || site.street,
    postalCode: map.get("postal_code") || site.postalCode,
    city: map.get("city") || site.city,
    hours: map.get("hours") || "Po dogovoru",
    notifyEmail: map.get("notify_email") || process.env.NOTIFY_EMAIL || site.email,
    newsletterEnabled: map.get("newsletter_enabled") === "true",
    seoHomeTitle: map.get("seo_home_title") || "",
    seoHomeDescription: map.get("seo_home_description") || "",
    hero,
  };
}

export type Settings = Awaited<ReturnType<typeof getSettings>>;

export async function getPage(slug: string) {
  return prisma.page.findUnique({ where: { slug } });
}
