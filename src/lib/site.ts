export const site = {
  brand: "EL-MOTO",
  legalName: "EL-MOTO d.o.o.",
  registryName: "EL-MOTO, trgovina in posredništvo, d.o.o.",
  slogan: "Tvoja pot. Tvoj motor.",
  street: "Špruha 33",
  postalCode: "1236",
  city: "Trzin",
  country: "Slovenija",
  countryCode: "SI",
  phoneDisplay: "070 868 600",
  phoneTel: "+38670868600",
  whatsappUrl: "https://wa.me/38670868600",
  email: "info@elmoto.si",
  instagram: "https://www.instagram.com/elmoto.si/",
  instagramHandle: "@elmoto.si",
  facebook: "https://www.facebook.com/profile.php?id=61583000308059&locale=en_GB",
  lat: 46.11671,
  lng: 14.54729,
  taxNumber: "SI48944092",
  registrationNumber: "7379552000",
  representative: "Elvis Cinac",
  court: "Okrožno sodišče v Ljubljani",
  registeredOn: "17. 11. 2025",
} as const;

export const mapsSearchUrl =
  "https://www.google.com/maps/search/?api=1&query=EL-MOTO%2C+%C5%A0pruha+33%2C+1236+Trzin";

export const mapsDirectionsUrl =
  "https://www.google.com/maps/dir/?api=1&destination=%C5%A0pruha+33%2C+1236+Trzin%2C+Slovenija";

export const osmUrl =
  "https://www.openstreetmap.org/?mlat=46.11671&mlon=14.54729#map=17/46.11671/14.54729";

/** Ciljna domena naročnika. Canonical in Open Graph jo uporabita šele, ko je NEXT_PUBLIC_SITE_URL nastavljen nanjo. */
export const productionOrigin = "https://www.elmoto.si";

export const avtoNetUrl = "https://www.avto.net/EL-MOTO";
export const koveCatalogUrl = "https://kove.si/ponudba-motociklov/";

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export const inquiryTypes = [
  { value: "PURCHASE", label: "Nakup motorja" },
  { value: "RENTAL", label: "Najem motorja" },
  { value: "VIEWING", label: "Dogovor za ogled" },
  { value: "GENERAL", label: "Splošno vprašanje" },
  { value: "OTHER", label: "Drugo" },
] as const;

export const bookingStatuses = [
  { value: "NEW", label: "Novo povpraševanje" },
  { value: "IN_PROGRESS", label: "V obdelavi" },
  { value: "CONFIRMED", label: "Potrjeno" },
  { value: "REJECTED", label: "Zavrnjeno" },
  { value: "CANCELLED", label: "Preklicano" },
  { value: "COMPLETED", label: "Zaključeno" },
] as const;

export const inquiryStatuses = [
  { value: "NEW", label: "Novo" },
  { value: "IN_PROGRESS", label: "V obdelavi" },
  { value: "DONE", label: "Zaključeno" },
] as const;

export const saleLinks = [
  { href: "/motorji", label: "Vsi motorji", condition: "" },
  { href: "/motorji?condition=USED", label: "Rabljeni motorji", condition: "USED" },
  { href: "/motorji?condition=NEW", label: "Novi motorji", condition: "NEW" },
] as const;

export const ponudbaLinks = [
  { href: "/motorji", label: "PRODAJA" },
  { href: "/uvoz", label: "UVOZ" },
  { href: "/najem", label: "NAJEM" },
  { href: "/oprema", label: "OPREMA" },
] as const;

export const navItems = [
  { href: "/kove", label: "KOVE" },
  { href: "/garancija-financiranje", label: "GARANCIJA & FINANCIRANJE" },
  { href: "/galerija", label: "GALERIJA" },
  { href: "/kontakt", label: "KONTAKT" },
] as const;
