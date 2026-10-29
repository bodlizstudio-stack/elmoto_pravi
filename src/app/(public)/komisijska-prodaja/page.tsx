import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  HandCoins,
  MapPin,
  RefreshCw,
  Sparkles,
  Star,
} from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { mapsDirectionsUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Komisijska prodaja, odkup in menjava motorjev | EL-MOTO d.o.o.",
  description:
    "Komisijska prodaja motornih koles, neposredni odkup in menjava staro za novo pri EL-MOTO d.o.o. v Trzinu. Zanesljivo, pregledno in brez stresa.",
  alternates: { canonical: "/komisijska-prodaja" },
};

const consignmentSteps = [
  {
    step: "01",
    title: "Posvet in ocena motorja",
    text: "Posreduješ nam osnovne podatke o svojem motorju (znamka, model, letnik, prevoženi kilometri in stanje). Dogovorimo se za ogled v našem salonu v Trzinu ter skupaj določimo realno prodajno ceno.",
  },
  {
    step: "02",
    title: "Profesionalna priprava in oglas",
    text: "Motor strokovno pregledamo, očistimo in kakovostno fotografiramo. Pripravimo natančen opis in ga objavimo na vodilnih prodajnih kanalih ter v naši ponudbi.",
  },
  {
    step: "03",
    title: "Vodenje ogledov in varna prodaja",
    text: "Prevzamemo celotno komunikacijo s potencialnimi kupci, organiziramo oglede ter poskrbimo za varno plačilo in urejen prenos lastništva.",
  },
];

const purchaseSteps = [
  {
    step: "01",
    title: "Oddaja podatkov",
    text: "Pošlji nam podatke o motorju prek spletnega obrazca ali po e-pošti z nekaj fotografijami.",
  },
  {
    step: "02",
    title: "Strokovni ogled",
    text: "V našem salonu v Trzinu opravimo hiter tehnični in vizualni pregled vozila.",
  },
  {
    step: "03",
    title: "Takojšen odkup",
    text: "Če je ponudba za obe strani ustrezna, takoj uredimo prepis in izplačilo brez čakanja.",
  },
];

const exchangeAdvantages = [
  "Brez čakanja: svoj motor pripelješ k nam in se odpelješ z drugim.",
  "Poštena ocena vrednosti tvojega obstoječega motornega kolesa.",
  "Vrednost motorja se upošteva kot polog ali delno plačilo.",
  "Možnost doplačila ali financiranja razlike (Leanpay, NLB).",
  "Uredimo vso potrebno dokumentacijo in prepis na enem mestu.",
];

export default function KomisijskaProdajaPage() {
  return (
    <div className="bg-[#F6F6F4] py-10 text-[#16181C] sm:py-14">
      <div className="wrap">
        <Breadcrumbs
          items={[
            { label: "Domov", href: "/" },
            { label: "Komisijska prodaja" },
          ]}
        />

        {/* HERO SEKCIJA */}
        <header className="mt-6 rounded-[16px] border border-[#E2E5E9] bg-white p-6 shadow-sm sm:p-10 lg:p-12">
          <p className="kicker">Storitve EL-MOTO d.o.o.</p>
          <h1 className="display mt-3 text-4xl text-[#16181C] sm:text-6xl lg:text-7xl">
            KOMISIJSKA PRODAJA, ODKUP IN MENJAVA
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[#5B616B] sm:text-[18px] sm:leading-8">
            Želiš varno in ugodno prodati svoje motorno kolo ali ga zamenjati za drug motor iz naše ponudbe? Pri{" "}
            <strong className="text-[#16181C]">EL-MOTO d.o.o.</strong> ti ponujamo celovite rešitve: profesionalno
            komisijsko prodajo, neposredni odkup ter menjavo staro za drugo.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/kontakt?vrsta=OTHER&model=Komisijska%20prodaja"
              className="btn btn-primary"
            >
              <span>Pošlji povpraševanje</span>
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
            <a href="#odkup" className="btn btn-secondary">
              Odkup motorjev
            </a>
            <a href="#menjava" className="btn btn-secondary">
              Menjava motorjev
            </a>
          </div>
        </header>

        {/* 1. SEKCIJA: KOMISIJSKA PRODAJA */}
        <section
          id="komisijska-prodaja"
          className="mt-12 scroll-mt-28 rounded-[16px] border border-[#E2E5E9] bg-white p-6 shadow-sm sm:p-10"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-block rounded-full border border-[#E31B2B]/30 bg-[#E31B2B]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#E31B2B]">
                Brezskrbna prodaja
              </span>
              <h2 className="display mt-3 text-3xl text-[#16181C] sm:text-4xl">
                KOMISIJSKA PRODAJA MOTORNIH KOLES
              </h2>
            </div>
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[#E2E5E9] bg-[#F6F6F4] text-[#E31B2B]">
              <Sparkles aria-hidden className="h-6 w-6" />
            </span>
          </div>

          <p className="mt-4 max-w-3xl text-[16px] leading-7 text-[#5B616B]">
            Svoj motor prepustiš nam, mi pa poskrbimo za celoten postopek: od profesionalne predstavitve in
            fotografiranja do ogledov in varnega zaključka posla s končnim kupcem. Prihraniš čas, se izogneš
            neštetim klicem in zagotoviš varno transakcijo.
          </p>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {consignmentSteps.map((s) => (
              <div
                key={s.step}
                className="flex flex-col justify-between rounded-[14px] border border-[#E2E5E9] bg-[#F6F6F4] p-6"
              >
                <div>
                  <span className="display text-3xl font-bold text-[#E31B2B] sm:text-4xl">
                    {s.step}
                  </span>
                  <h3 className="display mt-2 text-2xl text-[#16181C]">{s.title}</h3>
                  <p className="mt-2.5 text-[15px] leading-6 text-[#5B616B]">{s.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/kontakt?vrsta=OTHER&model=Komisijska%20prodaja"
              className="btn btn-primary"
            >
              <span>Oddaj motor v komisijsko prodajo</span>
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* 2. SEKCIJA: ODKUP MOTORJEV */}
        <section
          id="odkup"
          className="mt-12 scroll-mt-28 rounded-[16px] border border-[#E2E5E9] bg-white p-6 shadow-sm sm:p-10"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-block rounded-full border border-[#E31B2B]/30 bg-[#E31B2B]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#E31B2B]">
                Hitra realizacija
              </span>
              <h2 className="display mt-3 text-3xl text-[#16181C] sm:text-4xl">
                ODKUP MOTORJEV
              </h2>
            </div>
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[#E2E5E9] bg-[#F6F6F4] text-[#E31B2B]">
              <HandCoins aria-hidden className="h-6 w-6" />
            </span>
          </div>

          <p className="mt-4 max-w-3xl text-[16px] leading-7 text-[#5B616B]">
            Če želiš svoj motor prodati takoj in brez čakanja na kupca, ti pri EL-MOTO d.o.o. nudimo možnost
            neposrednega odkupa. Kupujemo lepo ohranjena in preverjena motorna kolesa z znano zgodovino.
          </p>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {purchaseSteps.map((s) => (
              <div
                key={s.step}
                className="flex flex-col justify-between rounded-[14px] border border-[#E2E5E9] bg-[#F6F6F4] p-6"
              >
                <div>
                  <span className="display text-3xl font-bold text-[#E31B2B] sm:text-4xl">
                    {s.step}
                  </span>
                  <h3 className="display mt-2 text-2xl text-[#16181C]">{s.title}</h3>
                  <p className="mt-2.5 text-[15px] leading-6 text-[#5B616B]">{s.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Mnenje stranke o odkupu (Andrea Prando) */}
          <div className="mt-8 rounded-[14px] border border-[#E2E5E9] bg-[#F6F6F4] p-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#E31B2B] text-sm font-bold text-white">
                  A
                </span>
                <div>
                  <h4 className="text-[15px] font-bold text-[#16181C]">Andrea Prando</h4>
                  <div className="flex items-center gap-1.5 text-xs text-[#5B616B]">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
                      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.54-5.17 3.54-8.97Z" />
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14A11.99 11.99 0 0 0 12 24Z" />
                      <path fill="#FBBC05" d="M5.28 14.24a7.18 7.18 0 0 1 0-4.48V6.62H1.29a12 12 0 0 0 0 10.76l3.99-3.14Z" />
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A11.99 11.99 0 0 0 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z" />
                    </svg>
                    <span>Google mnenje o odkupu motorja</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[#fbbc04]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
                <span className="ml-1.5 text-xs font-bold text-[#16181C]">5/5</span>
              </div>
            </div>
            <p className="mt-3.5 text-[15px] italic leading-6 text-[#16181C]">
              &quot;Ho venduto la mia moto in Italia, puntuale e preciso, pagamento immediato, nessuna problematica.&quot;
            </p>
            <p className="mt-1 text-xs text-[#5B616B]">
              (Prodal sem svoj motor – točen in zanesljiv dogovor, takojšnje plačilo, brez kakršnihkoli težav.)
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/kontakt?vrsta=PURCHASE&model=Odkup%20motorja"
              className="btn btn-primary"
            >
              <span>Ponudi motor v odkup</span>
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* 3. SEKCIJA: MENJAVA MOTORJEV */}
        <section
          id="menjava"
          className="mt-12 scroll-mt-28 rounded-[16px] border border-[#E2E5E9] bg-white p-6 shadow-sm sm:p-10"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-block rounded-full border border-[#E31B2B]/30 bg-[#E31B2B]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#E31B2B]">
                Staro za drugo
              </span>
              <h2 className="display mt-3 text-3xl text-[#16181C] sm:text-4xl">
                MENJAVA MOTORJEV
              </h2>
            </div>
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[#E2E5E9] bg-[#F6F6F4] text-[#E31B2B]">
              <RefreshCw aria-hidden className="h-6 w-6" />
            </span>
          </div>

          <p className="mt-4 max-w-3xl text-[16px] leading-7 text-[#5B616B]">
            Imaš motor in si zaželel nekaj drugega? Pri nas lahko svoje obstoječe motorno kolo zamenjaš za nov motor
            ali za katerikoli drug rabljen motor iz naše zaloge. Vrednost tvojega motorja preprosto vračunamo v kupnino.
          </p>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-[14px] border border-[#E2E5E9] bg-[#F6F6F4] p-6">
              <h3 className="display text-2xl text-[#16181C]">Prednosti menjave pri EL-MOTO</h3>
              <ul className="mt-4 space-y-3 text-[15px] leading-6 text-[#5B616B]">
                {exchangeAdvantages.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <CheckCircle2 aria-hidden className="mt-1 h-4 w-4 shrink-0 text-[#E31B2B]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col justify-between rounded-[14px] border border-[#E2E5E9] bg-[#F6F6F4] p-6">
              <div>
                <h3 className="display text-2xl text-[#16181C]">Kako poteka menjava?</h3>
                <ol className="mt-4 space-y-3 text-[15px] leading-6 text-[#5B616B]">
                  <li className="flex items-start gap-2.5">
                    <span className="font-bold text-[#16181C]">1.</span>
                    <span>Izberi želeni motor iz naše aktualne ponudbe.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="font-bold text-[#16181C]">2.</span>
                    <span>Ocenimo stanje in vrednost tvojega trenutnega motornega kolesa.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="font-bold text-[#16181C]">3.</span>
                    <span>Uskladimo morebitno razliko v ceni (gotovina ali obročno financiranje).</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="font-bold text-[#16181C]">4.</span>
                    <span>Uredimo prepis in se odpelješ z novim motorjem!</span>
                  </li>
                </ol>
              </div>

              <div className="mt-6 flex flex-wrap gap-2.5">
                <Link href="/motorji" className="btn btn-secondary">
                  Oglej si motorje na zalogi
                </Link>
                <Link href="/garancija-financiranje" className="btn btn-secondary">
                  Možnosti financiranja
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/kontakt?vrsta=PURCHASE&model=Menjava%20motorja"
              className="btn btn-primary"
            >
              <span>Povprašaj za menjavo motorja</span>
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* KONTAKTNI BLOK */}
        <div className="mt-12 rounded-[16px] border border-[#E2E5E9] bg-white p-6 shadow-sm sm:p-10">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="kicker">Stopi v stik</p>
              <h2 className="display mt-2 text-3xl text-[#16181C] sm:text-4xl">
                IMAŠ VPRAŠANJE GLEDE PRODAJE ALI MENJAVE?
              </h2>
              <p className="mt-2 max-w-xl text-base text-[#5B616B]">
                Piši nam ali se oglasi v našem salonu v Trzinu. Z veseljem ti svetujemo in pripravimo pošteno ponudbo.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/kontakt" className="btn btn-primary justify-center">
                <span>Kontaktni obrazec</span>
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
              <a
                href={mapsDirectionsUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary justify-center"
              >
                <MapPin aria-hidden className="h-4 w-4 text-[#E31B2B]" />
                <span>Salon Trzin</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
