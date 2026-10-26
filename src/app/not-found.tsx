import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="vsebina" className="public-site grid min-h-[70svh] place-items-center bg-[#f6f6f4] px-6 py-16 text-center text-ink">
        <div>
          <p className="text-sm font-semibold text-accent">404</p>
          <h1 className="display mt-3 text-5xl sm:text-7xl">Stran ni najdena</h1>
          <p className="mx-auto mt-4 max-w-md text-ink/70">Naslov ne obstaja ali oglas ni več objavljen.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link className="btn btn-primary" href="/">Domov</Link>
            <Link className="btn btn-secondary" href="/motorji">Motorji</Link>
          </div>
        </div>
      </main>
    </>
  );
}
