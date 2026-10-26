import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, ShieldCheck, Wallet } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ExternalLink } from "@/components/external-link";
import { partners } from "@/lib/partners";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Garancija in financiranje | EL-MOTO",
  description:
    "Možnosti financiranja z Leanpay in NLB Leasing&Go ter jamstvo CarGarantie za nova in rabljena motorna kolesa pri EL-MOTO.",
  alternates: { canonical: "/garancija-financiranje" },
};

const leanpayConditions = [
  "Državljanstvo Republike Slovenije in stalno prebivališče v Sloveniji.",
  "Starost ob odobritvi med 18 in 73 let.",
  "Redni mesečni prilivi (zaposlitev, pokojnina ali samostojni podjetnik – s.p.).",
  "Veljaven osebni dokument (osebna izkaznica ali potni list) in davčna številka.",
  "Osebni bančni račun (TRR), odprt pri banki v Sloveniji, ter bančna kartica.",
  "Mobilni telefon za hitro preverjanje in podpis pogodbe brez obiska banke.",
];

const leanpayHighlights = [
  { label: "Znesek financiranja", value: "od 50 € do 12.000 €" },
  { label: "Število obrokov", value: "od 3 do 84 mesečnih obrokov" },
  { label: "Čas odobritve", value: "v nekaj minutah, brez papirjev in obiska banke" },
];

const carGarantiePoints = [
  "Kritje ključnih mehanskih in električnih sklopov motornega kolesa.",
  "Veljavnost jamstva po celotni Evropi.",
  "Možnost sklenitve za rabljena in nova motorna kolesa v ponudbi EL-MOTO.",
  "Brezskrbna vožnja z jasnimi pogoji in hitro obravnavo v primeru okvare.",
];

export default function GarancijaFinanciranjePage() {
  return (
    <div className="bg-white py-10 text-[#171a1f] md:py-14">
      <div className="wrap">
        <Breadcrumbs items={[{ label: "Garancija & financiranje" }]} />
        <p className="kicker mt-4 uppercase tracking-[0.12em]">Brezskrben nakup pri EL-MOTO</p>
        <h1 className="display mt-2 text-4xl sm:text-5xl">Garancija in financiranje</h1>
        <p className="mt-4 max-w-2xl text-[17px] leading-7 text-[#5b616b]">
          Pri EL-MOTO ti omogočamo hitro in prilagodljivo financiranje z <strong>Leanpay</strong> ali{" "}
          <strong>NLB Leasing&amp;Go</strong> ter zanesljivo jamstvo <strong>CarGarantie</strong> za izbrano motorno kolo.
          Klikni na posameznega partnerja za več informacij ali izračun obroka.
        </p>

        {/* Partner clickable cards */}
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
                  {partner.id === "nlb" ? "Odpri kalkulator NLB" : `Poglej ${partner.name}`}
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

        {/* 1. LEANPAY */}
        <section id="leanpay" className="mt-14 scroll-mt-28 rounded-[16px] border border-[#e2e5e9] bg-white p-6 sm:p-8">
          <div className="flex flex-col gap-4 border-b border-[#e2e5e9] pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#ec2336]">
                <Wallet aria-hidden className="h-4 w-4" />
                Obročno odplačevanje brez obiska banke
              </span>
              <h2 className="display mt-2 text-3xl sm:text-4xl">Leanpay – Kdo lahko uporablja in pogoji</h2>
            </div>
            <ExternalLink href="https://www.leanpay.si/" className="inline-flex items-center gap-2 self-start rounded-[10px] border border-[#e2e5e9] bg-[#f7f8f9] px-4 py-3 hover:border-[#171a1f]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/partners/leanpay.svg" alt="Leanpay" width={140} height={38} className="h-8 w-auto object-contain" />
              <ArrowUpRight aria-hidden className="h-4 w-4 text-[#ec2336]" />
            </ExternalLink>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {leanpayHighlights.map((item) => (
              <div key={item.label} className="rounded-[12px] bg-[#f5f6f7] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#5b616b]">{item.label}</p>
                <p className="mt-1 text-lg font-semibold text-[#171a1f]">{item.value}</p>
              </div>
            ))}
          </div>

          <h3 className="mt-8 text-xl font-semibold">Glavni pogoji – kdo lahko uporablja Leanpay?</h3>
          <p className="mt-2 text-[17px] leading-7 text-[#5b616b]">
            Za sklenitev obročnega plačila prek Leanpay mora kupec izpolnjevati naslednje osnovne pogoje:
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {leanpayConditions.map((condition) => (
              <li key={condition} className="flex items-start gap-3 rounded-[10px] border border-[#e2e5e9] bg-[#fafafa] p-3.5 text-[16px] leading-6">
                <CheckCircle2 aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-[#ec2336]" />
                <span>{condition}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap gap-3">
            <ExternalLink href="https://www.leanpay.si/" className="btn btn-primary">
              Preveri svoj limit na Leanpay.si
              <ArrowUpRight aria-hidden className="h-4 w-4" />
            </ExternalLink>
            <Link href="/kontakt?vrsta=PURCHASE&model=Leanpay%20financiranje" className="btn btn-secondary">
              Povprašaj za Leanpay obrok
            </Link>
          </div>
        </section>

        {/* 2. NLB LEASING&GO */}
        <section id="nlb" className="mt-10 scroll-mt-28 rounded-[16px] border border-[#e2e5e9] bg-[#f5f6f7] p-6 sm:p-8">
          <div className="flex flex-col gap-4 border-b border-[#e2e5e9] pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#ec2336]">
                <Wallet aria-hidden className="h-4 w-4" />
                Financiranje in izračun obroka
              </span>
              <h2 className="display mt-2 text-3xl sm:text-4xl">NLB Leasing&amp;Go (NLB Buy&amp;Go)</h2>
            </div>
            <ExternalLink href="https://www.nlbbuygo.si/" className="inline-flex items-center gap-2 self-start rounded-[10px] border border-[#e2e5e9] bg-white px-4 py-3 hover:border-[#171a1f]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/partners/nlb-buy-go.png" alt="NLB Leasing&Go" width={160} height={32} className="h-7 w-auto object-contain" />
              <ArrowUpRight aria-hidden className="h-4 w-4 text-[#ec2336]" />
            </ExternalLink>
          </div>

          <p className="mt-5 max-w-3xl text-[17px] leading-7 text-[#3a414a]">
            Z rešitvijo <strong>NLB Leasing&amp;Go (Buy&amp;Go)</strong> si lahko hitro in preprosto urediš financiranje za izbrani motor.
            Prek uradnega spletnega kalkulatorja NLB si lahko takoj preračunaš informativni mesečni obrok glede na želeno dobo odplačevanja in polog.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <ExternalLink href="https://www.nlbbuygo.si/" className="btn btn-primary">
              Odpri NLB kalkulator obrokov
              <ArrowUpRight aria-hidden className="h-4 w-4" />
            </ExternalLink>
            <Link href="/kontakt?vrsta=PURCHASE&model=NLB%20Leasing%26Go" className="btn btn-secondary">
              Povprašaj za NLB ponudbo
            </Link>
          </div>
        </section>

        {/* 3. CARGARANTIE */}
        <section id="cargarantie" className="mt-10 scroll-mt-28 rounded-[16px] border border-[#e2e5e9] bg-white p-6 sm:p-8">
          <div className="flex flex-col gap-4 border-b border-[#e2e5e9] pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#ec2336]">
                <ShieldCheck aria-hidden className="h-4 w-4" />
                Novi in rabljeni motorji z garancijo
              </span>
              <h2 className="display mt-2 text-3xl sm:text-4xl">CarGarantie jamstvo</h2>
            </div>
            <ExternalLink href="https://www.cargarantie.com/sl/" className="inline-flex items-center gap-2 self-start rounded-[10px] border border-[#e2e5e9] bg-[#f7f8f9] px-4 py-3 hover:border-[#171a1f]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/partners/cargarantie.svg" alt="CarGarantie" width={160} height={42} className="h-8 w-auto object-contain" />
              <ArrowUpRight aria-hidden className="h-4 w-4 text-[#ec2336]" />
            </ExternalLink>
          </div>

          <p className="mt-5 max-w-3xl text-[17px] leading-7 text-[#3a414a]">
            V sodelovanju z vodilnim evropskim ponudnikom jamstev <strong>CarGarantie</strong> zagotavljamo varnost in zanesljivost pri nakupu
            rabljenih in novih motornih koles.
          </p>

          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {carGarantiePoints.map((point) => (
              <li key={point} className="flex items-start gap-3 rounded-[10px] border border-[#e2e5e9] bg-[#fafafa] p-3.5 text-[16px] leading-6">
                <CheckCircle2 aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-[#ec2336]" />
                <span>{point}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap gap-3">
            <ExternalLink href="https://www.cargarantie.com/sl/" className="btn btn-primary">
              Uradna stran CarGarantie
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
