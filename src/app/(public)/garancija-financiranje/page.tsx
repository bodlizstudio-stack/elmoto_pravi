import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ExternalLink } from "@/components/external-link";
import { partners } from "@/lib/partners";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Garancija in financiranje | EL-MOTO",
  description:
    "Fleksibilno financiranje Leanpay in NLB Buy&Go (do 15.000 EUR in do 84 obrokov) ter podaljšano jamstvo Bike PROTECTION by CarGarantie za nova in rabljena motorna kolesa pri EL-MOTO.",
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
  "Biti moraš državljan Republike Slovenije star med 18 in 73 let.",
  "Biti moraš zaposlen za polni ali polovični delovni čas ali samostojni podjetnik z rednimi mesečnimi prejemki minimalno 710 EUR. Ali pa upokojenec z rednimi mesečnimi prejemki minimalno 570 EUR.",
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
  "Znesek nakupa do 15.000 € razdelite na do 84 enakovrednih obrokov",
  "Načrt odplačevanja po svoji meri (sami izberete višino mesečnega obroka in število obrokov)",
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
    text: "Če se vam vozilo pokvari v tujini, jamstvo še vedno velja. Zahtevek lahko uveljavljate na uradnem servisu kjer koli v EU.",
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
  "Ohranjanje in dvig vrednosti vašega motornega kolesa",
  "Možnost podaljšanja za 6 ali 12 mesecev (do 10 let od prve registracije ali do 80.000 km)",
];

export default function GarancijaFinanciranjePage() {
  return (
    <div className="bg-white py-10 text-[#171a1f] md:py-14">
      <div className="wrap">
        <Breadcrumbs items={[{ label: "Garancija & financiranje" }]} />
        <p className="kicker mt-4 uppercase tracking-[0.12em]">Brezskrben nakup pri EL-MOTO</p>
        <h1 className="display mt-2 text-4xl sm:text-5xl">Garancija in financiranje</h1>
        <p className="mt-4 max-w-2xl text-[17px] leading-7 text-[#5b616b]">
          Za še več brezskrbnosti so pri EL-MOTO na voljo različne možnosti financiranja (<strong>Leanpay</strong> in{" "}
          <strong>NLB Buy&amp;Go</strong> / <strong>NLB Lease&amp;Go</strong>) ter specializirano podaljšano jamstvo{" "}
          <strong>Bike PROTECTION by CarGarantie</strong> za nova in rabljena motorna kolesa.
        </p>

        {/* Klikabilne kartice partnerjev */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {partners.map((partner) => {
            const isExternal = partner.href.startsWith("http");
            const inner = (
              <>
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5b616b]">{partner.role}</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={partner.logo}
                  alt={partner.name}
                  width={partner.width}
                  height={partner.height}
                  className="partner-logo mt-4 transition-transform group-hover:scale-105"
                />
                <p className="mt-4 text-[16px] leading-6 text-[#5b616b]">{partner.text}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#ec2336]">
                  Poglej {partner.name}
                  <ArrowUpRight aria-hidden className="h-4 w-4" />
                </span>
              </>
            );
            return isExternal ? (
              <ExternalLink
                key={partner.id}
                href={partner.href}
                className="group flex flex-col items-center rounded-[14px] border border-[#e2e5e9] bg-[#f7f8f9] px-6 py-8 text-center transition hover:border-[#171a1f] hover:bg-white hover:shadow-md"
              >
                {inner}
              </ExternalLink>
            ) : (
              <a
                key={partner.id}
                href={partner.href}
                className="group flex flex-col items-center rounded-[14px] border border-[#e2e5e9] bg-[#f7f8f9] px-6 py-8 text-center transition hover:border-[#171a1f] hover:bg-white hover:shadow-md"
              >
                {inner}
              </a>
            );
          })}
        </div>

        {/* 1. URADNO BESEDILO IN SLOG LEANPAY */}
        <section
          id="leanpay"
          style={{ fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}
          className="mt-14 scroll-mt-28 overflow-hidden rounded-[20px] border border-[#e6e1f4] bg-gradient-to-br from-[#faf8ff] via-white to-[#f2fbfb] p-6 text-[#1e1b2e] shadow-xs sm:p-10"
        >
          <div className="flex flex-col gap-4 border-b border-[#e6e1f4] pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-block rounded-full bg-[#5b2d90]/10 px-3.5 py-1 text-xs font-bold tracking-wide text-[#5b2d90]">
                Enostavna plačila na obroke · Avto-Moto
              </span>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-[#231942] sm:text-3xl">
                Leanpay – Najenostavnejši način plačevanja na obroke!
              </h2>
              <p className="mt-2 max-w-2xl text-[16px] leading-6 text-[#4a4458]">
                Vse urediš na mobilcu, brez obiskov banke in odvečne papirologije. Preveri več na uradni strani{" "}
                <ExternalLink href="https://www.leanpay.si/avto-moto/" className="font-semibold text-[#5b2d90] underline">
                  leanpay.si/avto-moto
                </ExternalLink>.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 self-start">
              <ExternalLink
                href="https://www.leanpay.si/avto-moto/"
                className="inline-flex shrink-0 items-center gap-2 rounded-[12px] border border-[#e6e1f4] bg-white px-4 py-3 shadow-2xs transition hover:border-[#5b2d90]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/partners/leanpay_logo2.png" alt="Leanpay" width={150} height={38} className="h-8 w-auto object-contain" />
                <ArrowUpRight aria-hidden className="h-4 w-4 text-[#5b2d90]" />
              </ExternalLink>
              <ExternalLink
                href="https://www.leanpay.si/avto-moto/"
                className="inline-flex shrink-0 items-center overflow-hidden rounded-[12px] shadow-2xs transition hover:opacity-90"
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
                className="inline-flex items-center gap-1.5 rounded-full border border-[#00a896]/30 bg-[#00a896]/10 px-3.5 py-1.5 text-xs font-bold text-[#007f72]"
              >
                <CheckCircle2 aria-hidden className="h-3.5 w-3.5" />
                {badge}
              </span>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-[16px] border border-[#e6e1f4] bg-white p-6">
              <h3 className="text-lg font-extrabold text-[#231942]">Kakšni so pogoji za nakup na obroke?</h3>
              <ul className="mt-4 space-y-3 text-[15px] leading-6 text-[#352f44]">
                {leanpayConditions.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <CheckCircle2 aria-hidden className="mt-1 h-4 w-4 shrink-0 text-[#5b2d90]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[14px] leading-6 text-[#5c556d]">
                Ko v postopku prijave prejmeš ponudbo izbrane trgovine, lahko preveriš mesečni znesek obroka in število obrokov ter izbereš po svojih željah.
              </p>
            </div>

            <div className="rounded-[16px] border border-[#e6e1f4] bg-white p-6">
              <h3 className="text-lg font-extrabold text-[#231942]">Kako izgleda prvi nakup preko Leanpaya?</h3>
              <p className="mt-2 text-[14px] text-[#5c556d]">Prvi nakup preko Leanpaya poteka v nekaj preprostih korakih:</p>
              <ol className="mt-4 space-y-3 text-[15px] leading-6 text-[#352f44]">
                {leanpayFirstPurchaseSteps.map((item) => (
                  <li key={item.step}>
                    <strong className="font-bold text-[#231942]">{item.step}:</strong> {item.text}
                  </li>
                ))}
              </ol>
              <p className="mt-4 rounded-[10px] bg-[#faf8ff] p-3 text-xs leading-5 text-[#5c556d]">
                <strong>Opomba:</strong> Verifikacija poteka digitalno, vendar si Leanpay pridržuje pravico do zahtevanja dodatnih dokumentov ali informacij. Identifikacijski dokument mora biti v trenutku postopka veljaven.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-[16px] border border-[#e6e1f4] bg-white p-6">
            <h3 className="text-lg font-extrabold text-[#231942]">Kakšni so stroški?</h3>
            <p className="mt-2 text-[15px] leading-6 text-[#352f44]">
              Leanpay se zavzema za preglednost in omogoča enostaven dostop do vseh informacij o transakciji, vključno s stroški, obrestmi, datumi zapadlosti in več. Te podatke lahko preveri vsak potencialni uporabnik v razdelku &quot;Standardne predhodne informacije&quot; na prvem zaslonu postopka prijave. Leanpay uporablja letno obrestno mero in stroške ocene tveganja, ki so natančno opredeljeni v ceniku Leanpay.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <ExternalLink
              href="https://www.leanpay.si/avto-moto/"
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#5b2d90] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#472173]"
            >
              Leanpay Avto-Moto – preveri svoj limit
              <ArrowUpRight aria-hidden className="h-4 w-4" />
            </ExternalLink>
            <Link
              href="/kontakt?vrsta=PURCHASE&model=Leanpay%20financiranje"
              className="inline-flex min-h-12 items-center rounded-full border border-[#5b2d90]/30 bg-white px-6 py-3 text-sm font-bold text-[#5b2d90] transition hover:border-[#5b2d90]"
            >
              Povprašaj za Leanpay pri EL-MOTO
            </Link>
          </div>
        </section>

        {/* 2. NLB BUY&GO IN NLB LEASE&GO */}
        <section
          id="nlb"
          style={{ fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}
          className="mt-10 scroll-mt-28 rounded-[20px] border border-[#d8e1f0] bg-[#f4f7fc] p-6 sm:p-10"
        >
          <div className="flex flex-col gap-4 border-b border-[#d8e1f0] pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-block rounded-full bg-[#002f6c]/10 px-3.5 py-1 text-xs font-bold tracking-wide text-[#002f6c]">
                NLB Buy&amp;Go · Do 15.000 € · Do 84 obrokov · Za stranke vseh bank
              </span>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-[#002f6c] sm:text-3xl">
                NLB Buy&amp;Go in NLB Lease&amp;Go – Financiranje po vaši meri
              </h2>
            </div>
            <ExternalLink
              href="https://www.nlbbuygo.si/"
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-[12px] border border-[#d8e1f0] bg-white px-4 py-3 shadow-2xs transition hover:border-[#002f6c]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/partners/nlb-buy-go.png" alt="NLB Buy&Go" width={160} height={32} className="h-7 w-auto object-contain" />
              <ArrowUpRight aria-hidden className="h-4 w-4 text-[#002f6c]" />
            </ExternalLink>
          </div>

          <p className="mt-5 max-w-3xl text-[16px] leading-7 text-[#25364d]">
            <strong>NLB Buy&amp;Go</strong> je oblika financiranja, ki vam omogoča, da znesek svojega nakupa poravnate v več obrokih. Z NLB Buy&amp;Go lahko svoj nakup v vrednosti <strong>do 15.000 evrov</strong> razdelite na <strong>do 84 enakovrednih obrokov</strong>. Načrt odplačevanja lahko izdelate po svoji meri — to pomeni, da si sami izberete višino mesečnega obroka in število obrokov.
          </p>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-[16px] border border-[#d8e1f0] bg-white p-6">
              <h3 className="text-lg font-extrabold text-[#002f6c]">Prednosti NLB Buy&amp;Go</h3>
              <ul className="mt-4 space-y-3 text-[15px] leading-6 text-[#25364d]">
                {nlbAdvantages.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <CheckCircle2 aria-hidden className="mt-1 h-4 w-4 shrink-0 text-[#002f6c]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[16px] border border-[#d8e1f0] bg-white p-6">
              <h3 className="text-lg font-extrabold text-[#002f6c]">Kaj potrebujem za sklenitev financiranja?</h3>
              <ul className="mt-4 space-y-3 text-[15px] leading-6 text-[#25364d]">
                {nlbRequirements.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <CheckCircle2 aria-hidden className="mt-1 h-4 w-4 shrink-0 text-[#002f6c]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <ExternalLink
              href="https://www.nlbbuygo.si/"
              className="inline-flex min-h-12 items-center gap-2 rounded-[10px] bg-[#002f6c] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#001f47]"
            >
              Odpri NLB Buy&amp;Go (nlbbuygo.si)
              <ArrowUpRight aria-hidden className="h-4 w-4" />
            </ExternalLink>
            <ExternalLink
              href="https://www.nlbleasego.si/fizicne-osebe"
              className="inline-flex min-h-12 items-center gap-2 rounded-[10px] border border-[#002f6c]/30 bg-white px-6 py-3 text-sm font-bold text-[#002f6c] transition hover:border-[#002f6c]"
            >
              NLB Lease&amp;Go za fizične osebe
              <ArrowUpRight aria-hidden className="h-4 w-4" />
            </ExternalLink>
            <Link
              href="/kontakt?vrsta=PURCHASE&model=NLB%20Buy%26Go"
              className="inline-flex min-h-12 items-center rounded-[10px] border border-[#002f6c]/30 bg-white px-6 py-3 text-sm font-bold text-[#002f6c] transition hover:border-[#002f6c]"
            >
              Povprašaj za NLB ponudbo pri EL-MOTO
            </Link>
          </div>
        </section>

        {/* 3. BIKE PROTECTION BY CARGARANTIE */}
        <section
          id="cargarantie"
          style={{ fontFamily: "Arial, 'Helvetica Neue', Helvetica, sans-serif" }}
          className="mt-10 scroll-mt-28 rounded-[20px] border border-[#e2e5e9] bg-white p-6 text-[#22262a] shadow-xs sm:p-10"
        >
          <div className="flex flex-col gap-4 border-b border-[#e2e5e9] pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-block rounded-md bg-[#e30613]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#e30613]">
                Bike PROTECTION by CarGarantie
              </span>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#1a1d20] sm:text-3xl">
                Bike PROTECTION by CarGarantie – Specializirano jamstvo za nova in rabljena motorna kolesa
              </h2>
            </div>
            <ExternalLink
              href="https://www.cargarantie.com/si/lastnik-vozila/katera-jamstva-so-na-voljo/"
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-[10px] border border-[#e2e5e9] bg-[#f8f9fa] px-4 py-3 transition hover:border-[#e30613]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/partners/cargarantie.png" alt="CarGarantie" width={180} height={90} className="h-11 w-auto object-contain" />
              <ArrowUpRight aria-hidden className="h-4 w-4 text-[#e30613]" />
            </ExternalLink>
          </div>

          <div className="mt-6 space-y-4 text-[16px] leading-7 text-[#3b4046]">
            <p>
              <strong>Bike PROTECTION by CarGarantie</strong> je specializirano jamstvo za nova in rabljena motorna kolesa, ki ščiti lastnike pred nepričakovanimi stroški popravil po izteku tovarniške garancije.
            </p>
            <p>
              <strong>CarGarantie</strong> je ena vodilnih specializiranih zavarovalnic v Evropi, ki ponuja podaljšana jamstva in garancije za nova ter rabljena vozila. Deluje kot zanesljiv partner za več kot 40 proizvajalcev vozil in okoli 23.000 avto-moto prodajalcev po Evropi.
            </p>
          </div>

          <h3 className="mt-8 text-xl font-bold text-[#1a1d20]">Ključne značilnosti jamstva CarGarantie</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {carGarantieKeyFeatures.map((feature) => (
              <div key={feature.title} className="rounded-[14px] border border-[#e2e5e9] bg-[#f8f9fa] p-5">
                <h4 className="flex items-center gap-2 text-base font-bold text-[#1a1d20]">
                  <CheckCircle2 aria-hidden className="h-5 w-5 shrink-0 text-[#e30613]" />
                  <span>{feature.title}</span>
                </h4>
                <p className="mt-2 text-[15px] leading-6 text-[#3b4046]">{feature.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-[14px] border border-[#e2e5e9] bg-[#f8f9fa] p-6">
              <h3 className="text-lg font-bold text-[#1a1d20]">
                Jamstvo za voznike rabljenih motornih koles – Varni med vožnjo
              </h3>
              <p className="mt-3 text-[15px] leading-6 text-[#3b4046]">
                Vaše motorno kolo je bilo temeljito pregledano in strokovno pripravljeno. S sklenitvijo paketa <strong>Bike PROTECTION by CarGarantie</strong> boste najmanj 6 oz. 12 mesecev zaščiteni pred tem, da bi vas morebitni stroški popravil prehudo udarili po žepu. Jamstvo je popolno, kar pomeni, da velja skoraj za vse sestavne dele in za večkratno škodo, razen za obrabne dele (zavorne obloge, gume, žarnice). Možnost podaljšanja velja za 6 ali 12 mesecev do največ 10 let od datuma prve registracije ali do 80.000 prevoženih km.
              </p>
            </div>

            <div className="rounded-[14px] border border-[#e2e5e9] bg-[#f8f9fa] p-6">
              <h3 className="text-lg font-bold text-[#1a1d20]">
                Podaljšano jamstvo pri nakupu novega motornega kolesa – Svoboda na dveh kolesih
              </h3>
              <p className="mt-3 text-[15px] leading-6 text-[#3b4046]">
                Želimo, da bi se vaš utrip pospešil samo med vožnjo in ne ob prejemu računa za nepredvidena popravila. S paketom <strong>Bike PROTECTION by CarGarantie</strong> se lahko na terenu in cesti popolnoma prepustite ritmu motorja — jamstvo bo 12 do 24 mesecev po preteku tovarniške veljavnosti krilo nepredvidene stroške popravil novega motornega kolesa.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-[14px] border border-[#e2e5e9] bg-white p-6">
            <h4 className="text-base font-bold text-[#1a1d20]">Ugodne storitve, ki se splačajo:</h4>
            <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {carGarantieBenefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2.5 text-[15px] leading-6 text-[#22262a]">
                  <CheckCircle2 aria-hidden className="mt-1 h-4 w-4 shrink-0 text-[#e30613]" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <ExternalLink
              href="https://www.cargarantie.com/si/lastnik-vozila/katera-jamstva-so-na-voljo/"
              className="inline-flex min-h-12 items-center gap-2 rounded-[8px] bg-[#e30613] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#b8040f]"
            >
              Uradna stran CarGarantie Slovenija
              <ArrowUpRight aria-hidden className="h-4 w-4" />
            </ExternalLink>
            <a
              href={`tel:${site.phoneTel}`}
              className="inline-flex min-h-12 items-center rounded-[8px] border border-[#22262a]/25 bg-white px-6 py-3 text-sm font-bold text-[#22262a] transition hover:border-[#22262a]"
            >
              Pokliči {site.phoneDisplay}
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
