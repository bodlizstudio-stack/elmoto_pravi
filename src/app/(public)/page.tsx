import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Bike,
  Compass,
  HandCoins,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { ExternalLink } from "@/components/external-link";
import { MotoCard } from "@/components/moto-card";
import { ReviewsMarquee } from "@/components/reviews-marquee";
import { FacebookIcon, InstagramIcon } from "@/components/social-icons";
import { prisma } from "@/lib/db";
import { publishedKoveModels } from "@/lib/kove";
import { homeBikes } from "@/lib/motorcycles";
import { getSettings } from "@/lib/settings";
import { avtoNetUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "EL-MOTO d.o.o. | Novi in rabljeni motorji z garancijo · KOVE" },
  description:
    "Odkrij skrbno izbrano ponudbo novih in rabljenih motornih koles z garancijo. Pooblaščeni prodajalec KOVE v Trzinu.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "EL-MOTO d.o.o. | Novi in rabljeni motorji z garancijo · KOVE",
    description: "Novi in rabljeni motorji pri EL-MOTO d.o.o. Pooblaščeni prodajalec KOVE.",
    url: "/",
    locale: "sl_SI",
    type: "website",
    images: [
      {
        url: "/images/hero/hero-elmoto.webp",
        width: 1376,
        height: 768,
        alt: "EL-MOTO d.o.o. — Novi in rabljeni motorji z garancijo",
      },
    ],
  },
};

const serviceCards = [
  {
    title: "Ponudba motorjev",
    href: "/motorji",
    icon: Bike,
  },
  {
    title: "Komisijska prodaja",
    href: "/komisijska-prodaja",
    icon: HandCoins,
  },
  {
    title: "Uvoz motorjev",
    href: "/uvoz",
    icon: Truck,
  },
  {
    title: "KOVE",
    href: "/kove",
    icon: Compass,
  },
  {
    title: "Moto oprema",
    href: "/oprema",
    icon: ShoppingBag,
  },
  {
    title: "Garancija in financiranje",
    href: "/garancija-financiranje",
    icon: ShieldCheck,
  },
] as const;

export default async function HomePage() {
  const [bikes, settings, testimonials] = await Promise.all([
    homeBikes(),
    getSettings(),
    prisma.testimonial.findMany({ where: { published: true }, orderBy: { createdAt: "desc" } }),
  ]);

  const { hero } = settings;
  const extraReviews = testimonials.map((item) => ({
    id: item.id,
    authorName: item.authorName,
    text: item.text,
    rating: item.rating ?? 5,
    source: item.source || "Google",
  }));

  const overlayAlpha = Math.min(0.98, Math.max(0.25, hero.overlay / 100));
  const objectPosDesktop = `${hero.focusX}% ${hero.focusY}%`;

  return (
    <>
      {/* 1. HERO SEKCIJA */}
      <section className="home-hero border-b border-white/10 bg-[#111216] text-[#F5F5F5]">
        <div className="home-hero-stage">
          <div className="home-hero-photo-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={hero.image || "/images/hero/hero-elmoto.webp"}
              alt="EL-MOTO d.o.o. — Tvoja pot. Tvoj motor."
              style={{ objectPosition: objectPosDesktop }}
              className="home-hero-photo hidden h-full w-full lg:block"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={hero.imageMobile || hero.image || "/images/hero/hero-elmoto-mobile.webp"}
              alt="EL-MOTO d.o.o. — Tvoja pot. Tvoj motor."
              className="home-hero-photo block h-full w-full object-[80%_top] lg:hidden"
            />
            <div
              className="home-hero-fade"
              aria-hidden="true"
              style={{
                opacity: Math.min(1, overlayAlpha / 0.72),
              }}
            />
          </div>

          <div className="wrap home-hero-grid">
            <div className="home-hero-copy max-w-[36rem]">
              <p className="kicker text-xs sm:text-sm">{hero.kicker}</p>
              <h1 className="home-hero-title display flex flex-col leading-[0.92]">
                <span className="block">TVOJA POT</span>
                <span className="block text-white">TVOJ MOTOR</span>
              </h1>
              <p className="mt-4 max-w-[33rem] text-base leading-7 text-[#F5F5F5]/90 sm:text-[17px]">
                {hero.text}
              </p>
              <div className="mt-6 flex flex-col items-start gap-3">
                <Link
                  className="btn btn-primary w-full justify-center px-8 sm:w-auto"
                  href="/motorji"
                >
                  <span>{hero.button || "Razišči motorje"}</span>
                  <ArrowRight aria-hidden className="h-4 w-4" />
                </Link>
                <ExternalLink
                  href={avtoNetUrl}
                  className="btn btn-secondary w-full justify-center px-7 sm:w-auto text-[0.98rem]"
                >
                  <span>Aktualna ponudba (Avto.net)</span>
                  <span aria-hidden className="text-[#E31B2B]">↗</span>
                </ExternalLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MNENJA STRANK (PREMAKNJENA TAKOJ ZA HERO SEKCIJO) */}
      <ReviewsMarquee extraReviews={extraReviews} />

      {/* 3. TRAK S 6 KARTICAMI STORITEV (NA TELEFONU 2 VRSTICI PO 3, VSE VIDNO BREZ REZANJA) */}
      <section className="border-b border-[#E2E5E9] bg-white py-3 sm:py-6 lg:py-8" aria-label="Storitve in ponudba">
        <div className="wrap">
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 lg:grid-cols-6">
            {serviceCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.title}
                  href={card.href}
                  className="group flex min-h-[4.75rem] w-full flex-col items-center justify-center gap-1 rounded-[10px] border border-[#E2E5E9] bg-white p-1.5 py-2 text-center shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[#E31B2B] hover:shadow-[0_8px_20px_rgba(227,27,43,0.10)] sm:min-h-[6.5rem] sm:gap-2.5 sm:rounded-[12px] sm:p-3 sm:py-4"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#E2E5E9] bg-[#F6F6F4] text-[#16181C] transition-colors group-hover:border-[#E31B2B] group-hover:bg-[#E31B2B] group-hover:text-white sm:h-10 sm:w-10 sm:rounded-lg">
                    <Icon aria-hidden className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                  </span>
                  <span className="display text-[10px] font-bold leading-tight tracking-tight text-[#16181C] transition-colors group-hover:text-[#E31B2B] sm:text-[1rem] sm:tracking-wider">
                    {card.title}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. SEKCIJA "NOVO V PONUDBI" */}
      <section className="home-section bg-[#F6F6F4] text-[#16181C]" aria-labelledby="novo-v-ponudbi">
        <div className="wrap">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="kicker">Izbrani motorji</p>
              <h2 id="novo-v-ponudbi" className="display mt-2.5 text-3xl text-[#16181C] sm:text-4xl">
                NOVO V PONUDBI
              </h2>
            </div>
            <Link
              className="inline-flex min-h-11 items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#16181C] transition-colors hover:text-[#E31B2B]"
              href="/motorji"
            >
              <span>Poglej celotno ponudbo</span>
              <ArrowRight aria-hidden className="h-4 w-4 text-[#E31B2B]" />
            </Link>
          </div>

          {bikes.length ? (
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {bikes.map((bike) => (
                <MotoCard key={bike.id} bike={bike} />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-[14px] border border-[#E2E5E9] bg-white p-6 shadow-2xs">
              <p className="text-[17px] leading-7 text-[#5B616B]">
                Trenutno ni objavljenih motorjev. Pokliči nas ali preveri ponudbo na Avto.net.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <a className="btn btn-primary w-full sm:w-auto" href={`tel:${settings.phoneTel}`}>
                  Pokliči {settings.phoneDisplay}
                </a>
                <ExternalLink href={avtoNetUrl} className="btn btn-secondary w-full sm:w-auto">
                  Ponudba na Avto.net
                </ExternalLink>
              </div>
            </div>
          )}

          <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <Link className="btn btn-primary w-full sm:w-auto" href="/motorji">
              Vsi motorji v ponudbi
            </Link>
            <ExternalLink href={avtoNetUrl} className="btn btn-secondary w-full sm:w-auto">
              Celotna zaloga na Avto.net ↗
            </ExternalLink>
          </div>
        </div>
      </section>

      {/* 5. SEKCIJA "SPOZNAJ KOVE" (POD NOVO V PONUDBI) */}
      <section className="home-section border-t border-[#E2E5E9] bg-white text-[#16181C]" aria-labelledby="spoznaj-kove">
        <div className="wrap">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="kicker">Uradni prodajalec KOVE v Trzinu</p>
              <h2 id="spoznaj-kove" className="display mt-2.5 text-3xl text-[#16181C] sm:text-4xl">
                SPOZNAJ KOVE
              </h2>
              <p className="mt-2.5 max-w-2xl text-base text-[#5B616B] sm:text-[17px]">
                EL-MOTO d.o.o. je pooblaščeni prodajalec inovativne znamke motociklov KOVE v Sloveniji. Razišči vrhunske adventure in rally modele z izjemno serijsko opremo.
              </p>
            </div>
            <Link
              className="inline-flex min-h-11 items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#16181C] transition-colors hover:text-[#E31B2B]"
              href="/kove"
            >
              <span>Vsi modeli KOVE</span>
              <ArrowRight aria-hidden className="h-4 w-4 text-[#E31B2B]" />
            </Link>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {publishedKoveModels.map((model) => (
              <article
                key={model.slug}
                className="group flex flex-col overflow-hidden rounded-[14px] border border-[#E2E5E9] bg-[#FDFDFD] shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-[#E31B2B] hover:shadow-[0_12px_28px_rgba(227,27,43,0.12)]"
              >
                <div className="relative aspect-[16/10] bg-[#F6F6F4] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={model.image}
                    alt={`${model.name} — pooblaščeni prodajalec KOVE`}
                    className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-md bg-[#16181C] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white">
                    KOVE
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="display text-2xl text-[#16181C] transition-colors group-hover:text-[#E31B2B]">
                    {model.name}
                  </h3>
                  <p className="mt-2.5 flex-1 text-sm leading-6 text-[#5B616B]">
                    {model.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {model.features.map((feat) => (
                      <span
                        key={feat}
                        className="rounded-full border border-[#E2E5E9] bg-white px-2.5 py-1 text-xs font-medium text-[#16181C]"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                  <div className="mt-5 border-t border-[#E2E5E9] pt-4">
                    <Link
                      href="/kove"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#E2E5E9] bg-white py-2.5 text-sm font-bold text-[#16181C] transition-colors group-hover:border-[#E31B2B] group-hover:bg-[#E31B2B] group-hover:text-white"
                    >
                      <span>Podrobnosti modela</span>
                      <ArrowRight aria-hidden className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-6 rounded-[14px] border border-[#E2E5E9] bg-[#F6F6F4] p-6 shadow-2xs sm:p-8 md:flex-row md:items-center">
            <div>
              <h3 className="display text-xl text-[#16181C] sm:text-2xl">
                ZANIMA TE TESTNA VOŽNJA ALI NAKUP KOVE?
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[#5B616B] sm:text-base">
                Obišči naš prodajni salon EL-MOTO d.o.o. v Trzinu (Ljubljanska cesta 21a) ali stopi v stik z nami za dobavni rok in individualno ponudbo.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link className="btn btn-primary w-full sm:w-auto" href="/kontakt?vrsta=PURCHASE&model=KOVE">
                Povprašaj za KOVE
              </Link>
              <Link className="btn btn-secondary w-full sm:w-auto" href="/kove">
                Vsi modeli KOVE
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SEKCIJA "SLEDI NAM" */}
      <section className="bg-[#F6F6F4] py-12 text-[#16181C]" aria-labelledby="sledi-nam">
        <div className="wrap">
          <div className="flex flex-col items-start justify-between gap-6 rounded-[14px] border border-[#E2E5E9] bg-white p-6 shadow-2xs sm:p-8 md:flex-row md:items-center">
            <div>
              <p className="kicker">Družbena omrežja</p>
              <h2 id="sledi-nam" className="display mt-2 text-2xl text-[#16181C] sm:text-3xl">
                SLEDI NAM
              </h2>
              <p className="mt-2 max-w-xl text-base text-[#5B616B]">
                Spremljaj novosti, nove motorje in utrinke iz EL-MOTO.
              </p>
            </div>
            <div className="flex w-full flex-wrap gap-3 sm:w-auto">
              <ExternalLink
                href={settings.facebook}
                aria-label="Facebook EL-MOTO"
                className="btn btn-secondary flex-1 gap-2.5 px-5 transition-colors hover:border-[#1877F2] hover:bg-[#1877F2]/5 sm:flex-initial"
              >
                <FacebookIcon className="h-5 w-5 text-[#1877F2]" />
                <span>Facebook</span>
              </ExternalLink>
              <ExternalLink
                href={settings.instagram}
                aria-label="Instagram @elmoto.si"
                className="btn btn-secondary flex-1 gap-2.5 px-5 transition-colors hover:border-[#E1306C] hover:bg-[#E1306C]/5 sm:flex-initial"
              >
                <InstagramIcon className="h-5 w-5" />
                <span>Instagram</span>
              </ExternalLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
