import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function cleanEnvValue(raw: string | undefined): string {
  if (!raw) return "";
  return raw.trim().replace(/^["']+|["']+$/g, "").trim();
}

export const SUPABASE_BUCKET = cleanEnvValue(process.env.SUPABASE_STORAGE_BUCKET) || "el-moto-images";
export const SUPABASE_BACKUP_BUCKET = cleanEnvValue(process.env.SUPABASE_BACKUP_BUCKET) || "el-moto-backups";

export type UploadFolder = "motorcycles" | "equipment" | "kove" | "gallery" | "homepage";

export function getSupabaseUrl(): string {
  const raw = cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL).replace(/\/+$/, "");
  if (!raw) return "";
  if (/^[a-z0-9]{15,30}$/i.test(raw)) {
    return `https://${raw.toLowerCase()}.supabase.co`;
  }
  if (!raw.startsWith("http://") && !raw.startsWith("https://")) {
    return `https://${raw}`;
  }
  return raw;
}

export function getSupabasePublishableKey(): string {
  return cleanEnvValue(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function getSupabaseSecretKey(): string {
  return cleanEnvValue(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseSecretKey());
}

const globalForSupabase = globalThis as unknown as {
  __elmotoSupabaseAdmin?: SupabaseClient;
  __elmotoSupabaseUrl?: string;
  __elmotoSupabaseBucketChecked?: boolean;
  __elmotoSupabaseBackupBucketChecked?: boolean;
};

export function getSupabaseAdmin(): SupabaseClient {
  const url = getSupabaseUrl();
  const key = getSupabaseSecretKey();
  if (!url || !key) {
    throw new Error(
      "Supabase ni nastavljen. Dodajte NEXT_PUBLIC_SUPABASE_URL in SUPABASE_SECRET_KEY v okoljske spremenljivke (.env / Vercel).",
    );
  }
  if (!globalForSupabase.__elmotoSupabaseAdmin || globalForSupabase.__elmotoSupabaseUrl !== url) {
    globalForSupabase.__elmotoSupabaseAdmin = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
    globalForSupabase.__elmotoSupabaseUrl = url;
  }
  return globalForSupabase.__elmotoSupabaseAdmin;
}

export async function ensureSupabaseBucket(): Promise<void> {
  if (globalForSupabase.__elmotoSupabaseBucketChecked) return;
  const supabase = getSupabaseAdmin();
  const { data: existing, error: getErr } = await supabase.storage.getBucket(SUPABASE_BUCKET);
  if (!existing && getErr) {
    const { error: createErr } = await supabase.storage.createBucket(SUPABASE_BUCKET, {
      public: true,
      fileSizeLimit: 25 * 1024 * 1024,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "application/json"],
    });
    if (createErr && !createErr.message?.toLowerCase().includes("already exists")) {
      console.warn("[supabase] Bucket creation notice:", createErr.message);
    }
  }
  globalForSupabase.__elmotoSupabaseBucketChecked = true;
}

export async function ensureSupabaseBackupBucket(): Promise<void> {
  if (globalForSupabase.__elmotoSupabaseBackupBucketChecked) return;
  const supabase = getSupabaseAdmin();
  const { data: existing, error: getErr } = await supabase.storage.getBucket(SUPABASE_BACKUP_BUCKET);
  if (!existing && getErr) {
    const { error: createErr } = await supabase.storage.createBucket(SUPABASE_BACKUP_BUCKET, {
      public: false,
      fileSizeLimit: 50 * 1024 * 1024,
      allowedMimeTypes: ["application/json"],
    });
    if (createErr && !createErr.message?.toLowerCase().includes("already exists")) {
      console.warn("[supabase] Backup bucket creation notice:", createErr.message);
    }
  } else if (existing?.public) {
    await supabase.storage.updateBucket(SUPABASE_BACKUP_BUCKET, { public: false }).catch(() => undefined);
  }
  globalForSupabase.__elmotoSupabaseBackupBucketChecked = true;
}

export function getSupabasePublicUrl(storagePath: string): string {
  const url = getSupabaseUrl();
  const cleanPath = storagePath.replace(/^\/+/, "");
  return `${url}/storage/v1/object/public/${SUPABASE_BUCKET}/${cleanPath}`;
}

export function extractSupabaseObjectPath(publicUrl: string): string | null {
  const baseUrl = getSupabaseUrl();
  const marker = `/storage/v1/object/public/${SUPABASE_BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  if (baseUrl && !publicUrl.startsWith(baseUrl)) return null;
  const objectPath = publicUrl.slice(idx + marker.length).split("?")[0]?.trim();
  if (!objectPath || objectPath.includes("..")) return null;
  return decodeURIComponent(objectPath);
}
