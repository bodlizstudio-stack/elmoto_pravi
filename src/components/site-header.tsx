"use client";

import Link from "next/link";
import { Suspense, useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, Instagram, Menu, X } from "lucide-react";
import { CompareLink } from "@/components/compare-button";
import { ExternalLink } from "@/components/external-link";
import { LogoLink } from "@/components/logo";
import { avtoNetUrl, navItems, ponudbaLinks, site } from "@/lib/site";

function WhatsAppIcon({ className = "h-5 w-5" }: { className?: string }) {
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

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
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
    const panel = panelRef.current;
    const focusable = panel?.querySelectorAll<HTMLElement>("a, button");
    focusable?.[0]?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
      if (event.key !== "Tab" || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-[#e2e5e9] bg-white text-ink uppercase">
      <div className="wrap relative flex h-[4.25rem] items-center justify-between gap-2 md:h-20">
        <LogoLink className="h-7 w-auto sm:h-9 md:h-11" />
        <nav aria-label="Glavna navigacija" className="hidden items-center gap-5 xl:flex">
          <Suspense fallback={<Link href="/motorji" className="text-sm font-semibold uppercase">PONUDBA</Link>}>
            <PonudbaMenu />
          </Suspense>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active(pathname, item.href) ? "page" : undefined}
              className={`text-sm font-semibold uppercase tracking-wide ${active(pathname, item.href) ? "text-ink underline decoration-accent decoration-2 underline-offset-8" : "text-ink/75 hover:text-ink"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <ExternalLink
            href={site.whatsappUrl}
            aria-label={`WhatsApp ${site.phoneDisplay}`}
            className="inline-flex h-10 items-center gap-1.5 rounded-[10px] border border-[#25D366]/35 bg-[#25D366]/10 px-2.5 text-xs font-bold text-[#128C7E] hover:bg-[#25D366]/20 sm:h-11 sm:px-3 sm:text-sm"
          >
            <WhatsAppIcon className="h-4 w-4 shrink-0 text-[#25D366] sm:h-5 sm:w-5" />
            <span>{site.phoneDisplay}</span>
          </ExternalLink>
          <ExternalLink
            href={site.instagram}
            aria-label="Instagram @elmoto.si"
            className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#e2e5e9] text-ink hover:border-ink sm:h-11 sm:w-11"
          >
            <Instagram aria-hidden className="h-5 w-5" />
          </ExternalLink>
          <Link className="btn btn-primary hidden px-4 uppercase md:inline-flex" href="/motorji">
            PONUDBA MOTORJEV
          </Link>
          <button
            ref={buttonRef}
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#e2e5e9] text-ink sm:h-11 sm:w-11 xl:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Zapri meni" : "Odpri meni"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X aria-hidden /> : <Menu aria-hidden />}
          </button>
        </div>
      </div>
      <div
        id="mobile-nav"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        hidden={!open}
        className={`mobile-menu fixed inset-x-0 bottom-0 top-[4.25rem] z-50 overflow-y-auto bg-white px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4 text-ink uppercase md:top-20 xl:hidden ${open ? "open" : ""}`}
      >
        <p id={titleId} className="sr-only">
          MOBILNI MENI
        </p>
        <Link className="btn btn-primary mb-4 w-full uppercase" href="/motorji" onClick={() => setOpen(false)}>
          PONUDBA MOTORJEV
        </Link>
        <nav aria-label="Mobilna navigacija" className="grid">
          <p className="pt-2 text-sm font-semibold uppercase text-ink/60">PONUDBA</p>
          <Suspense fallback={null}>
            <PonudbaLinks onNavigate={() => setOpen(false)} />
          </Suspense>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active(pathname, item.href) ? "page" : undefined}
              className="border-b border-black/10 py-4 text-2xl font-semibold uppercase"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 grid gap-3">
          <ExternalLink className="btn btn-secondary w-full uppercase" href={site.whatsappUrl}>
            <WhatsAppIcon className="h-5 w-5 text-[#25D366]" />
            WHATSAPP {site.phoneDisplay}
          </ExternalLink>
          <ExternalLink className="btn btn-secondary w-full uppercase" href={site.instagram}>
            <Instagram aria-hidden className="h-5 w-5" />
            INSTAGRAM
          </ExternalLink>
          <a className="btn btn-secondary w-full uppercase" href={`tel:${site.phoneTel}`}>
            POKLIČI {site.phoneDisplay}
          </a>
          <ExternalLink href={avtoNetUrl} className="inline-flex min-h-11 items-center text-sm font-semibold uppercase underline">
            PONUDBA NA AVTO.NET
          </ExternalLink>
          <CompareLink className="inline-flex min-h-11 items-center text-sm font-semibold uppercase underline" always />
        </div>
      </div>
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
        className={`inline-flex min-h-11 items-center gap-1 text-sm font-semibold uppercase tracking-wide ${here ? "text-ink underline decoration-accent decoration-2 underline-offset-8" : "text-ink/75 hover:text-ink"}`}
        aria-expanded={open}
        aria-controls="ponudba-menu"
        onClick={() => setOpen((value) => !value)}
      >
        PONUDBA
        <ChevronDown aria-hidden className="h-4 w-4" />
      </button>
      <div id="ponudba-menu" hidden={!open} className="absolute left-0 top-full z-20 mt-2 min-w-56 rounded-[12px] border border-black/10 bg-white p-2 shadow-[0_12px_32px_rgba(22,24,28,0.08)]">
        <PonudbaLinks onNavigate={() => setOpen(false)} />
      </div>
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
            className={`flex min-h-11 items-center rounded-[8px] px-3 text-sm font-semibold uppercase ${current ? "bg-[#f6f6f4] text-ink" : "text-ink/80 hover:bg-[#f6f6f4]"}`}
            onClick={onNavigate}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
