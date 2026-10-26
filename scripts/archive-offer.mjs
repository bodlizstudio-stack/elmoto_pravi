import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const keep = new Set(["yamaha-tracer-9-gt-2023", "honda-cb-750-hornet-2023", "suzuki-dl-800-v-strom-2025"]);
const prisma = new PrismaClient();

const already = await prisma.siteSetting.findUnique({ where: { key: "offer_trimmed_at" } });
if (already) {
  console.log("Čiščenje je bilo že izvedeno", already.value, "— ponovni zagon ne spreminja ponudbe.");
  await prisma.$disconnect();
  process.exit(0);
}

const bikes = await prisma.motorcycle.findMany({ include: { images: true } });
const backupDir = path.join(process.cwd(), "prisma", "backups");
mkdirSync(backupDir, { recursive: true });
const stamp = new Date().toISOString().slice(0, 10);
writeFileSync(path.join(backupDir, `motorcycles-${stamp}.json`), JSON.stringify(bikes, null, 2));
copyFileSync(path.join(process.cwd(), "prisma", "catalog.db"), path.join(backupDir, `catalog-${stamp}.db`));

let archived = 0;
const kept = [];
for (const bike of bikes) {
  if (keep.has(bike.slug)) {
    await prisma.motorcycle.update({
      where: { id: bike.id },
      data: {
        publication: "PUBLISHED",
        status: "UNKNOWN",
        forSale: true,
      },
    });
    kept.push(`${bike.brand} ${bike.model} ${bike.year} (${bike.slug})`);
    continue;
  }
  await prisma.motorcycle.update({
    where: { id: bike.id },
    data: { publication: "ARCHIVED" },
  });
  archived += 1;
}

await prisma.siteSetting.create({
  data: { key: "offer_trimmed_at", value: new Date().toISOString() },
});

console.log("Ohranjeno:");
for (const line of kept) console.log(" -", line);
console.log("Arhivirano:", archived);
console.log("Varnostna kopija:", path.join(backupDir, `motorcycles-${stamp}.json`));
await prisma.$disconnect();
