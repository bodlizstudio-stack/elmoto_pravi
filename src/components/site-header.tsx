"use client";

import Link from "next/link";
import { Suspense, useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, Facebook, Instagram, Menu, Phone, X } from "lucide-react";
import { CompareLink } from "@/components/compare-button";
import { ExternalLink } from "@/components/external-link";
import { LogoLink } from "@/components/logo";
import { avtoNetUrl, navItems, ponudbaLinks, site } from "@/lib/site";

export function WhatsAppIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M20.52 3.48A11.82 11.82 0 0 0 12.06 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.15 1.6 5.95L0 24l6.33-1.66a11.87 11.87 0 0 0 5.73 1.46h.01c6.56 0 11.9-5.34 11.9-11.9 0-3.18-1.24-6.17-3.45-8.42ZM12.07 21.8h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.76.98 1-3.66-.23-.38a9.85 9.85 0 0 1-1.51-5.25c0-5.45 4.44-9.89 9.9-9.89 2.64 0 5.13 1.03 7 2.9a9.83 9.83 0 0 1 2.9 7c0 5.45-4.44 9.89-9.9 9.89Zm5.43-7.41c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35Z" />
    </svg>
  );
}

function active(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
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
    "inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/14 bg-[#1B1D22] text-[#F5F5F5] transition-colors hover:border-[#E31B2B] hover:bg-[#25272D] hover:text-white sm:h-11 sm:w-11";

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#111216] text-[#F5F5F5] uppercase">
      <div className="wrap relative flex h-[4.5rem] items-center justify-between gap-3 md:h-20">
        <LogoLink className="h-8 w-auto sm:h-10 md:h-11" />

        <nav aria-label="Glavna navigacija" className="hidden items-center gap-6 xl:flex">
          <Suspense fallback={<Link href="/motorji" className="text-sm font-bold uppercase tracking-wider text-[#F5F5F5]">PONUDBA</Link>}>
            <PonudbaMenu />
          </Suspense>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active(pathname, item.href) ? "page" : undefined}
              className={`text-sm font-bold uppercase tracking-wider transition-colors ${
                active(pathname, item.href)
                  ? "text-white underline decoration-[#E31B2B] decoration-2 underline-offset-8"
                  : "text-[#B9BDC5] hover:text-white"
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
            className={`${iconBtnClass} hover:border-[#25D366]`}
          >
            <WhatsAppIcon className="h-[19px] w-[19px] text-[#25D366]" />
          </ExternalLink>
          <ExternalLink
            href={facebook}
            aria-label="Facebook EL-MOTO"
            className={`hidden sm:inline-flex ${iconBtnClass}`}
          >
            <Facebook aria-hidden className="h-[18px] w-[18px]" />
          </ExternalLink>
          <ExternalLink
            href={instagram}
            aria-label="Instagram @elmoto.si"
            className={`hidden sm:inline-flex ${iconBtnClass}`}
          >
            <Instagram aria-hidden className="h-[18px] w-[18px]" />
          </ExternalLink>
          <button
            ref={buttonRef}
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/14 bg-[#1B1D22] text-[#F5F5F5] hover:border-white/35 sm:h-11 sm:w-11 xl:hidden"
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
          className="fixed inset-x-0 top-[4.5rem] bottom-0 z-50 h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-white/10 bg-[#111216] px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-4 text-[#F5F5F5] uppercase md:top-20 md:h-[calc(100dvh-5rem)] xl:hidden"
        >
          <p id={titleId} className="sr-only">
            MOBILNI MENI
          </p>
          <nav aria-label="Mobilna navigacija" className="grid">
            <div className="border-b border-white/10 py-1.5">
              <button
                type="button"
                onClick={() => setMobileOfferOpen((v) => !v)}
                aria-expanded={mobileOfferOpen}
                className="flex w-full items-center justify-between py-3 text-xl font-bold uppercase tracking-wide text-[#F5F5F5]"
              >
                <span>PONUDBA</span>
                <ChevronDown
                  aria-hidden
                  className={`h-5 w-5 text-[#E31B2B] transition-transform duration-200 ${mobileOfferOpen ? "rotate-180" : ""}`}
                />
              </button>
              {mobileOfferOpen ? (
                <div className="mt-1 grid gap-1 rounded-[10px] bg-[#1B1D22] p-2 mb-2">
                  <PonudbaLinks onNavigate={() => setOpen(false)} />
                </div>
              ) : null}
            </div>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active(pathname, item.href) ? "page" : undefined}
                className={`border-b border-white/10 py-4 text-xl font-bold uppercase tracking-wide ${
                  active(pathname, item.href) ? "text-[#E31B2B]" : "text-[#F5F5F5]"
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
                className="flex h-12 items-center justify-center rounded-[10px] border border-white/14 bg-[#25272D] text-[#F5F5F5] hover:border-[#E31B2B]"
              >
                <Phone aria-hidden className="h-5 w-5" />
              </a>
              <ExternalLink
                href={whatsappUrl}
                aria-label={`WhatsApp ${phoneDisplay}`}
                className="flex h-12 items-center justify-center rounded-[10px] border border-white/14 bg-[#25272D] text-[#25D366] hover:border-[#25D366]"
              >
                <WhatsAppIcon className="h-5 w-5" />
              </ExternalLink>
              <ExternalLink
                href={facebook}
                aria-label="Facebook EL-MOTO"
                className="flex h-12 items-center justify-center rounded-[10px] border border-white/14 bg-[#25272D] text-[#F5F5F5] hover:border-[#E31B2B]"
              >
                <Facebook aria-hidden className="h-5 w-5" />
              </ExternalLink>
              <ExternalLink
                href={instagram}
                aria-label="Instagram @elmoto.si"
                className="flex h-12 items-center justify-center rounded-[10px] border border-white/14 bg-[#25272D] text-[#F5F5F5] hover:border-[#E31B2B]"
              >
                <Instagram aria-hidden className="h-5 w-5" />
              </ExternalLink>
            </div>
            <a className="btn btn-primary w-full uppercase" href={`tel:${phoneTel}`}>
              <Phone aria-hidden className="h-4 w-4" />
              POKLIČI {phoneDisplay}
            </a>
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-sm text-[#B9BDC5]">
              <ExternalLink href={avtoNetUrl} className="inline-flex min-h-10 items-center font-semibold uppercase underline hover:text-white">
                PONUDBA NA AVTO.NET
              </ExternalLink>
              <CompareLink className="inline-flex min-h-10 items-center font-semibold uppercase underline hover:text-white" always />
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
  const here =
    pathname.startsWith("/motorji") ||
    pathname.startsWith("/kove") ||
    pathname.startsWith("/uvoz") ||
    pathname.startsWith("/najem") ||
    pathname.startsWith("/oprema");

  if (seenPath !== pathname) {
    setSeenPath(pathname);
    setOpen(false);
  }

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
    <div ref={ref} className="relative">
      <button
        type="button"
        className={`inline-flex min-h-11 items-center gap-1.5 text-sm font-bold uppercase tracking-wider transition-colors ${
          here
            ? "text-white underline decoration-[#E31B2B] decoration-2 underline-offset-8"
            : "text-[#B9BDC5] hover:text-white"
        }`}
        aria-expanded={open}
        aria-controls="ponudba-menu"
        onClick={() => setOpen((value) => !value)}
      >
        PONUDBA
        <ChevronDown aria-hidden className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? (
        <div
          id="ponudba-menu"
          className="absolute left-0 top-full z-20 mt-2 min-w-60 rounded-[12px] border border-white/12 bg-[#1B1D22] p-2 shadow-[0_18px_40px_rgba(0,0,0,0.55)]"
        >
          <PonudbaLinks onNavigate={() => setOpen(false)} />
        </div>
      ) : null}
    </div>
  );
}

function PonudbaLinks({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  return (
    <>
      {ponudbaLinks.map((item) => {
        const current = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={current ? "page" : undefined}
            className={`flex min-h-11 items-center rounded-[8px] px-3.5 text-sm font-bold uppercase tracking-wide transition-colors ${
              current
                ? "bg-[#E31B2B] text-white"
                : "text-[#F5F5F5]/90 hover:bg-[#25272D] hover:text-white"
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
