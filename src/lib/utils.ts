export function slugify(input: string) {
  return input
    .replace(/[đĐ]/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function formatPrice(cents: number | null | undefined, confirmed: boolean) {
  if (cents == null || cents <= 0 || !confirmed) return "Cena na povpraševanje";
  return new Intl.NumberFormat("sl-SI", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatKm(km: number | null | undefined) {
  if (km == null || km < 0) return null;
  return `${new Intl.NumberFormat("sl-SI", { useGrouping: "always" }).format(km)} km`;
}

export function formatCc(cc: number | null | undefined) {
  if (cc == null || cc <= 0) return null;
  return `${new Intl.NumberFormat("sl-SI").format(cc)} ccm`;
}

export function formatPower(powerKw: number | null | undefined, powerHp: number | null | undefined) {
  const kw = powerKw && powerKw > 0 ? powerKw : null;
  const hp = powerHp && powerHp > 0 ? powerHp : null;
  if (!kw && !hp) return null;
  if (kw && hp) return `${trimNum(kw)} kW (${trimNum(hp)} KM)`;
  if (kw) return `${trimNum(kw)} kW (${trimNum(kw * 1.35962)} KM, preračun)`;
  return `${trimNum((hp as number) / 1.35962)} kW (preračun), ${trimNum(hp as number)} KM`;
}

function trimNum(value: number) {
  return new Intl.NumberFormat("sl-SI", { maximumFractionDigits: 1 }).format(value);
}

export function conditionLabel(condition: string) {
  if (condition === "NEW") return "Novo";
  if (condition === "USED") return "Rabljeno";
  return "";
}

export function statusLabel(status: string) {
  if (status === "AVAILABLE") return "Na voljo";
  if (status === "RESERVED") return "Rezervirano";
  if (status === "SOLD") return "Prodano";
  if (status === "UNKNOWN") return "Razpoložljivost preveri po povpraševanju";
  if (status === "HIDDEN") return "Skrito";
  if (status === "ARCHIVED") return "Arhivirano";
  return "";
}

export function stockLabel(status: string) {
  return statusLabel(status);
}

export function lines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function parseSpecs(text: string) {
  return lines(text)
    .map((line) => {
      const idx = line.indexOf(":");
      const tabIdx = line.indexOf("\t");
      let rawLabel = "";
      let rawValue = "";
      if (idx !== -1) {
        rawLabel = line.slice(0, idx);
        rawValue = line.slice(idx + 1);
      } else if (tabIdx !== -1) {
        rawLabel = line.slice(0, tabIdx);
        rawValue = line.slice(tabIdx + 1);
      } else {
        return null;
      }
      const label = rawLabel.replace(/\s+/g, " ").trim();
      const value = rawValue
        .replace(/,\s*,+/g, ",")
        .replace(/^,\s*|\s*,$/g, "")
        .replace(/\s+/g, " ")
        .trim();
      if (!label || !value) return null;
      return { label, value };
    })
    .filter((item): item is { label: string; value: string } => Boolean(item));
}

export function extractMileageFromText(raw: string): number | null {
  if (!raw) return null;
  // Remove power expressions like "35 kW (48 KM)" or "35kW / 48KM" and speed "km/h"
  const cleaned = raw
    .replace(/\d+(?:[.,]\d+)?\s*kW\s*(?:\(\s*\d+(?:[.,]\d+)?\s*(?:KM|HP|KS)\s*\)|[/,-]\s*\d+(?:[.,]\d+)?\s*(?:KM|HP|KS))/gi, " ")
    .replace(/\(\s*\d+(?:[.,]\d+)?\s*KM\s*\)/g, " ")
    .replace(/\d+\s*km\s*\/\s*(?:h|dan|uro)/gi, " ");

  const toInt = (val: string): number | null => {
    const digits = val.replace(/[.\s']/g, "").trim();
    if (!/^\d{1,6}$/.test(digits)) return null;
    const num = Number(digits);
    if (!Number.isFinite(num) || num < 0 || num > 400000) return null;
    return num;
  };

  // 1. Explicit phrases: "Prevoženi km: 14.500", "prevoženih samo 8.200 km", "kilometri: 12000"
  const explicitBefore = cleaned.match(
    /(?:prevo[zž]en(?:ih|i|o|a)?(?:\s*km|\s*kilometrov)?|kilometr(?:ov|i|e)?|stanje\s*[sš]tevca)\s*(?:je|so|samo|le|cca\.?|okoli|pribl\.?|-|:)*\s*(\d{1,3}(?:[.\s']\d{3})+|\d{1,6})(?:\s*(?:km|kilometr(?:ov|i|e)?))?\b/i,
  );
  if (explicitBefore?.[1]) {
    const parsed = toInt(explicitBefore[1]);
    if (parsed != null) return parsed;
  }

  // 2. Number before "prevoženih km / kilometrov": "14.500 prevoženih km", "14500 kilometrov"
  const explicitAfter = cleaned.match(
    /\b(\d{1,3}(?:[.\s']\d{3})+|\d{1,6})\s*(?:prevo[zž]en(?:ih|i)?\s*(?:km|kilometr(?:ov|i|e)?)?|kilometr(?:ov|i|e))\b/i,
  );
  if (explicitAfter?.[1]) {
    const parsed = toInt(explicitAfter[1]);
    if (parsed != null) return parsed;
  }

  // 3. Number with thousands separator followed by km: "14.500 km" or "1.200 km"
  const formattedKm = cleaned.match(/\b(\d{1,3}(?:\.\d{3})+)\s*km\b/i);
  if (formattedKm?.[1]) {
    const parsed = toInt(formattedKm[1]);
    if (parsed != null) return parsed;
  }

  // 4. Plain number followed by lowercase "km" (or any case "km" if >= 250): "14500 km", "850 km", "samo 120 km"
  const plainMatches = cleaned.matchAll(/\b(\d{1,6})\s*(km)\b/gi);
  for (const match of plainMatches) {
    const num = toInt(match[1]);
    const unit = match[2];
    if (num == null) continue;
    // Lowercase "km" or number >= 250 (since motorcycle horsepower is rarely >= 250 without kW)
    if (unit === "km" || num >= 250) {
      return num;
    }
  }

  return null;
}

export function euroToCents(raw: string) {
  let cleaned = raw
    .replace(/€|eur/gi, "")
    .replace(/\s/g, "")
    .trim();
  if (!cleaned) return { cents: null as number | null, zero: false };
  if (/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(cleaned)) {
    cleaned = cleaned.replace(/\./g, "").replace(",", ".");
  } else {
    cleaned = cleaned.replace(",", ".");
  }
  const value = Number(cleaned);
  if (!Number.isFinite(value) || value < 0) return { error: "Cena ni veljavna." as const };
  if (value === 0) return { cents: null, zero: true };
  return { cents: Math.round(value * 100), zero: false };
}

export function coverOf(bike: { images: { url: string; alt: string; isCover: boolean }[] }) {
  return bike.images.find((image) => image.isCover) ?? bike.images[0] ?? null;
}

export function displayName(bike: { brand: string; model: string; variant?: string }) {
  return [bike.brand, bike.model, bike.variant].filter(Boolean).join(" ");
}

export function factualSummary(bike: {
  brand: string;
  model: string;
  variant?: string;
  year: number | null;
  mileageKm?: number | null;
  engineCc?: number | null;
  color?: string;
}) {
  const parts = [bike.year ? `${displayName(bike)}, letnik ${bike.year}.` : `${displayName(bike)}.`];
  const km = formatKm(bike.mileageKm);
  const cc = formatCc(bike.engineCc);
  if (km) parts.push(`Prevoženih ${km}.`);
  if (cc) parts.push(`Prostornina ${cc}.`);
  if (bike.color) parts.push(`Barva: ${bike.color}.`);
  parts.push("Oglas EL-MOTO, Trzin.");
  return parts.join(" ");
}

export function mailtoHref(email: string, subject: string, body: string) {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function isLocalUpload(url: string) {
  return url.startsWith("/uploads/") && !url.includes("..");
}
