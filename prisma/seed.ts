import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { faqs, pages } from "./content";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "EL-MOTO";
  if (!email || !password) {
    throw new Error("V .env nastavite ADMIN_EMAIL in ADMIN_PASSWORD.");
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    if (password === "zamenjajte-me" || password.length < 12) {
      throw new Error("Za prvega administratorja nastavi ADMIN_PASSWORD z vsaj 12 znaki in zaženi npm run admin:ustvari. Seed obstoječega gesla ne prepiše.");
    }
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.create({ data: { email, passwordHash, name, role: "ADMIN" } });
  }

  const settings = [
    ["phone", "070 868 600"],
    ["email", "info@elmoto.si"],
    ["instagram", "https://www.instagram.com/elmoto.si/"],
    ["hours", ""],
    ["notify_email", process.env.NOTIFY_EMAIL || "info@elmoto.si"],
    ["newsletter_enabled", "false"],
    ["seo_home_title", ""],
    ["seo_home_description", ""],
  ] as const;
  for (const [key, value] of settings) {
    await prisma.siteSetting.upsert({ where: { key }, update: {}, create: { key, value } });
  }

  for (const [category, question, answer, sortOrder] of faqs) {
    const existing = await prisma.faqItem.findFirst({ where: { question } });
    if (!existing) {
      await prisma.faqItem.create({ data: { category, question, answer, sortOrder, published: true } });
    }
  }

  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: { ...page, confirmed: false },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
