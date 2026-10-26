"use client";

import Link from "next/link";
import { Suspense, useEffect, useId, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, Menu, Phone, X } from "lucide-react";
import { CompareLink } from "@/components/compare-button";
import { ExternalLink } from "@/components/external-link";
import { LogoLink } from "@/components/logo";
import { avtoNetUrl, navItems, saleLinks, site } from "@/lib/site";

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
    <header className="sticky top-0 z-50 border-b border-[#e2e5e9] bg-white text-ink">
      <div className="wrap relative flex h-[4.5rem] items-center justify-between gap-3 md:h-20">
        <LogoLink className="h-10 w-auto md:h-12" />
        <nav aria-label="Glavna navigacija" className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-5 xl:flex">
          <Suspense fallback={<Link href="/motorji" className="text-sm font-semibold">Motorji</Link>}>
            <MotorjiMenu />
          </Suspense>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active(pathname, item.href) ? "page" : undefined}
              className={`text-sm font-semibold ${active(pathname, item.href) ? "text-ink underline decoration-accent decoration-2 underline-offset-8" : "text-ink/75 hover:text-ink"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a className="hidden items-center px-1 text-sm font-semibold text-ink lg:inline-flex" href={`tel:${site.phoneTel}`}>
            {site.phoneDisplay}
          </a>
          <Link className="btn btn-primary hidden px-4 md:inline-flex" href="/motorji">
            Ponudba motorjev
          </Link>
          <a
            className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-[#e2e5e9] text-ink lg:hidden"
            href={`tel:${site.phoneTel}`}
            aria-label={`Pokliči ${site.phoneDisplay}`}
          >
            <Phone aria-hidden className="h-5 w-5" />
          </a>
          <button
            ref={buttonRef}
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-[#e2e5e9] text-ink xl:hidden"
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
        className={`mobile-menu fixed inset-x-0 bottom-0 top-[4.5rem] z-50 overflow-y-auto bg-white px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4 text-ink md:top-20 xl:hidden ${open ? "open" : ""}`}
      >
        <p id={titleId} className="sr-only">
          Mobilni meni
        </p>
        <Link className="btn btn-primary mb-4 w-full" href="/motorji" onClick={() => setOpen(false)}>
          Ponudba motorjev
        </Link>
        <nav aria-label="Mobilna navigacija" className="grid">
          <p className="pt-2 text-sm font-semibold text-ink/60">Motorji</p>
          <Suspense fallback={null}>
            <MotorjiLinks onNavigate={() => setOpen(false)} />
          </Suspense>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active(pathname, item.href) ? "page" : undefined}
              className="border-b border-black/10 py-4 text-2xl font-semibold"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 grid gap-3">
          <a className="btn btn-secondary w-full" href={`tel:${site.phoneTel}`}>
            Pokliči {site.phoneDisplay}
          </a>
          <ExternalLink href={avtoNetUrl} className="inline-flex min-h-11 items-center text-sm font-semibold underline">
            Ponudba na Avto.net
          </ExternalLink>
          <CompareLink className="inline-flex min-h-11 items-center text-sm font-semibold underline" always />
        </div>
      </div>
    </header>
  );
}

function MotorjiMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [seenPath, setSeenPath] = useState(pathname);
  const ref = useRef<HTMLDivElement>(null);
  const here = pathname.startsWith("/motorji");

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
        className={`inline-flex min-h-11 items-center gap-1 text-sm font-semibold ${here ? "text-ink underline decoration-accent decoration-2 underline-offset-8" : "text-ink/75 hover:text-ink"}`}
        aria-expanded={open}
        aria-controls="motorji-menu"
        onClick={() => setOpen((value) => !value)}
      >
        Motorji
        <ChevronDown aria-hidden className="h-4 w-4" />
      </button>
      <div id="motorji-menu" hidden={!open} className="absolute left-0 top-full z-20 mt-2 min-w-56 rounded-[12px] border border-black/10 bg-white p-2 shadow-[0_12px_32px_rgba(22,24,28,0.08)]">
        <MotorjiLinks onNavigate={() => setOpen(false)} />
      </div>
    </div>
  );
}

function MotorjiLinks({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  const search = useSearchParams();
  const condition = search.get("condition") || "";
  return (
    <>
      {saleLinks.map((item) => {
        const current = pathname === "/motorji" && condition === item.condition;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={current ? "page" : undefined}
            className={`flex min-h-11 items-center rounded-[8px] px-3 text-sm font-semibold ${current ? "bg-[#f6f6f4] text-ink" : "text-ink/80 hover:bg-[#f6f6f4]"}`}
            onClick={onNavigate}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
