import { slugify } from "@/lib/utils";

export type ImportedAvtoNetBike = {
  externalId: string;
  sourceUrl: string;
  sourcePlatform: "Avto.net";
  importStatus: "IMPORTED" | "PARTIAL" | "MANUAL";
  title: string;
  brand: string;
  model: string;
  variant: string;
  priceEur: string;
  year: number | null;
  firstRegistration: string;
  condition: "NEW" | "USED" | "";
  category: string;
  mileageKm: number | null;
  engineCc: number | null;
  powerKw: number | null;
  powerHp: number | null;
  fuelType: string;
  engineType: string;
  color: string;
  transmission: string;
  driveType: string;
  licenseCategory: string;
  description: string;
  equipment: string;
  serviceHistory: string;
  specs: string;
  imageUrls: string[];
};

export type AvtoNetImportResponse = {
  ok: boolean;
  error?: string;
  warning?: string;
  cloudflareBlocked?: boolean;
  syncSupported: boolean;
  duplicate?: {
    id: string;
    slug: string;
    title: string;
    updatedAt: string;
  } | null;
  data?: ImportedAvtoNetBike;
};

const KNOWN_BRANDS = [
  "Aprilia",
  "Benelli",
  "Beta",
  "BMW",
  "BRP",
  "Brixton",
  "Can-Am",
  "CFMOTO",
  "CF Moto",
  "Derbi",
  "Ducati",
  "Fantic",
  "GasGas",
  "Gilera",
  "Harley-Davidson",
  "Harley Davidson",
  "Honda",
  "Husqvarna",
  "Indian",
  "Italjet",
  "Kawasaki",
  "Keeway",
  "KOVE",
  "KTM",
  "Kymco",
  "Lambretta",
  "Malaguti",
  "Mash",
  "Moto Guzzi",
  "Moto Morini",
  "MV Agusta",
  "NIU",
  "Norton",
  "Peugeot",
  "Piaggio",
  "Polaris",
  "QJMotor",
  "QJ Motor",
  "Rieju",
  "Royal Enfield",
  "Sherco",
  "Super Socco",
  "Suzuki",
  "SWM",
  "SYM",
  "Talaria",
  "TM Racing",
  "Triumph",
  "Husaberg",
  "Vespa",
  "Victory",
  "Voge",
  "Yamaha",
  "Zero",
  "Zontes",
];

const ALLOWED_HOSTS = new Set(["www.avto.net", "avto.net"]);
const ALLOWED_IMAGE_HOSTS = new Set([
  "images.avto.net",
  "www.avto.net",
  "avto.net",
]);

export function isSyncSupported(): boolean {
  return Boolean(process.env.AVTONET_FEED_URL || process.env.AVTONET_API_URL);
}

export function validateAvtoNetUrl(rawUrl: string): {
  valid: boolean;
  normalizedUrl?: string;
  externalId?: string;
  displayHint?: string;
  error?: string;
} {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return { valid: false, error: "Vnesite veljavno povezavo do oglasa na Avto.net." };
  }
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { valid: false, error: "Vnesite veljavno povezavo do oglasa na Avto.net." };
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return { valid: false, error: "Vnesite veljavno povezavo do oglasa na Avto.net." };
  }
  const hostname = parsed.hostname.toLowerCase();
  if (!ALLOWED_HOSTS.has(hostname)) {
    return { valid: false, error: "Vnesite veljavno povezavo do oglasa na Avto.net." };
  }
  if (parsed.username || parsed.password || parsed.port) {
    return { valid: false, error: "Vnesite veljavno povezavo do oglasa na Avto.net." };
  }

  const idParam =
    parsed.searchParams.get("id") ||
    parsed.searchParams.get("ID") ||
    parsed.pathname.match(/\/id\/(\d+)/i)?.[1] ||
    parsed.search.match(/[?&]id=(\d+)/i)?.[1] ||
    "";

  const externalId = idParam.replace(/[^\d]/g, "");
  const displayHint = (parsed.searchParams.get("display") || "").trim();

  parsed.protocol = "https:";
  parsed.hostname = "www.avto.net";
  parsed.hash = "";

  return {
    valid: true,
    normalizedUrl: parsed.toString(),
    externalId,
    displayHint,
  };
}

export function validateAvtoNetImageUrl(rawUrl: string): string | null {
  try {
    const parsed = new URL(rawUrl.trim());
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
    if (!ALLOWED_IMAGE_HOSTS.has(parsed.hostname.toLowerCase())) return null;
    parsed.protocol = "https:";
    return parsed.toString();
  } catch {
    return null;
  }
}

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&euro;/gi, "€")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

function stripTagsToLines(html: string): string {
  const withoutScripts = html
    .replace(/<script[\s\S]*?<\/script>/gi, "\n")
    .replace(/<style[\s\S]*?<\/style>/gi, "\n")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, "\n");
  const withBreaks = withoutScripts
    .replace(/<(br|hr)\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|tr|li|h1|h2|h3|h4|h5|h6|section|article|td|th)>/gi, "\n");
  const stripped = decodeHtmlEntities(withBreaks.replace(/<[^>]+>/g, " "));
  return stripped
    .split(/\r?\n/)
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}

export function splitBrandAndModel(rawTitle: string): { brand: string; model: string; variant: string } {
  const cleaned = rawTitle
    .replace(/\s*\|\s*Avto\.net.*$/i, "")
    .replace(/^Avto\.net\s*[-–|:]\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return { brand: "", model: "", variant: "" };

  const sortedBrands = [...KNOWN_BRANDS].sort((a, b) => b.length - a.length);
  for (const candidate of sortedBrands) {
    const regex = new RegExp(`^${candidate.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, "i");
    if (regex.test(cleaned)) {
      const rest = cleaned.replace(regex, "").replace(/^[-–:\s]+/, "").trim();
      const normalizedBrand = candidate.toUpperCase() === "CF MOTO" ? "CFMOTO" : candidate;
      return {
        brand: normalizedBrand,
        model: rest,
        variant: "",
      };
    }
  }

  const parts = cleaned.split(" ");
  if (parts.length >= 2) {
    return {
      brand: parts[0],
      model: parts.slice(1).join(" "),
      variant: "",
    };
  }
  return { brand: cleaned, model: "", variant: "" };
}

function extractImagesFromHtmlOrText(source: string): string[] {
  const urls: string[] = [];
  const seen = new Set<string>();

  const addCandidate = (raw: string) => {
    const cleaned = raw.replace(/['"\\)>\].,;]+$/, "").trim();
    const valid = validateAvtoNetImageUrl(cleaned);
    if (!valid) return;
    const lower = valid.toLowerCase();
    if (
      lower.includes("logo") ||
      lower.includes("icon") ||
      lower.includes("banner") ||
      lower.includes("sprite") ||
      lower.includes("avatar") ||
      lower.endsWith(".svg") ||
      lower.endsWith(".gif")
    ) {
      return;
    }
    // Prefer full-size photo over _small / _160 thumbnails on images.avto.net
    const fullSize = valid.replace(/_(small|160|320)(\.[a-z]{3,4})$/i, "$2");
    if (!seen.has(fullSize)) {
      seen.add(fullSize);
      urls.push(fullSize);
    }
  };

  const urlMatches = source.matchAll(/https?:\/\/(?:images\.avto\.net|www\.avto\.net)\/[^\s"'<>]+/gi);
  for (const match of urlMatches) {
    if (match[0] && /\.(jpe?g|png|webp)(\?.*)?$/i.test(match[0])) {
      addCandidate(match[0]);
    }
  }

  return urls.slice(0, 30);
}

export function parseAvtoNetContent(input: {
  url: string;
  externalId?: string;
  displayHint?: string;
  rawContent?: string;
}): ImportedAvtoNetBike {
  const raw = (input.rawContent || "").trim();
  const isHtml = /<[a-z][\s\S]*>/i.test(raw);
  const text = isHtml ? stripTagsToLines(raw) : raw;
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  // 1. Title
  let title = "";
  if (isHtml) {
    const ogTitle = raw.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1];
    const h1Match = raw.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
    const titleTag = raw.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
    title = decodeHtmlEntities(ogTitle || (h1Match ? h1Match.replace(/<[^>]+>/g, " ") : "") || titleTag || "")
      .replace(/\s*\|\s*Avto\.net.*$/i, "")
      .replace(/\s*-\s*www\.avto\.net.*$/i, "")
      .replace(/\s+/g, " ")
      .trim();
  }
  if (!title && lines.length > 0) {
    for (const line of lines.slice(0, 12)) {
      if (
        line.length >= 3 &&
        line.length <= 100 &&
        !/^(avto\.net|domov|iskanje|oglasi|moto|prijava|kontakt|cena|osnovni podatki)/i.test(line)
      ) {
        const check = splitBrandAndModel(line);
        if (KNOWN_BRANDS.some((b) => b.toLowerCase() === check.brand.toLowerCase())) {
          title = line;
          break;
        }
      }
    }
    if (!title && input.displayHint) {
      title = input.displayHint;
    } else if (!title && lines[0] && lines[0].length <= 100) {
      title = lines[0];
    }
  }
  if (!title && input.displayHint) {
    title = input.displayHint;
  }

  const { brand, model, variant } = splitBrandAndModel(title);

  // Helper to find label value in table or text lines
  const findValue = (patterns: RegExp[]): string => {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match) {
          const inline = (match[1] ?? "").replace(/^[:\s–-]+/, "").trim();
          if (inline) return inline;
          if (i + 1 < lines.length) return lines[i + 1].trim();
        }
      }
    }
    return "";
  };

  // 2. Price in EUR
  let priceEur = "";
  const priceLine =
    findValue([
      /^(?:Akcijska cena|Gotovinska cena|Cena|Cena z DDV)\s*:?\s*(.*)$/i,
    ]) || text;
  const priceMatches = [
    ...priceLine.matchAll(/(\d{1,3}(?:[.\s]\d{3})+|\d{3,6})(?:,\d{2})?\s*(?:€|EUR)/gi),
    ...text.matchAll(/(\d{1,3}(?:[.\s]\d{3})+|\d{3,6})(?:,\d{2})?\s*(?:€|EUR)/gi),
  ];
  for (const m of priceMatches) {
    const numeric = Number(m[1].replace(/[.\s]/g, ""));
    if (Number.isFinite(numeric) && numeric >= 250 && numeric <= 150000) {
      priceEur = String(numeric);
      break;
    }
  }

  // 3. First registration & Year
  const firstRegRaw = findValue([
    /^Prva registracija\s*:?\s*(.*)$/i,
    /^1\.\s*registracija\s*:?\s*(.*)$/i,
  ]);
  const yearRaw = findValue([
    /^Letnik(?:\s+proizvodnje)?\s*:?\s*(.*)$/i,
    /^Leto izdelave\s*:?\s*(.*)$/i,
  ]);

  let year: number | null = null;
  const yearMatch = (yearRaw || firstRegRaw).match(/\b(19[7-9]\d|20[0-3]\d)\b/);
  if (yearMatch) {
    year = Number(yearMatch[1]);
  }
  const firstRegistration = firstRegRaw || (year ? String(year) : "");

  // 4. Condition (new or used)
  const starostRaw = findValue([/^Starost\s*:?\s*(.*)$/i, /^Stanje\s*:?\s*(.*)$/i]).toLowerCase();
  let condition: "NEW" | "USED" | "" = "";
  if (starostRaw.includes("novo")) condition = "NEW";
  else if (starostRaw.includes("rabljeno") || starostRaw.includes("testno")) condition = "USED";

  // 5. Category
  const categoryRaw = findValue([
    /^(?:Kategorija|Oblika|Vrsta|Tip motorja)\s*:?\s*(.*)$/i,
  ]);

  // 6. Mileage (km)
  const mileageRaw = findValue([
    /^Prevoženi\s*km\s*:?\s*(.*)$/i,
    /^Kilometri\s*:?\s*(.*)$/i,
    /^Št\.\s*prevoženih\s*km\s*:?\s*(.*)$/i,
  ]);
  let mileageKm: number | null = null;
  if (mileageRaw) {
    const cleanedKm = mileageRaw.replace(/\./g, "").match(/\b(\d{1,6})\b/);
    if (cleanedKm) mileageKm = Number(cleanedKm[1]);
  }

  // 7. Engine displacement (ccm)
  const ccRaw = findValue([
    /^Prostornina(?:\s+motorja)?\s*:?\s*(.*)$/i,
    /^Delovna prostornina\s*:?\s*(.*)$/i,
  ]) || text;
  let engineCc: number | null = null;
  const ccMatch = ccRaw.match(/\b(\d{2,4})\s*ccm\b/i) || (ccRaw !== text ? ccRaw.match(/\b(\d{2,4})\b/) : null);
  if (ccMatch) {
    const val = Number(ccMatch[1]);
    if (val >= 49 && val <= 3000) engineCc = val;
  }

  // 8. Power (kW and HP/KM)
  const powerRaw = findValue([
    /^Moč(?:\s+motorja)?\s*:?\s*(.*)$/i,
  ]) || text;
  let powerKw: number | null = null;
  let powerHp: number | null = null;
  const kwMatch = powerRaw.match(/(\d+(?:[.,]\d+)?)\s*kW\b/i);
  const hpMatch = powerRaw.match(/(\d+(?:[.,]\d+)?)\s*(?:KM|HP|KS)\b/i);
  if (kwMatch) {
    powerKw = Number(kwMatch[1].replace(",", "."));
  }
  if (hpMatch) {
    powerHp = Number(hpMatch[1].replace(",", "."));
  } else if (powerKw && powerKw > 0) {
    powerHp = Math.round(powerKw * 1.35962);
  }

  // 9. Fuel, Transmission, Color, Engine Type, Drive Type, License Category
  const fuelRaw = findValue([/^Gorivo\s*:?\s*(.*)$/i, /^Vrsta goriva\s*:?\s*(.*)$/i]);
  const transmissionRaw = findValue([/^Menjalnik\s*:?\s*(.*)$/i]);
  const colorRaw = findValue([/^Barva\s*:?\s*(.*)$/i]);
  const engineTypeRaw = findValue([/^Vrsta motorja\s*:?\s*(.*)$/i, /^Takt\s*:?\s*(.*)$/i]);
  const driveTypeRaw = findValue([/^Pogon\s*:?\s*(.*)$/i]);
  const licenseRaw = findValue([/^Kategorija vozniškega dovoljenja\s*:?\s*(.*)$/i, /^Izpit\s*:?\s*(.*)$/i]);

  // 10. Equipment & Service History & Description
  const equipmentList: string[] = [];
  const serviceList: string[] = [];
  const equipmentRegex =
    /\b(ABS|TC|Traction Control|kovčk[ai]|stranska kovčka|zgornji kovček|top case|quickshifter|gretje ročk|ogrevane ročke|tempomat|LED|vetrobran|vizir|cevna zaščita|crash bar|centralno stojalo|akrapovič|sc project|arrow|keyless|TFT|navigacija|bluetooth|USB)\b/gi;
  const eqMatches = text.matchAll(equipmentRegex);
  const seenEq = new Set<string>();
  for (const m of eqMatches) {
    const item = m[0].trim();
    const key = item.toLowerCase();
    if (!seenEq.has(key)) {
      seenEq.add(key);
      equipmentList.push(item);
    }
  }

  const serviceRegex =
    /\b(servisna knjiga(?:\s*-\s*potrjena)?|1\.\s*lastnik|2\.\s*lastnik|slovensko poreklo|kupljen v Sloveniji|nekaramboliran|nepoškodovan|garancija|jamstvo|CarGarantie|garažiran|redno servisiran)\b/gi;
  const srvMatches = text.matchAll(serviceRegex);
  const seenSrv = new Set<string>();
  for (const m of srvMatches) {
    const item = m[0].trim();
    const key = item.toLowerCase();
    if (!seenSrv.has(key)) {
      seenSrv.add(key);
      serviceList.push(item);
    }
  }

  // Extract main seller description block if present
  let description = "";
  const descMarkerIndex = lines.findIndex((l) =>
    /^(?:Ostali podatki|Opombe|Opis|Dodatni opis|Oprema in ostali podatki o ponudbi)\s*:?$/i.test(l),
  );
  if (descMarkerIndex >= 0 && descMarkerIndex + 1 < lines.length) {
    const descLines: string[] = [];
    for (let i = descMarkerIndex + 1; i < lines.length; i++) {
      const l = lines[i];
      if (/^(?:Prodajalec|Kontakt|Lokacija|Delovni čas|Natisni oglas|Pošlji prijatelju|Prijava napake)/i.test(l)) {
        break;
      }
      descLines.push(l);
    }
    description = descLines.join("\n").trim();
  }

  // Build technical specifications string
  const specPairs: [string, string][] = [];
  if (firstRegistration) specPairs.push(["Prva registracija", firstRegistration]);
  if (engineCc) specPairs.push(["Prostornina", `${engineCc} ccm`]);
  if (powerKw) specPairs.push(["Moč motorja", `${powerKw} kW${powerHp ? ` (${powerHp} KM)` : ""}`]);
  if (fuelRaw) specPairs.push(["Gorivo", fuelRaw]);
  if (transmissionRaw) specPairs.push(["Menjalnik", transmissionRaw]);
  if (colorRaw) specPairs.push(["Barva", colorRaw]);
  if (categoryRaw) specPairs.push(["Kategorija", categoryRaw]);

  const imageUrls = extractImagesFromHtmlOrText(raw);

  const hasDetailedData = Boolean(
    priceEur || year || mileageKm != null || engineCc != null || powerKw != null || description || imageUrls.length > 0,
  );

  return {
    externalId: input.externalId || "",
    sourceUrl: input.url,
    sourcePlatform: "Avto.net",
    importStatus: hasDetailedData ? "IMPORTED" : brand ? "PARTIAL" : "MANUAL",
    title,
    brand,
    model,
    variant,
    priceEur,
    year,
    firstRegistration,
    condition,
    category: categoryRaw,
    mileageKm,
    engineCc,
    powerKw,
    powerHp,
    fuelType: fuelRaw,
    engineType: engineTypeRaw,
    color: colorRaw,
    transmission: transmissionRaw,
    driveType: driveTypeRaw,
    licenseCategory: licenseRaw,
    description,
    equipment: equipmentList.join(", "),
    serviceHistory: serviceList.join(", "),
    specs: specPairs.map(([k, v]) => `${k}: ${v}`).join("\n"),
    imageUrls,
  };
}

export async function fetchAvtoNetListing(input: {
  url: string;
  pastedContent?: string;
}): Promise<{
  ok: boolean;
  error?: string;
  warning?: string;
  cloudflareBlocked?: boolean;
  data?: ImportedAvtoNetBike;
}> {
  const validation = validateAvtoNetUrl(input.url);
  if (!validation.valid || !validation.normalizedUrl) {
    return {
      ok: false,
      error: validation.error || "Vnesite veljavno povezavo do oglasa na Avto.net.",
    };
  }

  const normalizedUrl = validation.normalizedUrl;
  const externalId = validation.externalId || "";
  const displayHint = validation.displayHint || "";

  // If administrator provided pasted content (HTML or copied text from the ad page), parse it directly
  if (input.pastedContent && input.pastedContent.trim().length > 10) {
    const parsed = parseAvtoNetContent({
      url: normalizedUrl,
      externalId,
      displayHint,
      rawContent: input.pastedContent,
    });
    return {
      ok: true,
      data: parsed,
    };
  }

  // Priority A: Check if an official/authorized dealer feed or API URL is configured
  const feedUrl = process.env.AVTONET_FEED_URL || process.env.AVTONET_API_URL;
  if (feedUrl && externalId) {
    try {
      const endpoint = new URL(feedUrl);
      endpoint.searchParams.set("id", externalId);
      const headers: Record<string, string> = { Accept: "application/json, text/xml, text/html" };
      if (process.env.AVTONET_API_KEY) {
        headers.Authorization = `Bearer ${process.env.AVTONET_API_KEY}`;
      }
      const res = await fetch(endpoint.toString(), {
        headers,
        signal: AbortSignal.timeout(10000),
      });
      if (res.ok) {
        const body = await res.text();
        const parsed = parseAvtoNetContent({
          url: normalizedUrl,
          externalId,
          displayHint,
          rawContent: body,
        });
        return { ok: true, data: parsed };
      }
    } catch (error) {
      console.warn("[Avto.net Import] Authorized feed fetch failed:", error);
    }
  }

  // Priority B: Attempt compliant direct fetch with SSRF & redirect protection
  try {
    const response = await fetch(normalizedUrl, {
      method: "GET",
      redirect: "manual",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ELMOTO-Importer/1.0; +https://www.elmoto.si)",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "sl-SI,sl;q=0.9",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (location) {
        const redirected = new URL(location, normalizedUrl);
        if (!ALLOWED_HOSTS.has(redirected.hostname.toLowerCase())) {
          return { ok: false, error: "Podatkov oglasa ni bilo mogoče pridobiti." };
        }
      }
    }

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "";
    const charset = contentType.toLowerCase().includes("utf-8") ? "utf-8" : "windows-1250";
    let html = "";
    try {
      html = new TextDecoder(charset).decode(buffer);
    } catch {
      html = new TextDecoder("utf-8").decode(buffer);
    }

    const isCloudflareChallenge =
      response.status === 403 ||
      response.status === 503 ||
      response.headers.get("cf-mitigated") === "challenge" ||
      html.includes("challenges.cloudflare.com") ||
      html.includes("<title>Just a moment...</title>");

    if (isCloudflareChallenge) {
      const partial = parseAvtoNetContent({
        url: normalizedUrl,
        externalId,
        displayHint,
        rawContent: "",
      });
      return {
        ok: true,
        cloudflareBlocked: true,
        warning:
          "Avto.net zaščita (Cloudflare CAPTCHA) omejuje neposreden strežniški bralnik brez API ključa. Povezava in ID oglasa sta uvožena — za samodejno izpolnitev vseh polj in slik prilepite besedilo ali izvorno kodo oglasa v spodnje polje ali dopolnite podatke ročno.",
        data: partial,
      };
    }

    if (!response.ok) {
      return {
        ok: false,
        error: "Podatkov oglasa ni bilo mogoče pridobiti.",
      };
    }

    const parsed = parseAvtoNetContent({
      url: normalizedUrl,
      externalId,
      displayHint,
      rawContent: html,
    });

    return {
      ok: true,
      data: parsed,
    };
  } catch (error) {
    console.warn("[Avto.net Import] Direct fetch error:", error);
    const partial = parseAvtoNetContent({
      url: normalizedUrl,
      externalId,
      displayHint,
      rawContent: "",
    });
    return {
      ok: true,
      cloudflareBlocked: true,
      warning:
        "Podatkov oglasa ni bilo mogoče samodejno prebrati s strežnika. Povezava je shranjena — prilepite vsebino oglasa v polje za hitri uvoz ali izpolnite polja ročno.",
      data: partial,
    };
  }
}

export function slugFromImport(brand: string, model: string, year: number | null): string {
  return slugify(`${brand}-${model}-${year ?? ""}`) || "motor";
}
