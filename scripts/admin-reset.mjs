import { createHash, randomBytes } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const user = email ? await prisma.user.findUnique({ where: { email } }) : null;

if (!user || user.role !== "ADMIN") {
  console.error("Administrator s tem e-poštnim naslovom še ne obstaja. Najprej zaženi npm run admin:ustvari.");
  await prisma.$disconnect();
  process.exit(1);
}

const token = randomBytes(32).toString("base64url");
const hash = createHash("sha256").update(token).digest("hex");
const exp = Date.now() + 30 * 60 * 1000;
const value = JSON.stringify({ userId: user.id, hash, exp });
await prisma.siteSetting.upsert({
  where: { key: "admin_reset" },
  update: { value },
  create: { key: "admin_reset", value },
});
const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
console.log("Povezava velja 30 minut, uporabi se lahko enkrat in je natisnjena samo tukaj.");
console.log("Ne pošiljaj je po e-pošti.");
console.log(`${base}/admin/ponastavitev?token=${token}`);
await prisma.$disconnect();
