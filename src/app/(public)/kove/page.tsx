import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ExternalLink } from "@/components/external-link";
import { publishedKoveModels } from "@/lib/kove";
import { koveCatalogUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "KOVE",
  description: "EL-MOTO je pooblaščeni prodajalec motociklov KOVE. Spoznaj izbrane modele in pošlji povpraševanje.",
  alternates: { canonical: "/kove" },
};

export default function KovePage() {
  return (
    <section className="bg-[#f6f6f4] py-8 text-ink sm:py-12">
      <div className="wrap">
        <Breadcrumbs items={[{ href: "/", label: "Domov" }, { label: "KOVE" }]} />
        <p className="mt-6 text-sm font-semibold tracking-wide text-accent">KOVE pri EL-MOTO</p>
        <h1 className="display mt-2 max-w-3xl text-4xl sm:text-6xl">Pooblaščeni prodajalec motociklov KOVE</h1>
        <p className="mt-4 max-w-2xl text-[17px] leading-7 text-ink/80">
          Spoznaj motocikle KOVE in poišči model za svoj način vožnje. Pri EL-MOTO ti pomagamo pri izbiri ter preverimo ponudbo in dobavljivost.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a className="btn btn-secondary w-full sm:w-auto" href="#modeli">
            Razišči modele KOVE
          </a>
          <Link className="btn btn-primary w-full sm:w-auto" href="/kontakt?vrsta=PURCHASE&model=KOVE">
            Povprašaj za KOVE
          </Link>
        </div>
        <p className="mt-6 max-w-2xl text-sm leading-6 text-ink/65">
          Spodnji modeli so predstavitev znamke po uradnem katalogu, preverjenem 26. 10. 2026. Niso zaloga EL-MOTO. Cene in pogoje preveriš pri nas.
        </p>

        <div id="modeli" className="mt-10 scroll-mt-24">
          {publishedKoveModels.length ? (
            <div className="grid gap-4 lg:grid-cols-3">
              {publishedKoveModels.map((model) => (
                <article key={model.slug} className="flex h-full flex-col rounded-[12px] border border-black/10 bg-white">
                  <div className="relative aspect-[3/2] bg-white">
                    <Image
                      src={model.image}
                      alt={`${model.name}, fotografija iz uradnega kataloga kove.si`}
                      fill
                      sizes="(min-width: 1024px) 30vw, 100vw"
                      className="object-contain p-3"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="text-2xl font-semibold">{model.name}</h2>
                    <p className="mt-3 text-[17px] leading-7 text-ink/80">{model.description}</p>
                    <ul className="mt-4 grid gap-1 text-sm text-ink/75">
                      {model.features.slice(0, 3).map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                    <div className="mt-auto grid gap-2 pt-5">
                      <Link className="btn btn-primary w-full" href={`/kontakt?vrsta=PURCHASE&model=${encodeURIComponent(model.name)}`}>
                        Povprašaj za ta model
                      </Link>
                      <ExternalLink href={model.sourceUrl} className="inline-flex min-h-11 items-center justify-center text-sm font-semibold underline">
                        Uradni vir
                      </ExternalLink>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="rounded-[12px] border border-black/10 bg-white p-6 leading-7">
              Kartice modelov bodo objavljene, ko bodo na voljo fotografije točno teh modelov.
            </p>
          )}
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <ExternalLink href={koveCatalogUrl} className="btn btn-secondary w-full sm:w-auto">
            Uradni katalog KOVE
          </ExternalLink>
          <Link className="btn btn-secondary w-full sm:w-auto" href="/motorji?brand=KOVE">
            Objavljeni motorji KOVE
          </Link>
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/60">
          Povezava na objavljene motorje pokaže vozila, ki so vpisana v ponudbi na tej strani. Katalog zgoraj ni seznam zaloge.
        </p>
      </div>
    </section>
  );
}
