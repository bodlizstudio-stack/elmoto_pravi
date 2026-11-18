import { createClient } from "@supabase/supabase-js";

const BUCKET = (process.env.SUPABASE_STORAGE_BUCKET || "el-moto-images").trim();
const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
const SUPABASE_KEY = (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

async function main() {
  console.log("=== EL-MOTO: Preverjanje in priprava Supabase Storage ===");
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("NAPAKA: Manjkata okoljski spremenljivki NEXT_PUBLIC_SUPABASE_URL in/ali SUPABASE_SECRET_KEY.");
    console.error("Dodajte ju v datoteko .env v korenu projekta in ponovno zaženite ukaz.");
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: existing, error: getErr } = await supabase.storage.getBucket(BUCKET);
  if (existing) {
    console.log(`✓ Vedro (bucket) "${BUCKET}" že obstaja (public: ${existing.public}).`);
    if (!existing.public) {
      const { error: updErr } = await supabase.storage.updateBucket(BUCKET, {
        public: true,
        fileSizeLimit: 25 * 1024 * 1024,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "application/json"],
      });
      if (updErr) {
        throw new Error(`Posodobitev vedra na public ni uspela: ${updErr.message}`);
      }
      console.log(`✓ Vedro "${BUCKET}" je bilo nastavljeno kot javno berljivo (public).`);
    }
  } else {
    if (getErr) {
      console.log(`Vedro "${BUCKET}" še ne obstaja (${getErr.message}). Ustvarjam...`);
    }
    const { error: createErr } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 25 * 1024 * 1024,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "application/json"],
    });
    if (createErr) {
      throw new Error(`Ustvarjanje vedra "${BUCKET}" ni uspelo: ${createErr.message}`);
    }
    console.log(`✓ Javno vedro "${BUCKET}" je bilo uspešno ustvarjeno.`);
  }

  console.log("✓ Povezava s Supabase Storage deluje pravilno.");
}

main().catch((err) => {
  console.error("Napaka:", err instanceof Error ? err.message : err);
  process.exit(1);
});
