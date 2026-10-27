import Link from "next/link";
import { setOfferAction } from "@/lib/actions/admin";
import { prisma } from "@/lib/db";
import { ensureDbSynced } from "@/lib/shared-store";
import { conditionLabel, displayName, formatCc, formatKm, formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

function priceLabel(cents: number | null, confirmed: boolean) {
  if (confirmed && cents && cents > 0) return formatPrice(cents, true);
  return "Cena na povpraševanje";
}

function statusBadge(status: string) {
  if (status === "SOLD") {
    return (
      <span className="inline-flex items-center rounded-md border border-red-600/25 bg-red-50 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-red-700">
        Prodano
      </span>
    );
  }
  if (status === "RESERVED") {
    return (
      <span className="inline-flex items-center rounded-md border border-amber-600/25 bg-amber-50 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-amber-800">
        Rezervirano
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-md border border-emerald-600/25 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-emerald-800">
      Na voljo
    </span>
  );
}

export default async function AdminHome({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; error?: string; ok?: string }>;
}) {
  await ensureDbSynced();
  const query = await searchParams;
  const q = (query.q ?? "").trim().toLocaleLowerCase("sl");
  const status = query.status ?? "";
  const bikes = await prisma.motorcycle.findMany({
    where: { publication: "PUBLISHED" },
    include: { images: { orderBy: { sortOrder: "asc" } } },
    orderBy: [{ createdAt: "desc" }, { updatedAt: "desc" }],
  });

  const visible = bikes.filter((bike) => {
    const normalizedStatus = bike.status === "UNKNOWN" ? "AVAILABLE" : bike.status;
    if (status && normalizedStatus !== status) return false;
    if (!q) return true;
    return `${bike.brand} ${bike.model} ${bike.variant} ${bike.year ?? ""}`.toLocaleLowerCase("sl").includes(q);
  });

  const counts = {
    published: bikes.length,
    available: bikes.filter((bike) => bike.status === "AVAILABLE" || bike.status === "UNKNOWN").length,
    featured: bikes.filter((bike) => bike.featured && bike.status !== "SOLD").length,
    reservedOrSold: bikes.filter((bike) => bike.status === "RESERVED" || bike.status === "SOLD").length,
  };

  const when = new Intl.DateTimeFormat("sl-SI", { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="display text-4xl text-[#16181c]">Ponudba motorjev</h1>
          <p className="mt-1 text-sm text-[#4e555d]">
            Pregled vseh objavljenih motorjev. Tukaj lahko motor urediš, označiš kot prodanega, izpostaviš na naslovnici ali odstraniš.
          </p>
        </div>
        <Link className="btn btn-primary" href="/admin/motorji/nov">
          + Dodaj motor
        </Link>
      </div>

      {query.error ? (
        <p className="rounded-[10px] border border-[#E31B2B]/40 bg-red-50 px-4 py-3 text-sm font-semibold text-[#E31B2B]" role="alert">
          {query.error}
        </p>
      ) : null}
      {query.ok ? (
        <p className="rounded-[10px] border border-emerald-600/30 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900" role="status">
          Sprememba je bila uspešno shranjena in osvežena na spletni strani.
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Vsi oglasi", counts.published],
          ["Na voljo", counts.available],
          ["Na naslovnici", counts.featured],
          ["Rezervirani / Prodani", counts.reservedOrSold],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-[12px] border border-black/10 bg-white p-4 shadow-2xs">
            <span className="block text-xs font-bold uppercase tracking-wider text-[#4e555d]">{label}</span>
            <strong className="display mt-1.5 block text-4xl text-[#16181c]">{value}</strong>
          </div>
        ))}
      </div>

      <form method="get" className="grid gap-3 rounded-[12px] border border-black/10 bg-white p-4 sm:grid-cols-[1fr_14rem_auto]">
        <label className="field">
          <span>Iskanje po znamki, modelu ali letniku</span>
          <input name="q" defaultValue={query.q ?? ""} placeholder="npr. KOVE, Yamaha, Tracer, 2025 ..." />
        </label>
        <label className="field">
          <span>Razpoložljivost</span>
          <select name="status" defaultValue={status}>
            <option value="">Vsi oglasi</option>
            <option value="AVAILABLE">Na voljo</option>
            <option value="RESERVED">Rezervirano</option>
            <option value="SOLD">Prodano</option>
          </select>
        </label>
        <div className="flex items-end gap-2">
          <button className="btn btn-primary min-h-12 px-5">Filtriraj</button>
          {q || status ? (
            <Link href="/admin" className="btn btn-secondary min-h-12 px-4">
              Počisti
            </Link>
          ) : null}
        </div>
      </form>

      <div className="grid gap-3">
        {visible.length === 0 ? (
          <div className="rounded-[12px] border border-dashed border-black/20 bg-white p-8 text-center">
            <p className="text-lg font-semibold text-[#16181c]">
              {bikes.length === 0 ? "V ponudbi trenutno še ni dodanih motorjev." : "Ni motorjev za izbrani filter."}
            </p>
            <p className="mt-1 text-sm text-[#4e555d]">
              {bikes.length === 0
                ? "Klikni na gumb »+ Dodaj motor«, vnesi podatke in motor se bo takoj prikazal v katalogu ter v sekciji NOVO V PONUDBI na naslovnici."
                : "Poskusi spremeniti iskalni niz ali počistiti filter."}
            </p>
            {bikes.length === 0 ? (
              <Link className="btn btn-primary mt-4" href="/admin/motorji/nov">
                + Dodaj prvi motor
              </Link>
            ) : null}
          </div>
        ) : null}

        {visible.map((bike) => {
          const cover = bike.images.find((image) => image.isCover) ?? bike.images[0];
          const cond = conditionLabel(bike.condition);
          const metaParts = [
            bike.year ? `Letnik ${bike.year}` : "Letnik ni vpisan",
            formatKm(bike.mileageKm),
            formatCc(bike.engineCc),
          ].filter(Boolean);

          return (
            <article
              key={bike.id}
              className="grid gap-4 rounded-[12px] border border-black/10 bg-white p-4 shadow-2xs sm:grid-cols-[8.5rem_minmax(0,1fr)]"
            >
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cover.url}
                  alt={displayName(bike)}
                  className="h-32 w-full rounded-[10px] border border-black/10 object-cover sm:h-full"
                />
              ) : (
                <div className="grid h-32 place-items-center rounded-[10px] border border-dashed border-black/15 bg-[#f6f6f4] text-xs font-medium text-[#4e555d] sm:h-full">
                  Brez fotografije
                </div>
              )}

              <div className="grid gap-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      {statusBadge(bike.status)}
                      {cond ? (
                        <span className="inline-flex items-center rounded-md border border-black/15 bg-[#f6f6f4] px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-[#16181c]">
                          {cond}
                        </span>
                      ) : null}
                      {bike.featured ? (
                        <span className="inline-flex items-center rounded-md border border-[#E31B2B]/30 bg-[#E31B2B]/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-[#E31B2B]">
                          ★ Na naslovnici (Novo v ponudbi)
                        </span>
                      ) : null}
                    </div>
                    <h2 className="display mt-2 text-2xl text-[#16181c]">{displayName(bike)}</h2>
                    <p className="mt-1 text-sm font-medium text-[#4e555d]">{metaParts.join(" · ")}</p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="display text-2xl font-bold text-[#16181c]">
                      {priceLabel(bike.priceCents, bike.priceConfirmed)}
                    </p>
                    <p className="text-xs text-[#4e555d]">Posodobljeno: {when.format(bike.updatedAt)}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t border-black/10 pt-3">
                  <Link className="btn btn-primary min-h-10 px-4 py-2 text-sm" href={`/admin/motorji/${bike.id}`}>
                    Uredi motor
                  </Link>
                  <Link
                    className="btn btn-secondary min-h-10 px-3.5 py-2 text-sm"
                    href={`/motorji/${bike.slug}`}
                    target="_blank"
                  >
                    Poglej na strani ↗
                  </Link>
                  {bike.sourceUrl ? (
                    <a
                      className="btn btn-secondary min-h-10 px-3.5 py-2 text-sm"
                      href={bike.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Avto.net ↗
                    </a>
                  ) : null}

                  <form action={setOfferAction}>
                    <input type="hidden" name="id" value={bike.id} />
                    <input type="hidden" name="offerAction" value={bike.featured ? "unfeature" : "feature"} />
                    <button className="btn btn-secondary min-h-10 px-3.5 py-2 text-sm">
                      {bike.featured ? "Umik z naslovnice" : "Prikaži na naslovnici"}
                    </button>
                  </form>

                  {bike.status !== "SOLD" ? (
                    <form action={setOfferAction}>
                      <input type="hidden" name="id" value={bike.id} />
                      <input type="hidden" name="offerAction" value="sold" />
                      <button className="btn btn-secondary min-h-10 px-3.5 py-2 text-sm">Označi kot prodano</button>
                    </form>
                  ) : (
                    <form action={setOfferAction}>
                      <input type="hidden" name="id" value={bike.id} />
                      <input type="hidden" name="offerAction" value="available" />
                      <button className="btn btn-secondary min-h-10 px-3.5 py-2 text-sm">Označi kot na voljo</button>
                    </form>
                  )}

                  <form action={setOfferAction} className="sm:ml-auto">
                    <input type="hidden" name="id" value={bike.id} />
                    <input type="hidden" name="offerAction" value="delete" />
                    <button className="btn btn-secondary min-h-10 border-[#E31B2B]/40 px-3.5 py-2 text-sm text-[#E31B2B] hover:border-[#E31B2B] hover:bg-red-50">
                      Odstrani oglas
                    </button>
                  </form>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
