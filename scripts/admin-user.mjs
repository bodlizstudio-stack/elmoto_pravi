import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD ?? "";
const reset = process.argv.includes("--reset");
const prisma = new PrismaClient();

if (!email || !password) {
  console.error("Nastavi ADMIN_EMAIL in ADMIN_PASSWORD v okolju.");
  process.exitCode = 1;
} else if (password === "zamenjajte-me" || password.length < 12) {
  console.error("Geslo mora imeti vsaj 12 znakov in ne sme biti primer iz .env.example.");
  process.exitCode = 1;
} else {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && !reset) {
    console.log("Administrator že obstaja. Geslo ni spremenjeno.");
    console.log("Za novo geslo zaženi npm run admin:ponastavi. E-pošte ne pošiljamo.");
  } else {
    const passwordHash = await bcrypt.hash(password, 12);
    if (existing) {
      await prisma.user.update({ where: { id: existing.id }, data: { passwordHash, role: "ADMIN" } });
      console.log("Geslo je posodobljeno.");
    } else {
      await prisma.user.create({
        data: { email, passwordHash, name: process.env.ADMIN_NAME || "EL-MOTO", role: "ADMIN" },
      });
      console.log("Ustvarjen je administrator.");
    }
  }
}

await prisma.$disconnect();
if (process.exitCode) process.exit(process.exitCode);
