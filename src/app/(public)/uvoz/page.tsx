import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Uvoz motorjev po naročilu | EL-MOTO d.o.o.",
  description:
    "Preverjen uvoz motornih koles po naročilu pri EL-MOTO d.o.o. Pomagamo pri izbiri, strokovnem pregledu in uvozu želenega motorja.",
  alternates: { canonical: "/uvoz" },
};

const importSteps = [
  {
    step: "01",
    title: "Izbira in posvet",
    text: "Povej nam svoje želje glede modela, letnika, opreme in proračuna. Skupaj poiščemo najboljše razpoložljive primerke na evropskem trgu.",
  },
  {
    step: "02",
    title: "Pregled in preverjanje",
    text: "Preverimo zgodovino servisiranja, prevožene kilometre in pravno stanje vozila. Pred prevzemom poskrbimo za natančen strokovni pregled.",
  },
  {
    step: "03",
    title: "Transport in homologacija",
    text: "Uredimo varen prevoz v Slovenijo, vso carinsko in davčno dokumentacijo (DMV), homologacijo ter pripravo vozila na registracijo.",
  },
];

export default function UvozPage() {
  return (
    <div className="bg-[#F6F6F4] py-10 text-[#16181C] md:py-14">
      <div className="wrap">
        <Breadcrumbs items={[{ label: "Domov", href: "/" }, { label: "Uvoz" }]} />
        <p className="kicker mt-4">Storitve EL-MOTO <span className="lowercase font-sans text-xs font-semibold">d.o.o.</span></p>
        <h1 className="display mt-2.5 text-4xl text-[#16181C] sm:text-6xl">
          UVOZ MOTORJEV PO NAROČILU
        </h1>
        <p className="mt-4 max-w-2xl text-[17px] leading-7 text-[#5B616B]">
          Iščeš točno določen model motornega kolesa, ki ga trenutno ni na slovenskem trgu? Pri{" "}
          <strong className="text-[#16181C]">EL-MOTO d.o.o.</strong> ti pomagamo poiskati, preveriti in uvoziti preverjen
          motor po tvojih merah – transparentno, varno in brez skritih stroškov.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {importSteps.map((s) => (
            <div
              key={s.step}
              className="flex flex-col justify-between rounded-[14px] border border-[#E2E5E9] bg-white p-6 shadow-2xs text-[#16181C]"
            >
              <div>
                <span className="display text-3xl font-bold text-[#E31B2B] sm:text-4xl">{s.step}</span>
                <h2 className="display mt-2 text-2xl text-[#16181C]">{s.title}</h2>
                <p className="mt-2.5 text-[15px] leading-6 text-[#5B616B]">{s.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Povezava na komisijsko prodajo */}
        <div className="mt-8 rounded-[14px] border border-[#E2E5E9] bg-white p-6 shadow-2xs sm:p-8 text-[#16181C]">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#E31B2B]">
                Želiš prodati ali zamenjati svoj motor?
              </p>
              <h3 className="display mt-1 text-2xl text-[#16181C] sm:text-3xl">
                KOMISIJSKA PRODAJA, ODKUP IN MENJAVA
              </h3>
              <p className="mt-2 max-w-xl text-[15px] text-[#5B616B]">
                Svoj trenutni motor lahko oddaš v komisijsko prodajo, ga ponudiš v neposredni odkup ali zamenjaš za
                drugega iz naše zaloge.
              </p>
            </div>
            <Link href="/komisijska-prodaja" className="btn btn-secondary self-start md:self-auto">
              <span>Več o komisijski prodaji</span>
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/kontakt?vrsta=PURCHASE&model=Uvoz%20po%20naro%C4%8Dilu" className="btn btn-primary">
            <span>Pošlji povpraševanje za uvoz</span>
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
          <a href={`tel:${site.phoneTel}`} className="btn btn-secondary">
            Pokliči {site.phoneDisplay}
          </a>
        </div>
      </div>
    </div>
  );
}
