import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ExternalLink } from "@/components/external-link";
import { partners } from "@/lib/partners";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Garancija in financiranje | EL-MOTO d.o.o.",
  description:
    "Fleksibilno financiranje Leanpay, NLB Buy&Go in NLB Lease&Go (do 15.000 EUR in do 84 obrokov) ter podaljšano jamstvo Bike PROTECTION by CarGarantie za nova in rabljena motorna kolesa pri EL-MOTO.",
  alternates: { canonical: "/garancija-financiranje" },
};

const leanpayBadges = [
  "Brez skritih stroškov",
  "Popolnoma digitalno",
  "Brez papirologije",
  "Brez kreditne kartice",
  "Brez obiska banke",
];

const leanpayFirstPurchaseSteps = [
  {
    step: "1. Priprava dokumentov",
    text: "Poskrbi, da imaš pri sebi veljaven osebni dokument, kot sta osebna izkaznica ali potni list.",
  },
  {
    step: "2. Uporaba mobilne naprave",
    text: "Za registracijo in prvi nakup potrebuješ le pametni telefon s telefonsko številko, ki je izključno tvoja.",
  },
  {
    step: "3. Vnos podatkov",
    text: "Med registracijo vnesi pravilne osebne in finančne podatke. Leanpay bo izvedel postopke obdelave in nadzora podatkov.",
  },
];

const leanpayConditions = [
  "Biti moraš državljan Republike Slovenije, star med 18 in 73 let.",
  "Biti moraš zaposlen za polni ali polovični delovni čas, samostojni podjetnik z rednimi mesečnimi prejemki vsaj 710 EUR ali upokojenec z rednimi mesečnimi prejemki vsaj 570 EUR.",
];

const nlbRequirements = [
  "Veljavni osebni dokument",
  "Davčno številko",
  "Bančno kartico",
  "Mobilni telefon",
  "Dodatno dokumentacijo (v določenih primerih — preveri na nlbbuygo.si)",
];

const nlbAdvantages = [
  "Za stranke vseh bank — odobritev takoj",
  "Znesek nakupa do 15.000 € razdeliš na do 84 enakovrednih obrokov",
  "Načrt odplačevanja po tvoji meri (sam izbereš višino mesečnega obroka in število obrokov)",
  "Prvi obrok plačaš naslednji mesec, mesečno odplačuješ vedno enak znesek",
];

const carGarantieKeyFeatures = [
  {
    title: "Kritje stroškov (delo in material)",
    text: "Krije stroške popravil – tako delo kot material – za večino ključnih komponent vozila, kot so motor, menjalnik, krmiljenje, zavore, elektrika itd.",
  },
  {
    title: "Popravila z originalnimi deli",
    text: "Za razliko od nekaterih drugih ponudnikov komercialnih garancij se popravila običajno izvajajo na pooblaščenih servisih z uporabo originalnih nadomestnih delov.",
  },
  {
    title: "Veljavnost po celotni Evropi",
    text: "Če se ti vozilo pokvari v tujini, jamstvo še vedno velja. Zahtevek lahko uveljavljaš na uradnem servisu kjer koli v EU.",
  },
  {
    title: "Prenosljivost ob prodaji",
    text: "Ob morebitni prodaji vozila pred iztekom jamstva se jamstvo prenese na novega lastnika, kar zvišuje tržno vrednost rabljenega motornega kolesa.",
  },
];

const carGarantieBenefits = [
  "Obsežna zaščita pred stroški popravil",
  "Zagotovitev plačila za popravilo (brez predhodnih finančnih vložkov)",
  "Veljavnost po vsej Evropi",
  "Velika stopnja varnosti pri načrtovanju",
  "Ohranjanje in dvig vrednosti tvojega motornega kolesa",
  "Možnost podaljšanja za 6 ali 12 mesecev (do 10 let od prve registracije ali do 80.000 km)",
];

export default function GarancijaFinanciranjePage() {
  return (
    <div className="bg-[#111216] py-10 text-[#F5F5F5] md:py-14">
      <div className="wrap">
        <Breadcrumbs items={[{ href: "/", label: "Domov" }, { label: "Garancija & financiranje" }]} />
        <p className="kicker mt-4">Brezskrben nakup pri EL-MOTO</p>
        <h1 className="display mt-2.5 text-4xl text-white sm:text-6xl">GARANCIJA IN FINANCIRANJE</h1>
        <p className="mt-4 max-w-2xl text-[17px] leading-7 text-[#B9BDC5]">
          Za še več brezskrbnosti so pri EL-MOTO na voljo različne možnosti financiranja (<strong className="text-white">Leanpay</strong>,{" "}
          <strong className="text-white">NLB Buy&amp;Go</strong> in <strong className="text-white">NLB Lease&amp;Go</strong>) ter specializirano podaljšano jamstvo{" "}
          <strong className="text-white">Bike PROTECTION by CarGarantie</strong> za nova in rabljena motorna kolesa.
        </p>

        {/* Klikabilne kartice partnerjev */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {partners.map((partner) => {
            const isExternal = partner.href.startsWith("http");
            const inner = (
              <>
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#E31B2B]">{partner.role}</span>
                <div className="mt-4 flex h-14 w-full items-center justify-center rounded-xl bg-white px-4 py-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    width={partner.width}
                    height={partner.height}
                    className="max-h-9 w-auto object-contain transition-transform group-hover:scale-105"
                  />
                </div>
                <h2 className="display mt-4 text-2xl text-white">{partner.name}</h2>
                <p className="mt-2 text-sm leading-6 text-[#B9BDC5]">{partner.text}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#E31B2B]">
                  Poglej {partner.name}
                  <ArrowUpRight aria-hidden className="h-4 w-4" />
                </span>
              </>
            );
            return isExternal ? (
              <ExternalLink
                key={partner.id}
                href={partner.href}
                className="group flex flex-col items-center rounded-[14px] border border-white/10 bg-[#25272D] px-5 py-6 text-center transition hover:-translate-y-1 hover:border-[#E31B2B]"
              >
                {inner}
              </ExternalLink>
            ) : (
              <a
                key={partner.id}
                href={partner.href}
                className="group flex flex-col items-center rounded-[14px] border border-white/10 bg-[#25272D] px-5 py-6 text-center transition hover:-translate-y-1 hover:border-[#E31B2B]"
              >
                {inner}
              </a>
            );
          })}
        </div>

        {/* 1. LEANPAY */}
        <section
          id="leanpay"
          className="mt-12 scroll-mt-28 overflow-hidden rounded-[16px] border border-white/10 bg-[#1B1D22] p-6 text-[#F5F5F5] sm:p-10"
        >
          <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-block rounded-full border border-[#E31B2B]/40 bg-[#E31B2B]/15 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#F5F5F5]">
                Enostavna plačila na obroke · Avto-Moto
              </span>
              <h2 className="display mt-3 text-3xl text-white sm:text-4xl">
                Leanpay – Najenostavnejši način plačevanja na obroke!
              </h2>
              <p className="mt-2 max-w-2xl text-[16px] leading-6 text-[#B9BDC5]">
                Vse urediš na mobilnem telefonu, brez obiska banke in odvečne papirologije. Preveri več na uradni strani{" "}
                <ExternalLink href="https://www.leanpay.si/avto-moto/" className="font-semibold text-white underline decoration-[#E31B2B]">
                  leanpay.si/avto-moto
                </ExternalLink>
                .
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 self-start">
              <ExternalLink
                href="https://www.leanpay.si/avto-moto/"
                className="inline-flex shrink-0 items-center gap-2 rounded-[12px] bg-white px-4 py-3 shadow-sm transition hover:opacity-90"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/partners/leanpay_logo2.png" alt="Leanpay" width={150} height={38} className="h-8 w-auto object-contain" />
                <ArrowUpRight aria-hidden className="h-4 w-4 text-[#5b2d90]" />
              </ExternalLink>
              <ExternalLink
                href="https://www.leanpay.si/avto-moto/"
                className="inline-flex shrink-0 items-center overflow-hidden rounded-[12px] shadow-sm transition hover:opacity-90"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/partners/Leanpay-logo.png" alt="Leanpay Avto-Moto" width={120} height={51} className="h-12 w-auto object-contain" />
              </ExternalLink>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {leanpayBadges.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-[#25272D] px-3.5 py-1.5 text-xs font-bold text-[#F5F5F5]"
              >
                <CheckCircle2 aria-hidden className="h-3.5 w-3.5 text-[#E31B2B]" />
                {badge}
              </span>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-[14px] border border-white/10 bg-[#25272D] p-6">
              <h3 className="display text-2xl text-white">Kakšni so pogoji za nakup na obroke?</h3>
              <ul className="mt-4 space-y-3 text-[15px] leading-6 text-[#B9BDC5]">
                {leanpayConditions.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <CheckCircle2 aria-hidden className="mt-1 h-4 w-4 shrink-0 text-[#E31B2B]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[14px] leading-6 text-[#B9BDC5]">
                Ko v postopku prijave prejmeš ponudbo izbrane trgovine, lahko preveriš mesečni znesek obroka in število obrokov ter izbereš po svojih željah.
              </p>
            </div>

            <div className="rounded-[14px] border border-white/10 bg-[#25272D] p-6">
              <h3 className="display text-2xl text-white">Kako poteka prvi nakup prek Leanpaya?</h3>
              <p className="mt-2 text-[14px] text-[#B9BDC5]">Prvi nakup prek Leanpaya poteka v nekaj preprostih korakih:</p>
              <ol className="mt-4 space-y-3 text-[15px] leading-6 text-[#B9BDC5]">
                {leanpayFirstPurchaseSteps.map((item) => (
                  <li key={item.step}>
                    <strong className="font-bold text-white">{item.step}:</strong> {item.text}
                  </li>
                ))}
              </ol>
              <p className="mt-4 rounded-[10px] border border-white/10 bg-[#1B1D22] p-3 text-xs leading-5 text-[#B9BDC5]">
                <strong className="text-white">Opomba:</strong> Verifikacija poteka digitalno, vendar si Leanpay pridržuje pravico do zahtevanja dodatnih dokumentov ali informacij. Identifikacijski dokument mora biti v trenutku postopka veljaven.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-[14px] border border-white/10 bg-[#25272D] p-6">
            <h3 className="display text-2xl text-white">Kakšni so stroški?</h3>
            <p className="mt-2 text-[15px] leading-6 text-[#B9BDC5]">
              Leanpay se zavzema za preglednost in omogoča enostaven dostop do vseh informacij o transakciji, vključno s stroški, obrestmi, datumi zapadlosti in več. Te podatke lahko preveri vsak potencialni uporabnik v razdelku &quot;Standardne predhodne informacije&quot; na prvem zaslonu postopka prijave. Leanpay uporablja letno obrestno mero in stroške ocene tveganja, ki so natančno opredeljeni v ceniku Leanpay.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <ExternalLink href="https://www.leanpay.si/avto-moto/" className="btn btn-primary">
              <span>Leanpay Avto-Moto – preveri svoj limit</span>
              <ArrowUpRight aria-hidden className="h-4 w-4" />
            </ExternalLink>
            <Link href="/kontakt?vrsta=PURCHASE&model=Leanpay%20financiranje" className="btn btn-secondary">
              Povprašaj za Leanpay pri EL-MOTO
            </Link>
          </div>
        </section>

        {/* 2. NLB BUY&GO IN NLB LEASE&GO */}
        <section
          id="nlb"
          className="mt-10 scroll-mt-28 rounded-[16px] border border-white/10 bg-[#1B1D22] p-6 text-[#F5F5F5] sm:p-10"
        >
          <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-block rounded-full border border-[#E31B2B]/40 bg-[#E31B2B]/15 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white">
                NLB Buy&amp;Go &amp; NLB Lease&amp;Go · Do 15.000 € · Do 84 obrokov · Za stranke vseh bank
              </span>
              <h2 className="display mt-3 text-3xl text-white sm:text-4xl">
                NLB Buy&amp;Go in NLB Lease&amp;Go – Financiranje po tvoji meri
              </h2>
            </div>
            <ExternalLink
              href="https://www.nlbbuygo.si/"
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-[12px] bg-white px-4 py-3 shadow-sm transition hover:opacity-90"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/partners/nlb-buy-go.png" alt="NLB Buy&Go" width={160} height={32} className="h-7 w-auto object-contain" />
              <ArrowUpRight aria-hidden className="h-4 w-4 text-[#002f6c]" />
            </ExternalLink>
          </div>

          <p className="mt-5 max-w-3xl text-[16px] leading-7 text-[#B9BDC5]">
            <strong className="text-white">NLB Buy&amp;Go</strong> je hitro obročno financiranje na prodajnem mestu, ki ti omogoča, da nakup v vrednosti <strong className="text-white">do 15.000 evrov</strong> razdeliš na <strong className="text-white">do 84 enakovrednih obrokov</strong>. Poleg tega nudimo tudi finančni lizing <strong className="text-white">NLB Lease&amp;Go</strong> za fizične in pravne osebe.
          </p>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-[14px] border border-white/10 bg-[#25272D] p-6">
              <h3 className="display text-2xl text-white">Prednosti NLB Buy&amp;Go in NLB Lease&amp;Go</h3>
              <ul className="mt-4 space-y-3 text-[15px] leading-6 text-[#B9BDC5]">
                {nlbAdvantages.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <CheckCircle2 aria-hidden className="mt-1 h-4 w-4 shrink-0 text-[#E31B2B]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[14px] border border-white/10 bg-[#25272D] p-6">
              <h3 className="display text-2xl text-white">Kaj potrebujem za sklenitev financiranja?</h3>
              <ul className="mt-4 space-y-3 text-[15px] leading-6 text-[#B9BDC5]">
                {nlbRequirements.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <CheckCircle2 aria-hidden className="mt-1 h-4 w-4 shrink-0 text-[#E31B2B]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <ExternalLink href="https://www.nlbbuygo.si/" className="btn btn-primary">
              <span>Odpri NLB Buy&amp;Go (nlbbuygo.si)</span>
              <ArrowUpRight aria-hidden className="h-4 w-4" />
            </ExternalLink>
            <ExternalLink href="https://www.nlbleasego.si/fizicne-osebe" className="btn btn-secondary">
              <span>NLB Lease&amp;Go za fizične osebe</span>
              <ArrowUpRight aria-hidden className="h-4 w-4" />
            </ExternalLink>
            <Link href="/kontakt?vrsta=PURCHASE&model=NLB%20financiranje" className="btn btn-secondary">
              Povprašaj za NLB ponudbo pri EL-MOTO
            </Link>
          </div>
        </section>

        {/* 3. BIKE PROTECTION BY CARGARANTIE */}
        <section
          id="cargarantie"
          className="mt-10 scroll-mt-28 rounded-[16px] border border-white/10 bg-[#1B1D22] p-6 text-[#F5F5F5] sm:p-10"
        >
          <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-block rounded-full border border-[#E31B2B]/40 bg-[#E31B2B]/15 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white">
                Bike PROTECTION by CarGarantie
              </span>
              <h2 className="display mt-3 text-3xl text-white sm:text-4xl">
                Bike PROTECTION by CarGarantie – Specializirano jamstvo za nova in rabljena motorna kolesa
              </h2>
            </div>
            <ExternalLink
              href="https://www.cargarantie.com/si/lastnik-vozila/katera-jamstva-so-na-voljo/"
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-[12px] bg-white px-4 py-3 transition hover:opacity-90"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/partners/cargarantie.png" alt="CarGarantie" width={180} height={90} className="h-11 w-auto object-contain" />
              <ArrowUpRight aria-hidden className="h-4 w-4 text-[#e30613]" />
            </ExternalLink>
          </div>

          <div className="mt-6 space-y-4 text-[16px] leading-7 text-[#B9BDC5]">
            <p>
              <strong className="text-white">Bike PROTECTION by CarGarantie</strong> je specializirano jamstvo za nova in rabljena motorna kolesa, ki ščiti lastnike pred nepričakovanimi stroški popravil po izteku tovarniške garancije.
            </p>
            <p>
              <strong className="text-white">CarGarantie</strong> je ena vodilnih specializiranih zavarovalnic v Evropi, ki ponuja podaljšana jamstva in garancije za nova ter rabljena vozila. Deluje kot zanesljiv partner za več kot 40 proizvajalcev vozil in okoli 23.000 avto-moto prodajalcev po Evropi.
            </p>
          </div>

          <h3 className="display mt-8 text-2xl text-white">Ključne značilnosti jamstva CarGarantie</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {carGarantieKeyFeatures.map((feature) => (
              <div key={feature.title} className="rounded-[14px] border border-white/10 bg-[#25272D] p-5">
                <h4 className="flex items-center gap-2 text-base font-bold text-white">
                  <CheckCircle2 aria-hidden className="h-5 w-5 shrink-0 text-[#E31B2B]" />
                  <span>{feature.title}</span>
                </h4>
                <p className="mt-2 text-[15px] leading-6 text-[#B9BDC5]">{feature.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-[14px] border border-white/10 bg-[#25272D] p-6">
              <h3 className="display text-2xl text-white">
                Jamstvo za voznike rabljenih motornih koles – Varni med vožnjo
              </h3>
              <p className="mt-3 text-[15px] leading-6 text-[#B9BDC5]">
                Tvoje motorno kolo je bilo temeljito pregledano in strokovno pripravljeno. S sklenitvijo paketa <strong className="text-white">Bike PROTECTION by CarGarantie</strong> boš najmanj 6 oz. 12 mesecev zaščiten pred tem, da bi te morebitni stroški popravil prehudo udarili po žepu. Jamstvo je popolno, kar pomeni, da velja skoraj za vse sestavne dele in za večkratno škodo, razen za obrabne dele (zavorne obloge, gume, žarnice). Možnost podaljšanja velja za 6 ali 12 mesecev do največ 10 let od datuma prve registracije ali do 80.000 prevoženih km.
              </p>
            </div>

            <div className="rounded-[14px] border border-white/10 bg-[#25272D] p-6">
              <h3 className="display text-2xl text-white">
                Podaljšano jamstvo pri nakupu novega motornega kolesa – Svoboda na dveh kolesih
              </h3>
              <p className="mt-3 text-[15px] leading-6 text-[#B9BDC5]">
                Želimo, da bi se tvoj utrip pospešil samo med vožnjo in ne ob prejemu računa za nepredvidena popravila. S paketom <strong className="text-white">Bike PROTECTION by CarGarantie</strong> se lahko na terenu in cesti popolnoma prepustiš ritmu motorja — jamstvo bo 12 do 24 mesecev po preteku tovarniške veljavnosti krilo nepredvidene stroške popravil novega motornega kolesa.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-[14px] border border-white/10 bg-[#25272D] p-6">
            <h4 className="display text-xl text-white">Ugodne storitve, ki se splačajo:</h4>
            <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {carGarantieBenefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2.5 text-[15px] leading-6 text-[#B9BDC5]">
                  <CheckCircle2 aria-hidden className="mt-1 h-4 w-4 shrink-0 text-[#E31B2B]" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <ExternalLink
              href="https://www.cargarantie.com/si/lastnik-vozila/katera-jamstva-so-na-voljo/"
              className="btn btn-primary"
            >
              <span>Uradna stran CarGarantie Slovenija</span>
              <ArrowUpRight aria-hidden className="h-4 w-4" />
            </ExternalLink>
            <a href={`tel:${site.phoneTel}`} className="btn btn-secondary">
              Pokliči {site.phoneDisplay}
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
