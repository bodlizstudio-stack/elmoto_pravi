import Link from "next/link";
import { LogoLink } from "@/components/logo";
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "@/components/social-icons";
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
    <footer className="border-t border-[#E2E5E9] bg-white text-[#16181C]">
      <div className="wrap grid grid-cols-2 gap-8 py-12 sm:gap-10 md:grid-cols-4 md:py-14">
        <div className="col-span-2">
          <LogoLink className="h-11 w-auto sm:h-14" theme="light" />
          <p className="mt-4 text-base font-bold tracking-wider text-[#16181C]">
            EL-MOTO <span className="text-sm font-semibold text-[#5B616B]">d.o.o.</span>
          </p>
          <p className="mt-1 max-w-md text-sm text-[#5B616B]">{site.slogan}</p>
          <p className="mt-4 text-sm leading-6 text-[#16181C]">
            {street}
            <br />
            {postalCode} {city}, {site.country}
          </p>
          <p className="mt-2 text-sm font-medium text-[#5B616B]">
            Delovni čas: <span className="text-[#16181C]">{hours || "Po dogovoru"}</span>
          </p>
          <div className="mt-5 flex items-center gap-3">
            <ExternalLink
              href={site.whatsappUrl}
              aria-label="WhatsApp EL-MOTO"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#E2E5E9] bg-[#F6F6F4] transition-colors hover:border-[#25D366] hover:bg-white"
            >
              <WhatsAppIcon className="h-5 w-5 text-[#25D366]" />
            </ExternalLink>
            <ExternalLink
              href={facebook}
              aria-label="Facebook EL-MOTO"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#E2E5E9] bg-[#F6F6F4] transition-colors hover:border-[#1877F2] hover:bg-white"
            >
              <FacebookIcon className="h-5 w-5 text-[#1877F2]" />
            </ExternalLink>
            <ExternalLink
              href={instagram}
              aria-label="Instagram @elmoto.si"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#E2E5E9] bg-[#F6F6F4] transition-colors hover:border-[#E1306C] hover:bg-white"
            >
              <InstagramIcon className="h-5 w-5" />
            </ExternalLink>
          </div>
        </div>
        <div className="grid content-start gap-2.5 text-sm text-[#5B616B]">
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-[#16181C]">Ponudba & Strani</p>
          <Link className="hover:text-[#16181C]" href="/motorji">Vsi motorji</Link>
          <Link className="hover:text-[#16181C]" href="/motorji?condition=NEW">Novi motorji</Link>
          <Link className="hover:text-[#16181C]" href="/motorji?condition=USED">Rabljeni motorji</Link>
          <Link className="hover:text-[#16181C]" href="/oprema">Moto oprema</Link>
          <Link className="hover:text-[#16181C]" href="/najem">Najem motorjev</Link>
          <Link className="hover:text-[#16181C]" href="/komisijska-prodaja">Komisijska prodaja</Link>
          <Link className="hover:text-[#16181C]" href="/uvoz">Uvoz motorjev</Link>
          <Link className="hover:text-[#16181C]" href="/kove">KOVE</Link>
          <Link className="hover:text-[#16181C]" href="/garancija-financiranje">Garancija & Financiranje</Link>
          <Link className="hover:text-[#16181C]" href="/primerjava">Primerjava motorjev</Link>
          <Link className="hover:text-[#16181C]" href="/galerija">Galerija</Link>
          <Link className="hover:text-[#16181C]" href="/o-nas">O nas</Link>
          <Link className="hover:text-[#16181C]" href="/kontakt">Kontakt</Link>
          <ExternalLink className="hover:text-[#16181C]" href={avtoNetUrl}>Aktualna ponudba na Avto.net</ExternalLink>
        </div>
        <div className="grid content-start gap-2.5 text-sm text-[#5B616B]">
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-[#16181C]">Kontakt & Pravno</p>
          <a className="font-semibold text-[#16181C] hover:text-[#E31B2B]" href={`tel:${tel}`}>
            {phone}
          </a>
          <a className="break-all hover:text-[#16181C]" href={`mailto:${email}`}>
            {email}
          </a>
          <div className="my-1 flex items-center gap-2.5">
            <ExternalLink
              href={site.whatsappUrl}
              aria-label="WhatsApp EL-MOTO"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2E5E9] bg-[#F6F6F4] hover:border-[#25D366]"
            >
              <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
            </ExternalLink>
            <ExternalLink
              href={facebook}
              aria-label="Facebook EL-MOTO"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2E5E9] bg-[#F6F6F4] hover:border-[#1877F2]"
            >
              <FacebookIcon className="h-4 w-4 text-[#1877F2]" />
            </ExternalLink>
            <ExternalLink
              href={instagram}
              aria-label="Instagram @elmoto.si"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2E5E9] bg-[#F6F6F4] hover:border-[#E1306C]"
            >
              <InstagramIcon className="h-4 w-4" />
            </ExternalLink>
          </div>
          <Link className="hover:text-[#16181C]" href="/pogosta-vprasanja">Pogosta vprašanja</Link>
          <Link className="hover:text-[#16181C]" href="/zasebnost">Politika zasebnosti</Link>
          <Link className="hover:text-[#16181C]" href="/piskotki">Piškotki</Link>
          <Link className="hover:text-[#16181C]" href="/pogoji">Pogoji poslovanja</Link>
          <Link className="hover:text-[#16181C]" href="/pogoji-najema">Pogoji najema</Link>
          <Link className="hover:text-[#16181C]" href="/podjetje">Podatki o podjetju</Link>
          <CookieSettingsButton />
        </div>
      </div>
      {newsletter ? (
        <div className="wrap pb-8">
          <SubscribeForm />
        </div>
      ) : null}
      <div className="border-t border-[#E2E5E9] py-5 text-center text-xs text-[#717680]">
        © {new Date().getFullYear()} {site.brand}. Vse pravice pridržane.
      </div>
    </footer>
  );
}
