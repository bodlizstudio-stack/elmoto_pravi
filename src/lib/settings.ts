import "server-only";
import { prisma } from "@/lib/db";
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

export async function getSettings() {
  const rows = await prisma.siteSetting.findMany();
  const map = new Map(rows.map((row) => [row.key, row.value]));
  const phone = publicPhone(map.get("phone"));
  const storedEmail = map.get("email")?.trim();
  return {
    phoneDisplay: phone.phoneDisplay,
    phoneTel: phone.phoneTel,
    email: !storedEmail || storedEmail === "info@elmoto.si" ? site.email : storedEmail,
    instagram: map.get("instagram") || site.instagram,
    hours: map.get("hours") || "",
    notifyEmail: map.get("notify_email") || process.env.NOTIFY_EMAIL || site.email,
    newsletterEnabled: map.get("newsletter_enabled") === "true",
    seoHomeTitle: map.get("seo_home_title") || "",
    seoHomeDescription: map.get("seo_home_description") || "",
  };
}

export async function getPage(slug: string) {
  return prisma.page.findUnique({ where: { slug } });
}
