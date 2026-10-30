export const site = {
  brand: "EL-MOTO d.o.o.",
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
  facebook: "https://www.facebook.com/profile.php?id=61583000308059",
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
export const avtoNetOpremaUrl =
  "https://www.avto.net/Ads/results.asp?znamka=&model=&modelID=&tip=&znamka2=&model2=&tip2=&znamka3=&model3=&tip3=&cenaMin=0&cenaMax=999999&letnikMin=0&letnikMax=2090&bencin=0&starost2=999&oblika=0&ccmMin=0&ccmMax=99999&mocMin=0&mocMax=999999&kmMin=0&kmMax=9999999&kwMin=0&kwMax=999999&motortakt=0&motorvalji=0&lokacija=0&sirina=0&dolzina=&dolzinaMIN=0&dolzinaMAX=100&nosilnostMIN=0&nosilnostMAX=999999&sedezevMIN=0&sedezevMAX=9&lezisc=&presek=0&premer=0&col=0&vijakov=0&EToznaka=0&vozilo=0&airbag=&barva=&barvaint=&doseg=0&BkType=0&BkOkvir=0&BkOkvirType=0&Bk4=0&EQ1=1000000000&EQ2=1000000000&EQ3=1000000000&EQ4=100000000&EQ5=1000000000&EQ6=1000001000&EQ7=1110100122&EQ8=1010000000&EQ9=1000000020&EQ10=1000000000&EQ11=1000000000&EQ12=120000000&KAT=1070000000&PIA=&PIAzero=&PIAOut=&PSLO=&akcija=0&paketgarancije=&broker=21407&prikazkategorije=0&kategorija=0&ONLvid=0&ONLnak=0&zaloga=10&arhiv=0&presort=&tipsort=&stran=";
export const koveOfficialUrl = "https://kove.si/ponudba-motociklov/";
export const koveCatalogUrl =
  "https://www.avto.net/Ads/results.asp?znamka=&model=&modelID=&tip=&znamka2=&model2=&tip2=&znamka3=&model3=&tip3=&cenaMin=0&cenaMax=999999&letnikMin=0&letnikMax=2090&bencin=0&starost2=999&oblika=0&ccmMin=0&ccmMax=99999&mocMin=0&mocMax=999999&kmMin=0&kmMax=9999999&kwMin=0&kwMax=999999&motortakt=0&motorvalji=0&lokacija=0&sirina=0&dolzina=&dolzinaMIN=0&dolzinaMAX=100&nosilnostMIN=0&nosilnostMAX=999999&sedezevMIN=0&sedezevMAX=9&lezisc=&presek=0&premer=0&col=0&vijakov=0&EToznaka=0&vozilo=&airbag=&barva=&barvaint=&doseg=0&BkType=0&BkOkvir=0&BkOkvirType=0&Bk4=0&EQ1=1000000000&EQ2=1000000000&EQ3=1000000000&EQ4=100000000&EQ5=1000000000&EQ6=1000001000&EQ7=1110100122&EQ8=1010000000&EQ9=1000000020&EQ10=1000000000&EQ11=1000000000&EQ12=120000000&KAT=1060000000&PIA=&PIAzero=&PIAOut=&PSLO=&akcija=0&paketgarancije=&broker=21407&prikazkategorije=0&kategorija=0&ONLvid=0&ONLnak=0&zaloga=10&arhiv=0&presort=&tipsort=&stran=";

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
  { href: "/motorji?condition=NEW", label: "Novi motorji", condition: "NEW" },
  { href: "/motorji?condition=USED", label: "Rabljeni motorji", condition: "USED" },
] as const;

export const ponudbaLinks = [
  { href: "/motorji", label: "RAZIŠČI MOTORJE" },
  { href: "/kove", label: "KOVE" },
  { href: "/oprema", label: "MOTO OPREMA" },
  { href: "/najem", label: "NAJEM" },
  { href: "/uvoz", label: "UVOZ" },
  { href: "/komisijska-prodaja", label: "KOMISIJSKA PRODAJA" },
] as const;

export const ponudbaMotorjevLinks = ponudbaLinks;

export const navItems = [
  { href: "/garancija-financiranje", label: "GARANCIJA IN FINANCIRANJE" },
  { href: "/o-nas", label: "O NAS" },
  { href: "/kontakt", label: "KONTAKT" },
] as const;
