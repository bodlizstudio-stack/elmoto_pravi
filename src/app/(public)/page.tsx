import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Bike,
  Compass,
  Facebook,
  Instagram,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";
import { ExternalLink } from "@/components/external-link";
import { MotoCard } from "@/components/moto-card";
import { ReviewsMarquee } from "@/components/reviews-marquee";
import { prisma } from "@/lib/db";
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
    title: "Novi motorji",
    href: "/motorji?condition=NEW",
    icon: Sparkles,
  },
  {
    title: "Rabljeni motorji",
    href: "/motorji?condition=USED",
    icon: Bike,
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
              alt="EL-MOTO — Tvoja pot. Tvoj motor."
              style={{ objectPosition: objectPosDesktop }}
              className="home-hero-photo hidden h-full w-full lg:block"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={hero.imageMobile || hero.image || "/images/hero/hero-elmoto-mobile.webp"}
              alt="EL-MOTO — Tvoja pot. Tvoj motor."
              className="home-hero-photo block h-full w-full object-[58%_top] lg:hidden"
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
              <h1 className="home-hero-title display">{hero.title}</h1>
              <p className="mt-4 max-w-[33rem] text-base leading-7 text-[#F5F5F5]/90 sm:text-[17px]">
                {hero.text}
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link className="btn btn-primary w-full px-7 sm:w-auto" href="/motorji">
                  <span>{hero.button}</span>
                  <ArrowRight aria-hidden className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRAK S 6 KARTICAMI STORITEV */}
      <section className="border-b border-white/10 bg-[#1B1D22] py-6 sm:py-8 lg:py-10" aria-label="Storitve in ponudba">
        <div className="wrap">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
            {serviceCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.title}
                  href={card.href}
                  className="group flex min-h-[6.25rem] flex-col items-center justify-center gap-2.5 rounded-[12px] border border-white/10 bg-[#25272D] px-2.5 py-4 text-center transition-all duration-200 hover:-translate-y-1 hover:border-[#E31B2B] hover:bg-[#2b2e36] hover:shadow-[0_12px_28px_rgba(227,27,43,0.16)] sm:min-h-[7.25rem] sm:gap-3 sm:px-3 sm:py-5"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#1B1D22] text-[#F5F5F5] transition-colors group-hover:border-[#E31B2B]/50 group-hover:bg-[#E31B2B] group-hover:text-white sm:h-11 sm:w-11">
                    <Icon aria-hidden className="h-5 w-5" />
                  </span>
                  <span className="display text-[0.98rem] font-bold leading-tight tracking-wider text-[#F5F5F5] transition-colors group-hover:text-white sm:text-[1.05rem]">
                    {card.title}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. SEKCIJA "NOVO V PONUDBI" (PRED MNENJI KUPCEV) */}
      <section className="home-section bg-[#111216] text-[#F5F5F5]" aria-labelledby="novo-v-ponudbi">
        <div className="wrap">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="kicker">Izbrani motorji</p>
              <h2 id="novo-v-ponudbi" className="display mt-2.5 text-3xl text-white sm:text-4xl">
                NOVO V PONUDBI
              </h2>
            </div>
            <Link
              className="inline-flex min-h-11 items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#F5F5F5] transition-colors hover:text-[#E31B2B]"
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
            <div className="mt-8 rounded-[14px] border border-white/10 bg-[#25272D] p-6">
              <p className="text-[17px] leading-7 text-[#B9BDC5]">
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

      {/* 4. SEKCIJA MNENJ STRANK */}
      <ReviewsMarquee extraReviews={extraReviews} />

      {/* 5. SEKCIJA "SLEDI NAM" */}
      <section className=" bg-[#111216] py-12 text-[#F5F5F5]" aria-labelledby="sledi-nam">
        <div className="wrap">
          <div className="flex flex-col items-start justify-between gap-6 rounded-[14px] border border-white/10 bg-[#25272D] p-6 sm:p-8 md:flex-row md:items-center">
            <div>
              <p className="kicker">Družbena omrežja</p>
              <h2 id="sledi-nam" className="display mt-2 text-2xl text-white sm:text-3xl">
                SLEDI NAM
              </h2>
              <p className="mt-2 max-w-xl text-base text-[#B9BDC5]">
                Spremljaj novosti, nove motorje in utrinke iz EL-MOTO.
              </p>
            </div>
            <div className="flex w-full flex-wrap gap-3 sm:w-auto">
              <ExternalLink
                href={settings.facebook}
                className="btn btn-secondary flex-1 gap-2.5 px-5 sm:flex-initial"
              >
                <Facebook aria-hidden className="h-5 w-5 text-[#E31B2B]" />
                <span>Facebook</span>
              </ExternalLink>
              <ExternalLink
                href={settings.instagram}
                className="btn btn-secondary flex-1 gap-2.5 px-5 sm:flex-initial"
              >
                <Instagram aria-hidden className="h-5 w-5 text-[#E31B2B]" />
                <span>Instagram</span>
              </ExternalLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
