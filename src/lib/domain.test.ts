import { describe, expect, it } from "vitest";
import { parseInTimeZone } from "@/lib/time";
import { lowestDailyCents, quoteCents, rangesOverlap, rentalDays, selectRate } from "@/lib/rental";
import { canPublish, publicListStatuses } from "@/lib/offer";
import { euroToCents, formatPrice, slugify } from "@/lib/utils";
import { contactSchema } from "@/lib/validators";
import { parseMotorcycleImport } from "@/lib/import-motorcycles";
import { parseAvtoNetContent, validateAvtoNetUrl } from "@/lib/avtonet-import";

describe("cene", () => {
  it("ne prikaže 0 EUR ali nepotrjene cene", () => {
    expect(formatPrice(0, true)).toBe("Cena na povpraševanje");
    expect(formatPrice(150000, false)).toBe("Cena na povpraševanje");
    expect(formatPrice(null, true)).toBe("Cena na povpraševanje");
    expect(formatPrice(150000, true)).toMatch(/1[.\s]?500/);
  });

  it("0 EUR shrani kot neznano ceno", () => {
    expect(euroToCents("0")).toEqual({ cents: null, zero: true });
    expect(euroToCents("")).toEqual({ cents: null, zero: false });
    expect(euroToCents("12,5")?.cents).toBe(1250);
  });
});

describe("slug", () => {
  it("poenostavi slovenske znake", () => {
    expect(slugify("BMW R 1250 RT")).toBe("bmw-r-1250-rt");
    expect(slugify("Špruha čžš")).toBe("spruha-czs");
  });
});

describe("termini", () => {
  it("razbere uro v Sloveniji", () => {
    expect(parseInTimeZone("2026-01-15", "10:00").toISOString()).toBe("2026-01-15T09:00:00.000Z");
    expect(parseInTimeZone("2026-07-15", "10:00").toISOString()).toBe("2026-07-15T08:00:00.000Z");
  });

  it("prepozna prekrivanje", () => {
    const a = new Date("2026-05-01T08:00:00Z");
    const b = new Date("2026-05-05T08:00:00Z");
    const c = new Date("2026-05-05T08:00:00Z");
    const d = new Date("2026-05-07T08:00:00Z");
    expect(rangesOverlap(a, b, new Date("2026-05-04T08:00:00Z"), d)).toBe(true);
    expect(rangesOverlap(a, b, c, d)).toBe(false);
    expect(rentalDays(a, b)).toBe(4);
  });

  it("izračuna samo potrjen cenik", () => {
    const rate = {
      dailyCents: 10000,
      weekendCents: 12000,
      multidayCents: 8000,
      seasonStart: "",
      seasonEnd: "",
      confirmed: true,
    };
    const pickup = parseInTimeZone("2026-05-04", "09:00");
    expect(quoteCents(pickup, 2, rate)).toBeGreaterThan(0);
    expect(quoteCents(pickup, 3, rate)).toBe(24000);
    expect(quoteCents(pickup, 2, { ...rate, confirmed: false })).toBeNull();
    expect(selectRate([{ ...rate, confirmed: false }], pickup)).toBeNull();
    expect(lowestDailyCents([{ ...rate, confirmed: false }])).toBeNull();
  });
});

describe("objava", () => {
  it("objava zahteva samo znamko in model", () => {
    expect(publicListStatuses("")).toEqual(["AVAILABLE", "RESERVED", "UNKNOWN"]);
    expect(publicListStatuses("SOLD")).toEqual(["SOLD"]);
    expect(canPublish({ brand: "", model: "Tracer" })).toBeTruthy();
    expect(canPublish({ brand: "Yamaha", model: "Tracer" })).toBeNull();
  });
});

describe("obrazec", () => {
  it("zavrne prekratko sporočilo in manjkajoče soglasje", () => {
    const result = contactSchema.safeParse({
      name: "A",
      email: "neveljavno",
      phone: "",
      type: "GENERAL",
      message: "kratek",
      privacy: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("uvoz", () => {
  it("preskoči primer in ne šteje 0 EUR kot ceno", () => {
    const json = JSON.stringify({
      motorcycles: [
        { example: true, brand: "Test", model: "X", year: 2024 },
        { brand: "Honda", model: "NC750X", year: 2022, priceEur: 0, priceConfirmed: true, mileageKm: 12000 },
      ],
    });
    const result = parseMotorcycleImport(json, "motorji.json");
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]?.priceCents).toBeNull();
    expect(result.rows[0]?.priceConfirmed).toBe(false);
    expect(result.rows[0]?.model).toBe("NC750X");
  });
});

describe("avto.net uvoz", () => {
  it("preveri veljavnost povezave in prepreči SSRF", () => {
    expect(validateAvtoNetUrl("").valid).toBe(false);
    expect(validateAvtoNetUrl("https://evil.example.com/Ads/details.asp?id=123").valid).toBe(false);
    expect(validateAvtoNetUrl("http://127.0.0.1:3000/Ads/details.asp?id=123").valid).toBe(false);
    expect(validateAvtoNetUrl("javascript:alert(1)").valid).toBe(false);

    const valid = validateAvtoNetUrl(
      "https://www.avto.net/Ads/details.asp?id=21948512&display=Yamaha%20MT-07",
    );
    expect(valid.valid).toBe(true);
    expect(valid.externalId).toBe("21948512");
    expect(valid.displayHint).toBe("Yamaha MT-07");
  });

  it("pravilno razbere podatke oglasa in slik ter pusti manjkajoča polja prazna", () => {
    const sampleHtml = `
      <html>
        <head><title>Yamaha MT-07 Pure | Avto.net</title></head>
        <body>
          <h1>Yamaha MT-07 Pure</h1>
          <table>
            <tr><th>Starost:</th><td>rabljeno</td></tr>
            <tr><th>Prva registracija:</th><td>05 / 2022</td></tr>
            <tr><th>Letnik proizvodnje:</th><td>2022</td></tr>
            <tr><th>Prevoženi km:</th><td>12.500 km</td></tr>
            <tr><th>Cena:</th><td>6.990 €</td></tr>
            <tr><th>Prostornina:</th><td>689 ccm</td></tr>
            <tr><th>Moč motorja:</th><td>54 kW</td></tr>
            <tr><th>Gorivo:</th><td>bencinski motor</td></tr>
            <tr><th>Menjalnik:</th><td>ročni menjalnik</td></tr>
            <tr><th>Barva:</th><td>črna kovinska</td></tr>
            <tr><th>Kategorija:</th><td>Naked</td></tr>
          </table>
          <div>Ostali podatki</div>
          <p>Odlično ohranjen motor, 1. lastnik, potrjena servisna knjiga, ABS, LED, kovčka.</p>
          <img src="https://images.avto.net/photo/21948512/1001_small.jpg" />
          <img src="https://images.avto.net/photo/21948512/1002.jpg" />
        </body>
      </html>
    `;

    const parsed = parseAvtoNetContent({
      url: "https://www.avto.net/Ads/details.asp?id=21948512",
      externalId: "21948512",
      rawContent: sampleHtml,
    });

    expect(parsed.brand).toBe("Yamaha");
    expect(parsed.model).toBe("MT-07 Pure");
    expect(parsed.year).toBe(2022);
    expect(parsed.firstRegistration).toBe("05 / 2022");
    expect(parsed.condition).toBe("USED");
    expect(parsed.mileageKm).toBe(12500);
    expect(parsed.priceEur).toBe("6990");
    expect(parsed.engineCc).toBe(689);
    expect(parsed.powerKw).toBe(54);
    expect(parsed.powerHp).toBe(73);
    expect(parsed.fuelType).toBe("bencinski motor");
    expect(parsed.transmission).toBe("ročni menjalnik");
    expect(parsed.color).toBe("črna kovinska");
    expect(parsed.category).toBe("Naked");
    expect(parsed.equipment).toContain("ABS");
    expect(parsed.serviceHistory).toContain("1. lastnik");
    expect(parsed.imageUrls).toEqual([
      "https://images.avto.net/photo/21948512/1001.jpg",
      "https://images.avto.net/photo/21948512/1002.jpg",
    ]);
  });

  it("ne izmišlja manjkajočih podatkov", () => {
    const empty = parseAvtoNetContent({
      url: "https://www.avto.net/Ads/details.asp?id=99999999",
      externalId: "99999999",
      rawContent: "",
    });
    expect(empty.brand).toBe("");
    expect(empty.model).toBe("");
    expect(empty.year).toBeNull();
    expect(empty.priceEur).toBe("");
    expect(empty.mileageKm).toBeNull();
    expect(empty.engineCc).toBeNull();
    expect(empty.powerKw).toBeNull();
    expect(empty.imageUrls).toEqual([]);
  });
});
