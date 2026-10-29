"use client";

import Link from "next/link";
import { Suspense, useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, Phone, X } from "lucide-react";
import { CompareLink } from "@/components/compare-button";
import { ExternalLink } from "@/components/external-link";
import { LogoLink } from "@/components/logo";
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "@/components/social-icons";
import { avtoNetUrl, navItems, ponudbaLinks, site } from "@/lib/site";

export { FacebookIcon, InstagramIcon, WhatsAppIcon };

function active(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  const [baseHref] = href.split("?");
  return pathname === baseHref || pathname.startsWith(`${baseHref}/`);
}

export function SiteHeader({
  phoneDisplay = site.phoneDisplay,
  phoneTel = site.phoneTel,
  whatsappUrl = site.whatsappUrl,
  facebook = site.facebook,
  instagram = site.instagram,
}: {
  phoneDisplay?: string;
  phoneTel?: string;
  whatsappUrl?: string;
  facebook?: string;
  instagram?: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mobileOfferOpen, setMobileOfferOpen] = useState(true);
  const [seenPath, setSeenPath] = useState(pathname);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  if (seenPath !== pathname) {
    setSeenPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const iconBtnClass =
    "inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#E2E5E9] bg-[#F6F6F4] text-[#16181C] transition-colors hover:border-[#E31B2B] hover:bg-white hover:text-[#E31B2B] sm:h-11 sm:w-11";

  return (
    <header className="sticky top-0 z-50 border-b border-[#E2E5E9] bg-white text-[#16181C] uppercase shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <div className="wrap relative flex h-[4.5rem] items-center justify-between gap-3 md:h-20">
        <LogoLink className="h-8 w-auto sm:h-10 md:h-11" theme="light" />

        <nav aria-label="Glavna navigacija" className="hidden items-center gap-3.5 xl:flex 2xl:gap-5">
          <Suspense
            fallback={
              <Link
                href="/motorji"
                className="text-[13px] font-bold uppercase tracking-wider text-[#16181C] 2xl:text-sm"
              >
                PONUDBA MOTORJEV
              </Link>
            }
          >
            <PonudbaMenu />
          </Suspense>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active(pathname, item.href) ? "page" : undefined}
              className={`text-[13px] font-bold uppercase tracking-wider transition-colors 2xl:text-sm ${
                active(pathname, item.href)
                  ? "text-[#16181C] underline decoration-[#E31B2B] decoration-2 underline-offset-8"
                  : "text-[#5B616B] hover:text-[#16181C]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <a
            href={`tel:${phoneTel}`}
            aria-label={`Pokliči ${phoneDisplay}`}
            title={`Pokliči ${phoneDisplay}`}
            className={iconBtnClass}
          >
            <Phone aria-hidden className="h-[18px] w-[18px]" />
          </a>
          <ExternalLink
            href={whatsappUrl}
            aria-label={`WhatsApp ${phoneDisplay}`}
            className={`${iconBtnClass} hover:border-[#25D366] hover:text-[#25D366]`}
          >
            <WhatsAppIcon className="h-[19px] w-[19px] text-[#25D366]" />
          </ExternalLink>
          <ExternalLink
            href={facebook}
            aria-label="Facebook EL-MOTO"
            className={`hidden sm:inline-flex ${iconBtnClass} hover:border-[#1877F2] hover:text-[#1877F2]`}
          >
            <FacebookIcon className="h-[18px] w-[18px] text-[#1877F2]" />
          </ExternalLink>
          <ExternalLink
            href={instagram}
            aria-label="Instagram @elmoto.si"
            className={`hidden sm:inline-flex ${iconBtnClass} hover:border-[#E1306C] hover:text-[#E1306C]`}
          >
            <InstagramIcon className="h-[19px] w-[19px]" />
          </ExternalLink>
          <button
            ref={buttonRef}
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#E2E5E9] bg-[#F6F6F4] text-[#16181C] hover:border-[#16181C] sm:h-11 sm:w-11 xl:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Zapri meni" : "Odpri meni"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X aria-hidden className="h-5 w-5" /> : <Menu aria-hidden className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="fixed inset-x-0 top-[4.5rem] bottom-0 z-50 h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-[#E2E5E9] bg-white px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-4 text-[#16181C] uppercase md:top-20 md:h-[calc(100dvh-5rem)] xl:hidden"
        >
          <p id={titleId} className="sr-only">
            MOBILNI MENI
          </p>
          <nav aria-label="Mobilna navigacija" className="grid">
            <div className="border-b border-[#E2E5E9] py-1.5">
              <button
                type="button"
                onClick={() => setMobileOfferOpen((v) => !v)}
                aria-expanded={mobileOfferOpen}
                className="flex w-full items-center justify-between py-3 text-lg font-bold uppercase tracking-wide text-[#16181C] sm:text-xl"
              >
                <span>PONUDBA MOTORJEV</span>
                <ChevronDown
                  aria-hidden
                  className={`h-5 w-5 text-[#E31B2B] transition-transform duration-200 ${
                    mobileOfferOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {mobileOfferOpen ? (
                <div className="mb-2 mt-1 grid gap-1 rounded-[10px] bg-[#F6F6F4] p-2">
                  <Suspense fallback={null}>
                    <PonudbaLinks onNavigate={() => setOpen(false)} />
                  </Suspense>
                </div>
              ) : null}
            </div>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active(pathname, item.href) ? "page" : undefined}
                className={`border-b border-[#E2E5E9] py-3.5 text-lg font-bold uppercase tracking-wide sm:py-4 sm:text-xl ${
                  active(pathname, item.href) ? "text-[#E31B2B]" : "text-[#16181C]"
                }`}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-6 grid gap-3">
            <div className="grid grid-cols-4 gap-2.5">
              <a
                href={`tel:${phoneTel}`}
                aria-label={`Pokliči ${phoneDisplay}`}
                className="flex h-12 items-center justify-center rounded-[10px] border border-[#E2E5E9] bg-[#F6F6F4] text-[#16181C] hover:border-[#E31B2B]"
              >
                <Phone aria-hidden className="h-5 w-5" />
              </a>
              <ExternalLink
                href={whatsappUrl}
                aria-label={`WhatsApp ${phoneDisplay}`}
                className="flex h-12 items-center justify-center rounded-[10px] border border-[#E2E5E9] bg-[#F6F6F4] hover:border-[#25D366]"
              >
                <WhatsAppIcon className="h-5 w-5 text-[#25D366]" />
              </ExternalLink>
              <ExternalLink
                href={facebook}
                aria-label="Facebook EL-MOTO"
                className="flex h-12 items-center justify-center rounded-[10px] border border-[#E2E5E9] bg-[#F6F6F4] hover:border-[#1877F2]"
              >
                <FacebookIcon className="h-5 w-5 text-[#1877F2]" />
              </ExternalLink>
              <ExternalLink
                href={instagram}
                aria-label="Instagram @elmoto.si"
                className="flex h-12 items-center justify-center rounded-[10px] border border-[#E2E5E9] bg-[#F6F6F4] hover:border-[#E1306C]"
              >
                <InstagramIcon className="h-5 w-5" />
              </ExternalLink>
            </div>
            <a className="btn btn-primary w-full uppercase" href={`tel:${phoneTel}`}>
              <Phone aria-hidden className="h-4 w-4" />
              POKLIČI {phoneDisplay}
            </a>
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-sm text-[#5B616B]">
              <ExternalLink
                href={avtoNetUrl}
                className="inline-flex min-h-10 items-center font-semibold uppercase underline hover:text-[#16181C]"
              >
                PONUDBA NA AVTO.NET
              </ExternalLink>
              <CompareLink
                className="inline-flex min-h-10 items-center font-semibold uppercase underline hover:text-[#16181C]"
                always
              />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function PonudbaMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [seenPath, setSeenPath] = useState(pathname);
  const ref = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const here =
    pathname.startsWith("/motorji") ||
    pathname.startsWith("/kove") ||
    pathname.startsWith("/oprema") ||
    pathname.startsWith("/najem") ||
    pathname.startsWith("/uvoz") ||
    pathname.startsWith("/komisijska-prodaja");

  if (seenPath !== pathname) {
    setSeenPath(pathname);
    setOpen(false);
  }

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        ref.current?.querySelector("button")?.focus();
      }
    };
    const onPointer = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onPointer);
    };
  }, [open]);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        className={`inline-flex min-h-11 items-center gap-1.5 text-[13px] font-bold uppercase tracking-wider transition-colors 2xl:text-sm ${
          here
            ? "text-[#16181C] underline decoration-[#E31B2B] decoration-2 underline-offset-8"
            : "text-[#5B616B] hover:text-[#16181C]"
        }`}
        aria-expanded={open}
        aria-controls="ponudba-motorjev-menu"
        onClick={() => setOpen((value) => !value)}
      >
        PONUDBA MOTORJEV
        <ChevronDown
          aria-hidden
          className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        id="ponudba-motorjev-menu"
        className={`absolute left-0 top-full z-20 mt-1 min-w-60 rounded-[12px] border border-[#E2E5E9] bg-white p-2 shadow-[0_16px_36px_rgba(0,0,0,0.12)] transition-all duration-200 ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        <Suspense fallback={null}>
          <PonudbaLinks onNavigate={() => setOpen(false)} />
        </Suspense>
      </div>
    </div>
  );
}

function PonudbaLinks({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {ponudbaLinks.map((item) => {
        const current = active(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={current ? "page" : undefined}
            className={`flex min-h-11 items-center rounded-[8px] px-3.5 text-sm font-bold uppercase tracking-wide transition-colors ${
              current
                ? "bg-[#E31B2B] text-white"
                : "text-[#16181C] hover:bg-[#F6F6F4] hover:text-[#E31B2B]"
            }`}
            onClick={onNavigate}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
