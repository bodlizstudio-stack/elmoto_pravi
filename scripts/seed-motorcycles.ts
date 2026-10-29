import { PrismaClient } from "@prisma/client";
import { parseSpecs, slugify } from "../src/lib/utils";

const prisma = new PrismaClient();

type BikeData = {
  num: number;
  brand: string;
  model: string;
  variant: string;
  priceEur: number;
  year: number;
  condition: "NEW" | "USED";
  mileageKm: number;
  category: string;
  engineCc: number;
  powerKw: number;
  powerHp: number;
  engineType: string;
  transmission: string;
  driveType: string;
  color: string;
  firstRegistration: string;
  description: string;
  specsRaw: string;
};

const BIKES: BikeData[] = [
  {
    num: 1,
    brand: "Yamaha",
    model: "Tracer 9 GT",
    variant: "GT",
    priceEur: 10690,
    year: 2025,
    condition: "USED",
    mileageKm: 6000,
    category: "Tourer",
    engineCc: 890,
    powerKw: 88,
    powerHp: 120,
    engineType: "890 ccm, 3 valjni, 4 taktni",
    transmission: "nožni menjalnik",
    driveType: "veriga",
    color: "rdeča",
    firstRegistration: "7 / 2025",
    description: "Yamaha Tracer 9 GT z odličnim 3-valjnim agregatom CP3 (88 kW / 120 KM), letnik 2025 s samo 6.000 prevoženimi kilometri. Motor je v garanciji, redno vzdrževan in pripravljen na daljša potovanja. Ogled možen na lokaciji Špruha 33, Trzin.",
    specsRaw: `1.registracija:\t7 / 2025
Letnik:\t2025
Starost:\trabljeno / ima garancijo
Prevoženi km:\t6000
Tehnični pregled velja do:\t2029 / 7
Motor:\t890 ccm, 3 valjni, 4 taktni
Moč motorja:\t88 kW  (120 KM)
Menjalnik:\tnožni menjalnik
Zagon motorja:\tavtomatski / ročni zagon
Prenos moči:\tveriga
Blokada:\tbrez blokade
Kategorija:\tTourer
Barva:\trdeča
Interna številka:\t
Kraj ogleda:\tŠpruha 33, Trzin`,
  },
  {
    num: 2,
    brand: "Beta",
    model: "Xtrainer 300",
    variant: "300 2T",
    priceEur: 5890,
    year: 2021,
    condition: "USED",
    mileageKm: 1500,
    category: "Cross",
    engineCc: 293,
    powerKw: 28,
    powerHp: 38,
    engineType: "293 ccm, 1 valjni, 2 taktni",
    transmission: "nožni menjalnik",
    driveType: "veriga",
    color: "modra",
    firstRegistration: "4 / 2021",
    description: "Beta Xtrainer 300, slovensko poreklo (kupljen v SLO), letnik 2021 s samo 1.500 km. Lahek, okreten enduro/cross motor z 2-taktnim motorjem (28 kW / 38 KM) in električnim zagonom. Odlično ohranjen. Ogled možen na lokaciji Špruha 33, Trzin.",
    specsRaw: `1.registracija:\t4 / 2021   SLOVENSKO poreklo - kupljen v SLO
Letnik:\t2021
Starost:\trabljeno
Prevoženi km:\t1500
Tehnični pregled velja do:\t2027 / 5
Motor:\t293 ccm, 1 valjni, 2 taktni
Moč motorja:\t28 kW  (38 KM)
Menjalnik:\tnožni menjalnik
Zagon motorja:\tavtomatski / ročni zagon
Prenos moči:\tveriga
Blokada:\tbrez blokade
Kategorija:\tCross
Barva:\tmodra
Interna številka:\t
Kraj ogleda:\tŠpruha 33, Trzin`,
  },
  {
    num: 3,
    brand: "Kawasaki",
    model: "J300",
    variant: "ABS",
    priceEur: 3150,
    year: 2019,
    condition: "USED",
    mileageKm: 48000,
    category: "Maxi scooter",
    engineCc: 299,
    powerKw: 20,
    powerHp: 27,
    engineType: "299 ccm, 1 valjni, 4 taktni",
    transmission: "avtomatski menjalnik",
    driveType: "jermen",
    color: "temno zelena",
    firstRegistration: "6 / 2019",
    description: "Kawasaki J300 ABS, maxi skuter s slovenskih cest (kupljen v SLO), letnik 2019. Udoben, zanesljiv in prostoren mestni ter primestni skuter z avtomatskim menjalnikom. Ogled v Trzinu (Špruha 33).",
    specsRaw: `1.registracija:\t6 / 2019   SLOVENSKO poreklo - kupljen v SLO
Letnik:\t2019
Starost:\trabljeno
Prevoženi km:\t48000
Tehnični pregled velja do:\t2027 / 6
Motor:\t299 ccm, 1 valjni, 4 taktni
Moč motorja:\t20 kW  (27 KM)
Menjalnik:\tavtomatski menjalnik
Zagon motorja:\tavtomatski / ročni zagon
Prenos moči:\tjermen
Blokada:\tbrez blokade
Kategorija:\tMaxi scooter
Barva:\ttemno zelena
Interna številka:\t
Kraj ogleda:\tŠpruha 33, Trzin`,
  },
  {
    num: 4,
    brand: "Yamaha",
    model: "Tracer 9 GT",
    variant: "GT Black",
    priceEur: 10290,
    year: 2023,
    condition: "USED",
    mileageKm: 34000,
    category: "Tourer",
    engineCc: 890,
    powerKw: 88,
    powerHp: 120,
    engineType: "890 ccm, 3 valjni, 4 taktni",
    transmission: "nožni menjalnik",
    driveType: "veriga",
    color: "črna",
    firstRegistration: "5 / 2023",
    description: "Yamaha Tracer 9 GT v elegantni črni barvi z zlatimi platišči in kovčki. Letnik 2023, 34.000 km, vrhunsko opremljen potovalni motocikel s 3-valjnim motorjem (120 KM). Ogled v Trzinu.",
    specsRaw: `1.registracija:\t5 / 2023
Letnik:\t2023
Starost:\trabljeno
Prevoženi km:\t34000
Tehnični pregled velja do:\t2027 / 5
Motor:\t890 ccm, 3 valjni, 4 taktni
Moč motorja:\t88 kW  (120 KM)
Menjalnik:\tnožni menjalnik
Zagon motorja:\tavtomatski / ročni zagon
Prenos moči:\tveriga
Blokada:\tbrez blokade
Kategorija:\tTourer
Barva:\tčrna
Interna številka:\t
Kraj ogleda:\tŠpruha 33, Trzin`,
  },
  {
    num: 5,
    brand: "BMW",
    model: "F 900 XR",
    variant: "XR",
    priceEur: 11290,
    year: 2024,
    condition: "USED",
    mileageKm: 28000,
    category: "Tourer",
    engineCc: 895,
    powerKw: 77,
    powerHp: 105,
    engineType: "895 ccm, 2 valjni, 4 taktni",
    transmission: "nožni menjalnik",
    driveType: "veriga",
    color: "modra metalik",
    firstRegistration: "4 / 2024",
    description: "BMW F 900 XR v čudoviti modri metalik barvi s stranskimi kovčki. Letnik 2024, 28.000 km, z veljavno tovarniško garancijo do 2028. Odličen športno-potovalni motocikel s 105 KM. Kraj ogleda: Špruha 33, Trzin.",
    specsRaw: `1.registracija:\t4 / 2024
Letnik:\t2024
Starost:\trabljeno / ima garancijo
Prevoženi km:\t28000
Tehnični pregled velja do:\t2028 / 4
Motor:\t895 ccm, 2 valjni, 4 taktni
Moč motorja:\t77 kW  (105 KM)
Menjalnik:\tnožni menjalnik
Zagon motorja:\tavtomatski / ročni zagon
Prenos moči:\tveriga
Blokada:\tbrez blokade
Kategorija:\tTourer
Barva:\tmodra metalik
Interna številka:\t
Kraj ogleda:\tŠpruha 33, Trzin`,
  },
  {
    num: 6,
    brand: "Honda",
    model: "NT 1100",
    variant: "Tourer",
    priceEur: 10690,
    year: 2023,
    condition: "USED",
    mileageKm: 13000,
    category: "Tourer",
    engineCc: 1084,
    powerKw: 75,
    powerHp: 102,
    engineType: "1084 ccm, 2 valjni, 4 taktni",
    transmission: "nožni menjalnik",
    driveType: "veriga",
    color: "črna metalik",
    firstRegistration: "11 / 2023",
    description: "Honda NT 1100, vrhunski potovalni motocikel s polno opremo in tremi kovčki. Letnik 2023, samo 13.000 km, z garancijo. Močan 2-valjni agregat 1084 ccm s 75 kW (102 KM). Kraj ogleda: Špruha 33, Trzin.",
    specsRaw: `1.registracija:\t11 / 2023
Letnik:\t2023
Starost:\trabljeno / ima garancijo
Prevoženi km:\t13000
Tehnični pregled velja do:\t2027 / 11
Motor:\t1084 ccm, 2 valjni, 4 taktni
Moč motorja:\t75 kW  (102 KM)
Menjalnik:\tnožni menjalnik
Zagon motorja:\tavtomatski / ročni zagon
Prenos moči:\tveriga
Blokada:\tbrez blokade
Kategorija:\tTourer
Barva:\tčrna metalik
Interna številka:\t
Kraj ogleda:\tŠpruha 33, Trzin`,
  },
  {
    num: 7,
    brand: "Suzuki",
    model: "GSX-8S",
    variant: "8S",
    priceEur: 6490,
    year: 2025,
    condition: "USED",
    mileageKm: 9500,
    category: "Naked Bike",
    engineCc: 776,
    powerKw: 61,
    powerHp: 83,
    engineType: "776 ccm, 2 valjni, 4 taktni",
    transmission: "nožni menjalnik",
    driveType: "veriga",
    color: "modra metalik",
    firstRegistration: "5 / 2025",
    description: "Suzuki GSX-8S, sodoben naked bike z novim vzporednim dvovaljnikom 776 ccm (61 kW / 83 KM). Letnik 2025, 9.500 km, ima garancijo, dodan zadnji kovček. Izjemna voznost in odzivnost. Kraj ogleda: Špruha 33, Trzin.",
    specsRaw: `1.registracija:\t5 / 2025
Letnik:\t2025
Starost:\trabljeno / ima garancijo
Prevoženi km:\t9500
Motor:\t776 ccm, 2 valjni, 4 taktni
Moč motorja:\t61 kW  (83 KM)
Menjalnik:\tnožni menjalnik
Zagon motorja:\tavtomatski / ročni zagon
Prenos moči:\tveriga
Blokada:\tbrez blokade
Kategorija:\tNaked Bike
Barva:\tmodra metalik
Interna številka:\t
Kraj ogleda:\tŠpruha 33, Trzin`,
  },
  {
    num: 8,
    brand: "Suzuki",
    model: "V-Strom 800",
    variant: "800 SE",
    priceEur: 8290,
    year: 2025,
    condition: "USED",
    mileageKm: 11200,
    category: "Enduro",
    engineCc: 776,
    powerKw: 62,
    powerHp: 84,
    engineType: "776 ccm, 2 valjni, 4 taktni",
    transmission: "nožni menjalnik",
    driveType: "veriga",
    color: "siva metalik",
    firstRegistration: "6 / 2025",
    description: "Suzuki V-Strom 800 (SE), vsestranski potovalni enduro z dvovaljnikom 776 ccm (62 kW / 84 KM). Letnik 2025, 11.200 km, v garanciji, opremljen s stranskimi torbami. Tehnični velja do 2029. Ogled v Trzinu.",
    specsRaw: `1.registracija:\t6 / 2025
Letnik:\t2025
Starost:\trabljeno / ima garancijo
Prevoženi km:\t11200
Tehnični pregled velja do:\t2029 / 6
Motor:\t776 ccm, 2 valjni, 4 taktni
Moč motorja:\t62 kW  (84 KM)
Menjalnik:\tnožni menjalnik
Zagon motorja:\tavtomatski / ročni zagon
Prenos moči:\tveriga
Blokada:\tbrez blokade
Kategorija:\tEnduro
Barva:\tsiva metalik
Interna številka:\t
Kraj ogleda:\tŠpruha 33, Trzin`,
  },
  {
    num: 9,
    brand: "Yamaha",
    model: "Tracer 7",
    variant: "7",
    priceEur: 5990,
    year: 2021,
    condition: "USED",
    mileageKm: 28000,
    category: "Tourer",
    engineCc: 689,
    powerKw: 54,
    powerHp: 73,
    engineType: "689 ccm, 2 valjni, 4 taktni",
    transmission: "nožni menjalnik",
    driveType: "veriga",
    color: "rdeča",
    firstRegistration: "6 / 2021",
    description: "Yamaha Tracer 7 z legendarnim agregatom CP2 (689 ccm, 54 kW / 73 KM). Rdeče barve, letnik 2021, 28.000 km, z nameščenim zadnjim kovčkom. Izjemno priljubljen in zanesljiv potovalni motocikel. Ogled: Špruha 33, Trzin.",
    specsRaw: `1.registracija:\t6 / 2021
Letnik:\t2021
Starost:\trabljeno
Prevoženi km:\t28000
Tehnični pregled velja do:\t2026 / 10
Motor:\t689 ccm, 2 valjni, 4 taktni
Moč motorja:\t54 kW  (73 KM)
Menjalnik:\tnožni menjalnik
Zagon motorja:\tavtomatski / ročni zagon
Prenos moči:\tveriga
Blokada:\tbrez blokade
Kategorija:\tTourer
Barva:\trdeča
Interna številka:\t
Kraj ogleda:\tŠpruha 33, Trzin`,
  },
  {
    num: 10,
    brand: "KOVE",
    model: "450RR",
    variant: "RR SuperSport",
    priceEur: 6990,
    year: 2025,
    condition: "NEW",
    mileageKm: 0,
    category: "Sport",
    engineCc: 443,
    powerKw: 52,
    powerHp: 71,
    engineType: "443 ccm, 4 valjni, 4 taktni",
    transmission: "nožni menjalnik",
    driveType: "veriga",
    color: "črna metalik",
    firstRegistration: "",
    description: "Novo vozilo! KOVE 450RR z navitim štirivaljnikom 443 ccm, ki razvije kar 52 kW (71 KM) pri visokih vrtljajih. Športna aerodinamična oblika, lahka šasija in dirkaška geometrija. Novo z garancijo. Ogled v salonu EL-MOTO, Trzin.",
    specsRaw: `Starost:\tnovo
Prevoženi km:\t0
Motor:\t443 ccm, 4 valjni, 4 taktni
Moč motorja:\t52 kW  (71 KM)
Menjalnik:\tnožni menjalnik
Zagon motorja:\tavtomatski / ročni zagon
Prenos moči:\tveriga
Blokada:\tbrez blokade
Kategorija:\tSport
Barva:\tčrna metalik
Interna številka:\t
Kraj ogleda:\tŠpruha 33, Trzin`,
  },
  {
    num: 11,
    brand: "Yamaha",
    model: "XSR900",
    variant: "900 Sport Heritage",
    priceEur: 5790,
    year: 2019,
    condition: "USED",
    mileageKm: 21000,
    category: "Naked Bike",
    engineCc: 847,
    powerKw: 85,
    powerHp: 116,
    engineType: "847 ccm, 3 valjni, 4 taktni",
    transmission: "nožni menjalnik",
    driveType: "veriga",
    color: "siva",
    firstRegistration: "6 / 2019",
    description: "Yamaha XSR900, retro-moderni naked bike s slovenskim poreklom. Letnik 2019, 21.000 km, z močnim CP3 agregatom (85 kW / 116 KM). Odlično ohranjen, tehnični veljaven do 6/2027. Ogled v Trzinu.",
    specsRaw: `1.registracija:\t6 / 2019   SLOVENSKO poreklo - kupljen v SLO
Letnik:\t2019
Starost:\trabljeno
Prevoženi km:\t21000
Tehnični pregled velja do:\t2027 / 6
Motor:\t847 ccm, 3 valjni, 4 taktni
Moč motorja:\t85 kW  (116 KM)
Menjalnik:\tnožni menjalnik
Zagon motorja:\tavtomatski / ročni zagon
Prenos moči:\tveriga
Blokada:\tbrez blokade
Kategorija:\tNaked Bike
Barva:\tsiva
Interna številka:\t
Kraj ogleda:\tŠpruha 33, Trzin`,
  },
  {
    num: 12,
    brand: "Piaggio",
    model: "Beverly 300",
    variant: "300 HPE",
    priceEur: 3890,
    year: 2022,
    condition: "USED",
    mileageKm: 13600,
    category: "Maxi scooter",
    engineCc: 278,
    powerKw: 19,
    powerHp: 26,
    engineType: "278 ccm, 1 valjni, 4 taktni",
    transmission: "avtomatski menjalnik",
    driveType: "jermen",
    color: "bela metalik",
    firstRegistration: "6 / 2022",
    description: "Piaggio Beverly 300 HPE v beli metalik barvi z originalnim kovčkom. Letnik 2022, 13.600 km, vrhunski mestni skuter z velikimi kolesi za udobno in varno vožnjo. Ogled: Špruha 33, Trzin.",
    specsRaw: `1.registracija:\t6 / 2022
Letnik:\t2022
Starost:\trabljeno
Prevoženi km:\t13600
Tehnični pregled velja do:\t2026 / 6
Motor:\t278 ccm, 1 valjni, 4 taktni
Moč motorja:\t19 kW  (26 KM)
Menjalnik:\tavtomatski menjalnik
Zagon motorja:\tavtomatski / ročni zagon
Prenos moči:\tjermen
Blokada:\tbrez blokade
Kategorija:\tMaxi scooter
Barva:\tbela metalik
Interna številka:\t
Kraj ogleda:\tŠpruha 33, Trzin`,
  },
  {
    num: 13,
    brand: "Honda",
    model: "CBF 600 S",
    variant: "600 S",
    priceEur: 1590,
    year: 2005,
    condition: "USED",
    mileageKm: 120000,
    category: "Tourer",
    engineCc: 599,
    powerKw: 57,
    powerHp: 77,
    engineType: "599 ccm, 4 valjni, 4 taktni",
    transmission: "nožni menjalnik",
    driveType: "veriga",
    color: "modra metalik",
    firstRegistration: "5 / 2005",
    description: "Honda CBF 600 S, preizkušen potovalni motocikel s 4-valjnim motorjem (57 kW / 77 KM). Letnik 2005, opremljen s stranskimi kovčki in torbo na rezervoarju. Ugodna cena. Ogled v Trzinu.",
    specsRaw: `1.registracija:\t5 / 2005
Letnik:\t2005
Starost:\trabljeno
Prevoženi km:\t120000
Motor:\t599 ccm, 4 valjni, 4 taktni
Moč motorja:\t57 kW  (77 KM)
Menjalnik:\tnožni menjalnik
Zagon motorja:\tavtomatski / ročni zagon
Prenos moči:\tveriga
Blokada:\tbrez blokade
Kategorija:\tTourer
Barva:\tmodra metalik
Interna številka:\t
Kraj ogleda:\tŠpruha 33, Trzin`,
  },
  {
    num: 14,
    brand: "Ducati",
    model: "Monster 797",
    variant: "797",
    priceEur: 6190,
    year: 2017,
    condition: "USED",
    mileageKm: 9500,
    category: "Naked Bike",
    engineCc: 803,
    powerKw: 55,
    powerHp: 75,
    engineType: "803 ccm, 2 valjni, 4 taktni",
    transmission: "nožni menjalnik",
    driveType: "veriga",
    color: "bela metalik",
    firstRegistration: "10 / 2017",
    description: "Ducati Monster 797, slovensko poreklo, letnik 2017 z le 9.500 km. Čudovita bela metalik barva z rdečim cevastim okvirjem in rdečimi platišči, športni izpušni sistem. Ogled: Špruha 33, Trzin.",
    specsRaw: `1.registracija:\t10 / 2017   SLOVENSKO poreklo - kupljen v SLO
Letnik:\t2017
Starost:\trabljeno
Prevoženi km:\t9500
Tehnični pregled velja do:\t2027 / 10
Motor:\t803 ccm, 2 valjni, 4 taktni
Moč motorja:\t55 kW  (75 KM)
Menjalnik:\tnožni menjalnik
Zagon motorja:\tavtomatski / ročni zagon
Prenos moči:\tveriga
Blokada:\tbrez blokade
Kategorija:\tNaked Bike
Barva:\tbela metalik
Interna številka:\t
Kraj ogleda:\tŠpruha 33, Trzin`,
  },
  {
    num: 15,
    brand: "KOVE",
    model: "800X Adventure",
    variant: "800X Pro (35 kW A2)",
    priceEur: 8990,
    year: 2025,
    condition: "NEW",
    mileageKm: 0,
    category: "Enduro",
    engineCc: 799,
    powerKw: 70,
    powerHp: 95,
    engineType: "799 ccm, 2 valjni, 4 taktni",
    transmission: "nožni menjalnik",
    driveType: "veriga",
    color: "črna",
    firstRegistration: "",
    description: "Novo vozilo! KOVE 800X Adventure v črni barvi z zlatimi platišči. Tovarniško blokiran na A2 kategorijo (možnost odprtja na polnih 70 kW / 95 KM). Odlično vzmetenje, nizka teža in vrhunske terenske zmogljivosti. Garancija. Ogled: Trzin.",
    specsRaw: `Starost:\tnovo
Prevoženi km:\t0
Motor:\t799 ccm, 2 valjni, 4 taktni
Moč motorja:\t70 kW  (95 KM)
Menjalnik:\tnožni menjalnik
Zagon motorja:\tavtomatski / ročni zagon
Prenos moči:\tveriga
Blokada:\ttovarniška blokada
Kategorija:\tEnduro
Barva:\tčrna
Interna številka:\t
Kraj ogleda:\tŠpruha 33, Trzin`,
  },
  {
    num: 16,
    brand: "KOVE",
    model: "800X Adventure",
    variant: "800X Pro Grey",
    priceEur: 8990,
    year: 2025,
    condition: "NEW",
    mileageKm: 0,
    category: "Enduro",
    engineCc: 799,
    powerKw: 70,
    powerHp: 95,
    engineType: "799 ccm, 2 valjni, 4 taktni",
    transmission: "nožni menjalnik",
    driveType: "veriga",
    color: "temno siva",
    firstRegistration: "",
    description: "Novo vozilo! KOVE 800X Adventure v temno sivi metalik barvi z zlatimi platišči. Polna moč 70 kW (95 KM), brez blokade. Napredna elektronika, nastavljivo vzmetenje, vrhunski potovalni enduro. Ogled v salonu EL-MOTO, Špruha 33, Trzin.",
    specsRaw: `Starost:\tnovo
Prevoženi km:\t0
Motor:\t799 ccm, 2 valjni, 4 taktni
Moč motorja:\t70 kW  (95 KM)
Menjalnik:\tnožni menjalnik
Zagon motorja:\tavtomatski / ročni zagon
Prenos moči:\tveriga
Blokada:\tbrez blokade
Kategorija:\tEnduro
Barva:\ttemno siva
Interna številka:\t
Kraj ogleda:\tŠpruha 33, Trzin`,
  },
  {
    num: 17,
    brand: "KOVE",
    model: "800X Adventure",
    variant: "800X Pro White",
    priceEur: 8990,
    year: 2025,
    condition: "NEW",
    mileageKm: 0,
    category: "Enduro",
    engineCc: 799,
    powerKw: 70,
    powerHp: 95,
    engineType: "799 ccm, 2 valjni, 4 taktni",
    transmission: "nožni menjalnik",
    driveType: "veriga",
    color: "bela",
    firstRegistration: "",
    description: "Novo vozilo! KOVE 800X Adventure v atraktivni beli barvi z zlatimi naperami in rdečimi poudarki. 799 ccm dvovaljnik z 95 KM, brez blokade. Odlično pripravljen za vse vrste terenov in dolga potovanja. Ogled v Trzinu.",
    specsRaw: `Starost:\tnovo
Prevoženi km:\t0
Motor:\t799 ccm, 2 valjni, 4 taktni
Moč motorja:\t70 kW  (95 KM)
Menjalnik:\tnožni menjalnik
Zagon motorja:\tavtomatski / ročni zagon
Prenos moči:\tveriga
Blokada:\tbrez blokade
Kategorija:\tEnduro
Barva:\tbela
Interna številka:\t
Kraj ogleda:\tŠpruha 33, Trzin`,
  },
  {
    num: 18,
    brand: "KOVE",
    model: "510X",
    variant: "510X Adventure",
    priceEur: 5990,
    year: 2025,
    condition: "NEW",
    mileageKm: 0,
    category: "Enduro",
    engineCc: 498,
    powerKw: 35,
    powerHp: 48,
    engineType: "498 ccm, 2 valjni, 4 taktni",
    transmission: "nožni menjalnik",
    driveType: "veriga",
    color: "črna",
    firstRegistration: "",
    description: "Novo vozilo! KOVE 510X Adventure, primeren za vozniški izpit A2 (35 kW / 48 KM). Opremljen s cevnimi zaščitami, nosilci kovčkov, zaščito podvozja in zlatimi platišči. Idealen za vstop v svet potovalnega endura. Ogled: Špruha 33, Trzin.",
    specsRaw: `Starost:\tnovo
Prevoženi km:\t0
Motor:\t498 ccm, 2 valjni, 4 taktni
Moč motorja:\t35 kW  (48 KM)
Menjalnik:\tnožni menjalnik
Zagon motorja:\tavtomatski / ročni zagon
Prenos moči:\tveriga
Blokada:\tbrez blokade
Kategorija:\tEnduro
Barva:\tčrna
Interna številka:\t
Kraj ogleda:\tŠpruha 33, Trzin`,
  },
  {
    num: 19,
    brand: "KOVE",
    model: "450 Rally",
    variant: "450 Rally",
    priceEur: 7990,
    year: 2025,
    condition: "NEW",
    mileageKm: 0,
    category: "Enduro",
    engineCc: 449,
    powerKw: 31,
    powerHp: 42,
    engineType: "449 ccm, 1 valjni, 4 taktni",
    transmission: "nožni menjalnik",
    driveType: "veriga",
    color: "rdeča",
    firstRegistration: "",
    description: "Novo vozilo! KOVE 450 Rally, pristen Dakar rally motocikel, homologiran za cestno rabo. Zmogljivo vzmetenje z dolgim hodom, velik rezervoar, rally navigacijski stolp in tovarniška blokada. Ogled v salonu EL-MOTO, Trzin.",
    specsRaw: `Starost:\tnovo
Prevoženi km:\t0
Motor:\t449 ccm, 1 valjni, 4 taktni
Moč motorja:\t31 kW  (42 KM)
Menjalnik:\tnožni menjalnik
Zagon motorja:\tavtomatski / ročni zagon
Prenos moči:\tveriga
Blokada:\ttovarniška blokada
Kategorija:\tEnduro
Barva:\trdeča
Interna številka:\t
Kraj ogleda:\tŠpruha 33, Trzin`,
  },
  {
    num: 20,
    brand: "KOVE",
    model: "525X ADV",
    variant: "525X ADV",
    priceEur: 6990,
    year: 2025,
    condition: "NEW",
    mileageKm: 0,
    category: "Enduro",
    engineCc: 581,
    powerKw: 47,
    powerHp: 64,
    engineType: "581 ccm, 2 valjni, 4 taktni",
    transmission: "nožni menjalnik",
    driveType: "veriga",
    color: "bela",
    firstRegistration: "",
    description: "Novo vozilo! KOVE 525X ADV v modro-beli barvni kombinaciji z zlatimi platišči. Zanesljiv dvovaljni motor s 47 kW (64 KM), polna potovalna zaščita, LED meglenke in visok vizir. Tehnični pregled velja do 2031. Ogled: Špruha 33, Trzin.",
    specsRaw: `Starost:\tnovo
Prevoženi km:\t0
Tehnični pregled velja do:\t2031 / 1
Motor:\t581 ccm, 2 valjni, 4 taktni
Moč motorja:\t47 kW  (64 KM)
Menjalnik:\tnožni menjalnik
Zagon motorja:\tavtomatski / ročni zagon
Prenos moči:\tveriga
Blokada:\tbrez blokade
Kategorija:\tEnduro
Barva:\tbela
Interna številka:\t
Kraj ogleda:\tŠpruha 33, Trzin`,
  },
  {
    num: 21,
    brand: "BMW",
    model: "R 1200 GS",
    variant: "1200 GS Vario",
    priceEur: 5890,
    year: 2009,
    condition: "USED",
    mileageKm: 73000,
    category: "Enduro",
    engineCc: 1170,
    powerKw: 77,
    powerHp: 105,
    engineType: "1170 ccm, 2 valjni, 4 taktni",
    transmission: "nožni menjalnik",
    driveType: "kardan",
    color: "črna",
    firstRegistration: "4 / 2009",
    description: "BMW R 1200 GS, legendarni kralj potovalnih endurov s kardanskim prenosom in bokser motorjem (1170 ccm, 77 kW / 105 KM). Letnik 2009, 73.000 km, opremljen s tremi kovčki (Vario) in torbo na rezervoarju. Odlično ohranjen. Ogled: Špruha 33, Trzin.",
    specsRaw: `1.registracija:\t4 / 2009
Letnik:\t2009
Starost:\trabljeno
Prevoženi km:\t73000
Tehnični pregled velja do:\t2027 / 4
Motor:\t1170 ccm, 2 valjni, 4 taktni
Moč motorja:\t77 kW  (105 KM)
Menjalnik:\tnožni menjalnik
Zagon motorja:\tavtomatski / ročni zagon
Prenos moči:\tkardan
Blokada:\tbrez blokade
Kategorija:\tEnduro
Barva:\tčrna
Interna številka:\t
Kraj ogleda:\tŠpruha 33, Trzin`,
  },
];

async function main() {
  console.log("Seeding 21 motorcycles...");

  // Clean old motorcycles if needed
  await prisma.motorcycleImage.deleteMany();
  await prisma.motorcycleSpecification.deleteMany();
  await prisma.motorcycle.deleteMany();

  // Seed brands
  const brands = [...new Set(BIKES.map((b) => b.brand))];
  for (const name of brands) {
    const slug = slugify(name);
    await prisma.brand.upsert({
      where: { name },
      update: {},
      create: { name, slug },
    });
  }

  // Seed categories
  const categories = [...new Set(BIKES.map((b) => b.category))];
  for (const name of categories) {
    const slug = slugify(name);
    await prisma.motorcycleCategory.upsert({
      where: { name },
      update: {},
      create: { name, slug },
    });
  }

  for (let i = 0; i < BIKES.length; i++) {
    const b = BIKES[i];
    const baseSlug = slugify(`${b.brand}-${b.model}-${b.variant}-${b.year}`);
    let slug = baseSlug;
    let counter = 2;
    while (await prisma.motorcycle.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const priceCents = b.priceEur * 100;
    const isFeatured = i < 3; // Feature top 3 on homepage

    const bike = await prisma.motorcycle.create({
      data: {
        slug,
        brand: b.brand,
        model: b.model,
        variant: b.variant,
        year: b.year,
        firstRegistration: b.firstRegistration,
        mileageKm: b.mileageKm,
        engineCc: b.engineCc,
        powerKw: b.powerKw,
        powerHp: b.powerHp,
        engineType: b.engineType,
        transmission: b.transmission,
        driveType: b.driveType,
        color: b.color,
        category: b.category,
        condition: b.condition,
        status: "AVAILABLE",
        publication: "PUBLISHED",
        forSale: true,
        forRent: false,
        priceCents,
        priceConfirmed: true,
        priceOnRequest: false,
        cardSummary: `${b.year ? b.year + " · " : ""}${b.mileageKm ? b.mileageKm.toLocaleString("sl-SI") + " km · " : ""}${b.engineCc} ccm · ${b.powerKw} kW (${b.powerHp} KM)`,
        description: b.description,
        featured: isFeatured,
        featuredOrder: i + 1,
        publishedAt: new Date(Date.now() - i * 60000), // staggered slightly so newest first
      },
    });

    // Images: <num>1.jpg and <num>2.jpg
    const img1Url = `/uploads/${b.num}1.jpg`;
    const img2Url = `/uploads/${b.num}2.jpg`;

    await prisma.motorcycleImage.createMany({
      data: [
        {
          motorcycleId: bike.id,
          url: img1Url,
          alt: `${b.brand} ${b.model}`,
          sortOrder: 0,
          isCover: true,
        },
        {
          motorcycleId: bike.id,
          url: img2Url,
          alt: `${b.brand} ${b.model} - stranski/zadnji pogled`,
          sortOrder: 1,
          isCover: false,
        },
      ],
    });

    // Specifications
    const parsed = parseSpecs(b.specsRaw);
    if (parsed.length > 0) {
      await prisma.motorcycleSpecification.createMany({
        data: parsed.map((item) => ({
          motorcycleId: bike.id,
          label: item.label,
          value: item.value,
        })),
      });
    }

    console.log(`[${i + 1}/21] Added: ${b.brand} ${b.model} (${b.priceEur} €)`);
  }

  console.log("Seeding complete! 21 motorcycles successfully added.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
