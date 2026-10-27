import Link from "next/link";
import { Facebook, Instagram } from "lucide-react";
import { LogoLink } from "@/components/logo";
import { avtoNetUrl, site } from "@/lib/site";
import { CookieSettingsButton } from "@/components/cookie-banner";
import { ExternalLink } from "@/components/external-link";
import { SubscribeForm } from "@/components/subscribe-form";

export function SiteFooter({
  phone,
  phoneTel,
  email,
  instagram = site.instagram,
  facebook = site.facebook,
  street = site.street,
  postalCode = site.postalCode,
  city = site.city,
  hours = "Po dogovoru",
  newsletter,
}: {
  phone: string;
  phoneTel: string;
  email: string;
  instagram?: string;
  facebook?: string;
  street?: string;
  postalCode?: string;
  city?: string;
  hours?: string;
  newsletter: boolean;
}) {
  const tel = phoneTel || phone.replace(/[^\d+]/g, "");
  return (
    <footer className="border-t border-white/10 bg-[#0d0e12] text-[#F5F5F5]">
      <div className="wrap grid grid-cols-2 gap-8 py-12 sm:gap-10 md:grid-cols-4 md:py-14">
        <div className="col-span-2">
          <LogoLink className="h-11 w-auto sm:h-14" />
          <p className="mt-4 text-base font-bold uppercase tracking-wider text-white">
            {site.brand}
          </p>
          <p className="mt-1 max-w-md text-sm text-[#B9BDC5]">{site.slogan}</p>
          <p className="mt-4 text-sm leading-6 text-[#F5F5F5]">
            {street}
            <br />
            {postalCode} {city}, {site.country}
          </p>
          <p className="mt-2 text-sm font-medium text-[#B9BDC5]">
            Delovni čas: <span className="text-[#F5F5F5]">{hours || "Po dogovoru"}</span>
          </p>
          <div className="mt-5 flex items-center gap-3">
            <ExternalLink
              href={facebook}
              aria-label="Facebook EL-MOTO"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-[#1B1D22] text-white transition-colors hover:border-[#E31B2B] hover:bg-[#E31B2B]"
            >
              <Facebook aria-hidden className="h-5 w-5" />
            </ExternalLink>
            <ExternalLink
              href={instagram}
              aria-label="Instagram @elmoto.si"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-[#1B1D22] text-white transition-colors hover:border-[#E31B2B] hover:bg-[#E31B2B]"
            >
              <Instagram aria-hidden className="h-5 w-5" />
            </ExternalLink>
          </div>
        </div>
        <div className="grid content-start gap-2.5 text-sm text-[#B9BDC5]">
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-white">Ponudba & Strani</p>
          <Link className="hover:text-white" href="/motorji">Vsi motorji</Link>
          <Link className="hover:text-white" href="/motorji?condition=NEW">Novi motorji</Link>
          <Link className="hover:text-white" href="/motorji?condition=USED">Rabljeni motorji</Link>
          <Link className="hover:text-white" href="/kove">KOVE</Link>
          <Link className="hover:text-white" href="/uvoz">Uvoz motorjev</Link>
          <Link className="hover:text-white" href="/najem">Najem motorjev</Link>
          <Link className="hover:text-white" href="/oprema">Moto oprema</Link>
          <Link className="hover:text-white" href="/o-nas">O nas</Link>
          <Link className="hover:text-white" href="/garancija-financiranje">Garancija & Financiranje</Link>
          <Link className="hover:text-white" href="/galerija">Galerija</Link>
          <Link className="hover:text-white" href="/kontakt">Kontakt</Link>
          <ExternalLink className="hover:text-white" href={avtoNetUrl}>Aktualna ponudba na Avto.net</ExternalLink>
        </div>
        <div className="grid content-start gap-2.5 text-sm text-[#B9BDC5]">
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-white">Kontakt & Pravno</p>
          <a className="font-semibold text-white hover:text-[#E31B2B]" href={`tel:${tel}`}>
            {phone}
          </a>
          <a className="break-all hover:text-white" href={`mailto:${email}`}>
            {email}
          </a>
          <div className="my-1 flex items-center gap-2.5">
            <ExternalLink
              href={facebook}
              aria-label="Facebook EL-MOTO"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-[#1B1D22] text-white hover:border-[#E31B2B]"
            >
              <Facebook aria-hidden className="h-4 w-4" />
            </ExternalLink>
            <ExternalLink
              href={instagram}
              aria-label="Instagram @elmoto.si"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-[#1B1D22] text-white hover:border-[#E31B2B]"
            >
              <Instagram aria-hidden className="h-4 w-4" />
            </ExternalLink>
          </div>
          <Link className="hover:text-white" href="/pogosta-vprasanja">Pogosta vprašanja</Link>
          <Link className="hover:text-white" href="/zasebnost">Politika zasebnosti</Link>
          <Link className="hover:text-white" href="/piskotki">Piškotki</Link>
          <Link className="hover:text-white" href="/pogoji">Pogoji poslovanja</Link>
          <Link className="hover:text-white" href="/pogoji-najema">Pogoji najema</Link>
          <Link className="hover:text-white" href="/podjetje">Podatki o podjetju</Link>
          <CookieSettingsButton />
        </div>
      </div>
      {newsletter ? (
        <div className="wrap pb-8">
          <SubscribeForm />
        </div>
      ) : null}
      <div className="border-t border-white/10 py-5 text-center text-xs text-[#B9BDC5]">
        © {new Date().getFullYear()} {site.brand}. Vse pravice pridržane.
      </div>
    </footer>
  );
}
