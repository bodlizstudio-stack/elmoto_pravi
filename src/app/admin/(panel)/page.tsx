import Link from "next/link";
import { setOfferAction } from "@/lib/actions/admin";
import { prisma } from "@/lib/db";
import { availabilityLabel, publicationLabel } from "@/lib/offer";
import { displayName, formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

function priceLabel(cents: number | null, confirmed: boolean) {
  if (confirmed && cents && cents > 0) return formatPrice(cents, true);
  return "Na povpraševanje";
}

export default async function AdminHome({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; publication?: string; status?: string; error?: string; ok?: string }>;
}) {
  const query = await searchParams;
  const q = (query.q ?? "").trim().toLocaleLowerCase("sl");
  const publication = query.publication ?? "";
  const status = query.status ?? "";
  const bikes = await prisma.motorcycle.findMany({
    include: { images: { orderBy: { sortOrder: "asc" } } },
    orderBy: { updatedAt: "desc" },
  });
  const visible = bikes.filter((bike) => {
    if (publication && bike.publication !== publication) return false;
    if (status && bike.status !== status) return false;
    if (!q) return true;
    return `${bike.brand} ${bike.model} ${bike.variant}`.toLocaleLowerCase("sl").includes(q);
  });
  const counts = {
    published: bikes.filter((bike) => bike.publication === "PUBLISHED").length,
    drafts: bikes.filter((bike) => bike.publication === "DRAFT").length,
    reserved: bikes.filter((bike) => bike.status === "RESERVED" && bike.publication !== "ARCHIVED").length,
    sold: bikes.filter((bike) => bike.status === "SOLD" && bike.publication !== "ARCHIVED").length,
  };
  const when = new Intl.DateTimeFormat("sl-SI", { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold">Motorji v ponudbi</h1>
        <div className="flex flex-wrap gap-2">
          <Link className="btn btn-primary" href="/admin/motorji/nov?mode=avtonet">
            Uvozi motor iz Avto.net
          </Link>
          <Link className="btn btn-secondary" href="/admin/motorji/nov?mode=manual">
            Dodaj motor
          </Link>
        </div>
      </div>
      {query.error ? (
        <p className="border border-accent/40 bg-white p-3 text-sm text-accent" role="alert">
          {query.error}
        </p>
      ) : null}
      {query.ok ? (
        <p className="border border-black/10 bg-white p-3 text-sm" role="status">
          Sprememba je shranjena.
        </p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          ["Objavljeni", counts.published],
          ["Osnutki", counts.drafts],
          ["Rezervirani", counts.reserved],
          ["Prodani", counts.sold],
        ].map(([label, value]) => (
          <p key={String(label)} className="rounded-[12px] border border-black/10 bg-white p-4">
            <span className="block text-sm text-ink/60">{label}</span>
            <strong className="mt-1 block text-3xl">{value}</strong>
          </p>
        ))}
      </div>
      <form method="get" className="grid gap-3 rounded-[12px] border border-black/10 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="field">
          <span>Iskanje</span>
          <input name="q" defaultValue={query.q ?? ""} placeholder="Znamka ali naziv" />
        </label>
        <label className="field">
          <span>Objava</span>
          <select name="publication" defaultValue={publication}>
            <option value="">Vsa stanja</option>
            <option value="PUBLISHED">Objavljeno</option>
            <option value="DRAFT">Osnutek</option>
            <option value="ARCHIVED">Arhivirano</option>
          </select>
        </label>
        <label className="field">
          <span>Razpoložljivost</span>
          <select name="status" defaultValue={status}>
            <option value="">Vse</option>
            <option value="UNKNOWN">Preveri po povpraševanju</option>
            <option value="AVAILABLE">Na voljo</option>
            <option value="RESERVED">Rezervirano</option>
            <option value="SOLD">Prodano</option>
          </select>
        </label>
        <button className="btn btn-secondary self-end">Pokaži</button>
      </form>
      <div className="grid gap-3">
        {visible.length === 0 ? <p className="rounded-[12px] border border-black/10 bg-white p-4">Ni motorjev za ta filter.</p> : null}
        {visible.map((bike) => {
          const cover = bike.images.find((image) => image.isCover) ?? bike.images[0];
          return (
            <article key={bike.id} className="grid gap-4 rounded-[12px] border border-black/10 bg-white p-4 sm:grid-cols-[6.5rem_minmax(0,1fr)]">
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cover.url} alt="" className="h-24 w-full rounded-[8px] object-cover sm:h-full" />
              ) : (
                <div className="grid h-24 place-items-center rounded-[8px] bg-[#f6f6f4] text-xs text-ink/50">Brez fotografije</div>
              )}
              <div className="grid gap-3">
                <div>
                  <h2 className="text-xl font-semibold">{displayName(bike)}</h2>
                  <p className="mt-1 text-sm leading-6 text-ink/70">
                    {bike.year ?? "Letnik ni vpisan"} · {priceLabel(bike.priceCents, bike.priceConfirmed)}
                  </p>
                  <p className="mt-1 text-sm leading-6">
                    {publicationLabel(bike.publication)} · {availabilityLabel(bike.status) || "Brez oznake"} ·{" "}
                    {bike.featured ? "Na naslovnici" : "Ni na naslovnici"}
                  </p>
                  <p className="text-sm text-ink/60">Zadnja sprememba: {when.format(bike.updatedAt)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link className="btn btn-primary min-h-11" href={`/admin/motorji/${bike.id}`}>
                    Uredi
                  </Link>
                  {bike.publication !== "PUBLISHED" ? (
                    <form action={setOfferAction}>
                      <input type="hidden" name="id" value={bike.id} />
                      <input type="hidden" name="offerAction" value="publish" />
                      <button className="btn btn-secondary min-h-11">Objavi</button>
                    </form>
                  ) : (
                    <form action={setOfferAction}>
                      <input type="hidden" name="id" value={bike.id} />
                      <input type="hidden" name="offerAction" value="draft" />
                      <button className="btn btn-secondary min-h-11">Umakni v osnutek</button>
                    </form>
                  )}
                  {bike.status !== "SOLD" ? (
                    <form action={setOfferAction}>
                      <input type="hidden" name="id" value={bike.id} />
                      <input type="hidden" name="offerAction" value="sold" />
                      <button className="btn btn-secondary min-h-11">Označi kot prodano</button>
                    </form>
                  ) : null}
                  {bike.publication === "ARCHIVED" ? (
                    <form action={setOfferAction}>
                      <input type="hidden" name="id" value={bike.id} />
                      <input type="hidden" name="offerAction" value="restore" />
                      <button className="btn btn-secondary min-h-11">Obnovi v osnutek</button>
                    </form>
                  ) : (
                    <form action={setOfferAction}>
                      <input type="hidden" name="id" value={bike.id} />
                      <input type="hidden" name="offerAction" value="archive" />
                      <button className="btn btn-secondary min-h-11">Arhiviraj</button>
                    </form>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
