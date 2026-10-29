import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CompareActions } from "@/components/compare-button";
import { PhotoFrame } from "@/components/photo";
import { coverOf, rentalBikes } from "@/lib/motorcycles";
import { lowestDailyCents } from "@/lib/rental";
import { displayName, formatCc, formatPrice, lines } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Najem motorjev",
  description: "Najem motorjev pri EL-MOTO v Trzinu, blizu Ljubljane. Pošlji povpraševanje za termin. Rezervacija je potrjena šele po potrditvi podjetja.",
  alternates: { canonical: "/najem" },
};

export default async function RentalPage() {
  const bikes = await rentalBikes();
  return (
    <section className="bg-paper py-8 text-ink sm:py-12">
      <div className="wrap">
        <Breadcrumbs items={[{ href: "/", label: "Domov" }, { label: "Najem" }]} />
        <p className="kicker mt-4 uppercase tracking-[0.12em]">Preizkus motorjev KOVE in najem</p>
        <h1 className="display mt-2 text-5xl sm:text-7xl">Najem motorjev — svoboda brez meja</h1>
        <p className="mt-4 max-w-3xl text-lg leading-7">
          Te zanimajo motorji <strong>KOVE</strong>, vendar nisi prepričan, kateri model ti bolj ustreza, ali bi ga rad pred nakupom najprej preizkusil? Z možnostjo najema lahko motor spoznaš v praksi in preveriš, ali je prava izbira zate. Motor lahko najameš tudi zgolj za užitek in izkoristek prostega časa brez nakupa.
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/70">
          Izberi motor, določi termin in pošlji povpraševanje. Oddaja obrazca ni samodejna rezervacija in ne vključuje spletnega plačila.
        </p>
        {bikes.length ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {bikes.map((bike) => {
              const daily = lowestDailyCents(bike.rentalRates);
              const equipment = lines(bike.equipment).slice(0, 4);
              return (
                <article key={bike.id} className="moto-card flex h-full flex-col rounded-[14px] border border-[#E2E5E9] bg-white text-[#16181C] shadow-2xs">
                  <PhotoFrame src={coverOf(bike)?.url} alt={displayName(bike)} sizes="(min-width: 1024px) 30vw, 100vw" />
                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="display text-3xl text-[#16181C]">{displayName(bike)}</h2>
                    <p className="mt-2 text-sm text-[#5B616B]">{[bike.year, formatCc(bike.engineCc), bike.category].filter(Boolean).join(" · ")}</p>
                    {bike.description ? <p className="mt-3 line-clamp-4 leading-7 text-[#5B616B]">{bike.description}</p> : null}
                    {equipment.length ? (
                      <ul className="mt-3 list-disc pl-5 text-sm leading-6 text-[#5B616B]">
                        {equipment.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : null}
                    <p className="display mt-4 text-2xl text-[#16181C]">{daily ? `od ${formatPrice(daily, true)} / dan` : "Cena na povpraševanje"}</p>
                    <p className="text-sm text-[#5B616B]">Na voljo za povpraševanje</p>
                    <Link className="btn btn-primary mt-4 w-full" href={`/najem/${bike.slug}`}>
                      Preveri termin
                    </Link>
                    <div className="mt-2">
                      <CompareActions id={bike.id} />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-8 rounded-[14px] border border-[#E2E5E9] bg-white p-6 shadow-2xs text-[#16181C]">
            <h2 className="display text-4xl text-[#16181C]">Najem trenutno ni objavljen</h2>
            <p className="mt-3 leading-7 text-[#5B616B]">Ko bo motor označen za najem, se bo prikazal tukaj. Za več informacij nas lahko pokličeš ali nam pišeš.</p>
            <Link className="btn btn-primary mt-5" href="/kontakt">Kontakt</Link>
          </div>
        )}
      </div>
    </section>
  );
}
