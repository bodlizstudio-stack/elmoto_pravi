export const PUBLICATIONS = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
export const AVAILABILITY = ["UNKNOWN", "AVAILABLE", "RESERVED", "SOLD"] as const;

export type Publication = (typeof PUBLICATIONS)[number];
export type Availability = (typeof AVAILABILITY)[number];

export function publicationLabel(value: string) {
  if (value === "PUBLISHED") return "Objavljeno";
  if (value === "ARCHIVED") return "Arhivirano";
  return "Osnutek";
}

export function availabilityLabel(value: string) {
  if (value === "AVAILABLE") return "Na voljo";
  if (value === "RESERVED") return "Rezervirano";
  if (value === "SOLD") return "Prodano";
  if (value === "UNKNOWN") return "Razpoložljivost preveri po povpraševanju";
  return "";
}

export function publicListStatuses(filter: string) {
  if (filter === "all") return ["AVAILABLE", "RESERVED", "SOLD", "UNKNOWN"];
  if (filter === "AVAILABLE" || filter === "RESERVED" || filter === "SOLD" || filter === "UNKNOWN") return [filter];
  return ["AVAILABLE", "RESERVED", "UNKNOWN"];
}

export function canPublish(input: { brand: string; model: string }) {
  if (!input.brand.trim() || !input.model.trim()) return "Za objavo vpiši znamko in model.";
  return null;
}
