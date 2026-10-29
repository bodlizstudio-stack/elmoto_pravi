import type { Metadata } from "next";
import { Building2, Clock, Mail, MapPin, MessageSquare, Navigation } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ContactForm } from "@/components/contact-form";
import { ExternalLink } from "@/components/external-link";
import { LocationMap } from "@/components/location-map";
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "@/components/social-icons";
import { publicChoices } from "@/lib/motorcycles";
import { getSettings } from "@/lib/settings";
import { mapsDirectionsUrl, site } from "@/lib/site";
import { displayName, mailtoHref } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kontakt | EL-MOTO d.o.o.",
  description:
    "Kontakt EL-MOTO d.o.o., info@elmoto.si, Špruha 33, 1236 Trzin. Pošlji povpraševanje za nakup, uvoz, komisijsko prodajo ali najem motorja.",
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
    <section className="bg-[#F6F6F4] py-10 text-[#16181C] sm:py-14">
      <div className="wrap">
        <Breadcrumbs items={[{ href: "/", label: "Domov" }, { label: "Kontakt" }]} />
        <p className="kicker mt-4">Kontakt in lokacija</p>
        <h1 className="display mt-2.5 text-5xl text-[#16181C] sm:text-7xl">STOPI V STIK Z NAMI</h1>
        <p className="mt-4 max-w-2xl text-[17px] leading-7 text-[#5B616B]">
          Piši nam prek spletnega obrazca, po e-pošti ali se po predhodnem dogovoru oglasi v našem salonu v Trzinu. Z
          veseljem odgovorimo na vsa tvoja vprašanja.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(18rem,0.85fr)_minmax(0,1.15fr)]">
          {/* Leva kolona: Podatki podjetja, salon, e-pošta, družbena omrežja in navigacija */}
          <div className="grid content-start gap-6 rounded-[14px] border border-[#E2E5E9] bg-white p-6 shadow-sm sm:p-7 text-[#16181C]">
            <div>
              <p className="display text-3xl text-[#16181C] sm:text-4xl">{site.brand}</p>
              <p className="mt-1 text-sm text-[#5B616B]">{site.slogan}</p>

              <div className="mt-5 grid gap-3.5 text-base text-[#16181C]">
                <div className="flex items-start gap-3">
                  <MapPin aria-hidden className="mt-1 h-5 w-5 shrink-0 text-[#E31B2B]" />
                  <div>
                    <span className="font-semibold text-[#16181C]">Salon in ogledi</span>
                    <p className="text-sm text-[#5B616B]">
                      {settings.street}
                      <br />
                      {settings.postalCode} {settings.city}, {site.country}
                    </p>
                    <p className="mt-1 text-xs text-[#0F1E32] font-medium">Ogledi motornih koles po predhodnem dogovoru</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail aria-hidden className="mt-1 h-5 w-5 shrink-0 text-[#E31B2B]" />
                  <div>
                    <span className="font-semibold text-[#16181C]">E-poštni naslov</span>
                    <p className="text-sm text-[#5B616B]">
                      <a href={`mailto:${settings.email}`} className="text-[#16181C] underline hover:text-[#E31B2B]">
                        {settings.email}
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-[#5B616B]">
                  <Clock aria-hidden className="mt-1 h-5 w-5 shrink-0 text-[#E31B2B]" />
                  <div>
                    <span className="font-semibold text-[#16181C]">Delovni čas</span>
                    <p className="text-sm text-[#5B616B]">
                      {settings.hours || "Po predhodnem dogovoru"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Družbena omrežja & klepet */}
            <div className="border-t border-[#E2E5E9] pt-5">
              <p className="text-xs font-bold uppercase tracking-wider text-[#5B616B]">
                Družbena omrežja &amp; sporočila
              </p>
              <div className="mt-3 flex items-center gap-3">
                <ExternalLink
                  href={settings.facebook}
                  aria-label="Facebook EL-MOTO"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-[#E2E5E9] bg-[#F6F6F4] text-[#16181C] transition-colors hover:border-[#1877F2] hover:bg-[#1877F2]/10"
                >
                  <FacebookIcon className="h-5 w-5 text-[#1877F2]" />
                </ExternalLink>
                <ExternalLink
                  href={settings.instagram}
                  aria-label="Instagram @elmoto.si"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-[#E2E5E9] bg-[#F6F6F4] text-[#16181C] transition-colors hover:border-[#E1306C] hover:bg-[#E1306C]/10"
                >
                  <InstagramIcon className="h-5 w-5 text-[#E1306C]" />
                </ExternalLink>
                <ExternalLink
                  href={settings.whatsappUrl}
                  aria-label="WhatsApp EL-MOTO"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-[#E2E5E9] bg-[#F6F6F4] text-[#25D366] transition-colors hover:border-[#25D366] hover:bg-[#25D366]/10"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                </ExternalLink>
              </div>
            </div>

            {/* Akcijski gumbi */}
            <div className="grid gap-3 border-t border-[#E2E5E9] pt-5">
              <a
                className="btn btn-primary w-full justify-center"
                href={`mailto:${settings.email}`}
              >
                <Mail aria-hidden className="h-4 w-4" />
                <span>Pošlji e-pošto ({settings.email})</span>
              </a>
              <a
                className="btn btn-secondary w-full justify-center"
                href={mapsDirectionsUrl}
                target="_blank"
                rel="noreferrer"
              >
                <Navigation aria-hidden className="h-4 w-4 text-[#E31B2B]" />
                <span>Odpri navigacijo do salona</span>
              </a>
              <ExternalLink
                href={settings.whatsappUrl}
                className="btn btn-secondary w-full justify-center"
              >
                <MessageSquare aria-hidden className="h-4 w-4 text-[#25D366]" />
                <span>Sporočilo prek WhatsApp</span>
              </ExternalLink>
            </div>

            {/* Pravni podatki podjetja */}
            <div className="rounded-[10px] border border-[#E2E5E9] bg-[#F6F6F4] p-4 text-xs text-[#5B616B]">
              <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-[#16181C]">
                <Building2 aria-hidden className="h-4 w-4 text-[#E31B2B]" />
                <span>Podatki podjetja</span>
              </div>
              <dl className="mt-2.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                <dt className="text-[#5B616B]">Polno ime:</dt>
                <dd className="text-[#16181C] font-medium">{site.registryName}</dd>
                <dt className="text-[#5B616B]">ID za DDV:</dt>
                <dd className="text-[#16181C] font-medium">{site.taxNumber} (zavezanec za DDV)</dd>
                <dt className="text-[#5B616B]">Matična št.:</dt>
                <dd className="text-[#16181C] font-medium">{site.registrationNumber}</dd>
                <dt className="text-[#5B616B]">Zastopnik:</dt>
                <dd className="text-[#16181C] font-medium">{site.representative}</dd>
              </dl>
            </div>
          </div>

          {/* Desna kolona: Kontaktni obrazec in Zemljevid */}
          <div id="kontaktni-obrazec" className="scroll-mt-28">
            <div className="rounded-[14px] border border-[#E2E5E9] bg-white p-6 shadow-sm sm:p-8 text-[#16181C]">
              <h2 className="display mb-5 text-3xl text-[#16181C]">POŠLJI POVPRAŠEVANJE</h2>
              <ContactForm
                dark={false}
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
