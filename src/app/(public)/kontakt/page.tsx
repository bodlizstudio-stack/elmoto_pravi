import type { Metadata } from "next";
import { Facebook, Instagram, Mail, MapPin, Navigation, Phone, Clock } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ContactForm } from "@/components/contact-form";
import { ExternalLink } from "@/components/external-link";
import { LocationMap } from "@/components/location-map";
import { WhatsAppIcon } from "@/components/site-header";
import { publicChoices } from "@/lib/motorcycles";
import { getSettings } from "@/lib/settings";
import { mapsDirectionsUrl, site } from "@/lib/site";
import { displayName, mailtoHref } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kontakt | EL-MOTO d.o.o.",
  description: "Kontakt EL-MOTO d.o.o. Telefon 070 868 600, info@elmoto.si. Povpraševanje za nakup, uvoz ali najem motorja.",
  alternates: { canonical: "/kontakt" },
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ motor?: string; vrsta?: string; model?: string; kategorija?: string }>;
}) {
  const params = await searchParams;
  const [settings, choices] = await Promise.all([getSettings(), publicChoices()]);
  const selected = choices.find((bike) => bike.id === params.motor);
  const interest = [params.model, params.kategorija].filter(Boolean).join(", ");
  const mailto = mailtoHref(
    settings.email,
    interest ? `Povpraševanje: ${interest}` : "Povpraševanje EL-MOTO",
    interest ? `Zanimanje: ${interest}\n\n` : "",
  );

  return (
    <section className="bg-[#111216] py-10 text-[#F5F5F5] sm:py-14">
      <div className="wrap">
        <Breadcrumbs items={[{ href: "/", label: "Domov" }, { label: "Kontakt" }]} />
        <p className="kicker mt-4">Kontakt in lokacija</p>
        <h1 className="display mt-2.5 text-5xl text-white sm:text-7xl">STOPI V STIK Z NAMI</h1>
        <p className="mt-4 max-w-2xl text-[17px] leading-7 text-[#B9BDC5]">
          Pokliči, piši ali se oglasi po dogovoru v našem salonu v Trzinu. Z veseljem odgovorimo na vsa vprašanja.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(18rem,0.85fr)_minmax(0,1.15fr)]">
          {/* Leva kolona: Podatki podjetja, družbena omrežja in akcijski gumbi brez podvajanja */}
          <div className="grid content-start gap-6 rounded-[14px] border border-white/10 bg-[#25272D] p-6 sm:p-7">
            <div>
              <p className="display text-4xl text-white">{site.brand}</p>
              <div className="mt-4 grid gap-3 text-base text-[#F5F5F5]">
                <p className="flex items-start gap-3">
                  <MapPin aria-hidden className="mt-1 h-5 w-5 shrink-0 text-[#E31B2B]" />
                  <span>
                    {settings.street}
                    <br />
                    {settings.postalCode} {settings.city}, {site.country}
                  </span>
                </p>
                <p className="flex items-center gap-3 text-[#B9BDC5]">
                  <Clock aria-hidden className="h-5 w-5 shrink-0 text-[#E31B2B]" />
                  <span>
                    Delovni čas: <strong className="font-semibold text-white">{settings.hours || "Po dogovoru"}</strong>
                  </span>
                </p>
              </div>
            </div>

            {/* Ikone družbenih omrežij */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#B9BDC5]">Družbena omrežja & klepet</p>
              <div className="mt-3 flex items-center gap-3">
                <ExternalLink
                  href={settings.facebook}
                  aria-label="Facebook EL-MOTO"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-white/15 bg-[#1B1D22] text-white transition-colors hover:border-[#E31B2B] hover:bg-[#E31B2B]"
                >
                  <Facebook aria-hidden className="h-5 w-5" />
                </ExternalLink>
                <ExternalLink
                  href={settings.instagram}
                  aria-label="Instagram @elmoto.si"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-white/15 bg-[#1B1D22] text-white transition-colors hover:border-[#E31B2B] hover:bg-[#E31B2B]"
                >
                  <Instagram aria-hidden className="h-5 w-5" />
                </ExternalLink>
                <ExternalLink
                  href={settings.whatsappUrl}
                  aria-label={`WhatsApp ${settings.phoneDisplay}`}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-white/15 bg-[#1B1D22] text-[#25D366] transition-colors hover:border-[#25D366] hover:bg-[#25D366]/15"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                </ExternalLink>
              </div>
            </div>

            {/* Akcijski gumbi (brez podvojenega tekstovnega izpisa nad njimi) */}
            <div className="grid gap-3 pt-2">
              <a className="btn btn-primary w-full justify-center" href={`tel:${settings.phoneTel}`}>
                <Phone aria-hidden className="h-4 w-4" />
                <span>Pokliči nas ({settings.phoneDisplay})</span>
              </a>
              <a className="btn btn-secondary w-full justify-center" href={`mailto:${settings.email}`}>
                <Mail aria-hidden className="h-4 w-4 text-[#E31B2B]" />
                <span>Pošlji e-pošto ({settings.email})</span>
              </a>
              <a
                className="btn btn-secondary w-full justify-center"
                href={mapsDirectionsUrl}
                target="_blank"
                rel="noreferrer"
              >
                <Navigation aria-hidden className="h-4 w-4 text-[#E31B2B]" />
                <span>Odpri navigacijo</span>
              </a>
            </div>
          </div>

          {/* Desna kolona: Kontaktni obrazec in Zemljevid */}
          <div>
            <div className="rounded-[14px] border border-white/10 bg-[#1B1D22] p-6 sm:p-8">
              <h2 className="display mb-5 text-3xl text-white">POŠLJI POVPRAŠEVANJE</h2>
              <ContactForm
                dark
                initialType={params.vrsta || (selected || interest ? "PURCHASE" : "GENERAL")}
                initialMotorcycleId={selected?.id || ""}
                initialInterest={interest}
                mailto={mailto}
                motorcycles={choices.map((bike) => ({ id: bike.id, label: displayName(bike) }))}
              />
            </div>
            <LocationMap />
          </div>
        </div>
      </div>
    </section>
  );
}
