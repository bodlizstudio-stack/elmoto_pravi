import Link from "next/link";
import { setOfferAction } from "@/lib/actions/admin";
import { prisma } from "@/lib/db";
import { availabilityLabel } from "@/lib/offer";
import { ensureDbSynced } from "@/lib/shared-store";
import { displayName, formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

function priceLabel(cents: number | null, confirmed: boolean) {
  if (confirmed && cents && cents > 0) return formatPrice(cents, true);
  return "Na povpraševanje";
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
    if (status && bike.status !== status) return false;
    if (!q) return true;
    return `${bike.brand} ${bike.model} ${bike.variant}`.toLocaleLowerCase("sl").includes(q);
  });
  const counts = {
    published: bikes.length,
    reserved: bikes.filter((bike) => bike.status === "RESERVED").length,
    sold: bikes.filter((bike) => bike.status === "SOLD").length,
  };
  const when = new Intl.DateTimeFormat("sl-SI", { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold">Ponudba</h1>
        <Link className="btn btn-primary" href="/admin/motorji/nov">
          Dodaj motor
        </Link>
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
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Aktivni oglasi", counts.published],
          ["Rezervirani", counts.reserved],
          ["Prodani", counts.sold],
        ].map(([label, value]) => (
          <p key={String(label)} className="rounded-[12px] border border-black/10 bg-white p-4">
            <span className="block text-sm text-ink/60">{label}</span>
            <strong className="mt-1 block text-3xl">{value}</strong>
          </p>
        ))}
      </div>
      <form method="get" className="grid gap-3 rounded-[12px] border border-black/10 bg-white p-4 sm:grid-cols-3">
        <label className="field">
          <span>Iskanje</span>
          <input name="q" defaultValue={query.q ?? ""} placeholder="Znamka ali naziv" />
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
                    {availabilityLabel(bike.status) || "Na voljo"}
                  </p>
                  <p className="text-sm text-ink/60">Zadnja sprememba: {when.format(bike.updatedAt)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link className="btn btn-primary min-h-11" href={`/admin/motorji/${bike.id}`}>
                    Uredi
                  </Link>
                  {bike.status !== "SOLD" ? (
                    <form action={setOfferAction}>
                      <input type="hidden" name="id" value={bike.id} />
                      <input type="hidden" name="offerAction" value="sold" />
                      <button className="btn btn-secondary min-h-11">Označi kot prodano</button>
                    </form>
                  ) : (
                    <form action={setOfferAction}>
                      <input type="hidden" name="id" value={bike.id} />
                      <input type="hidden" name="offerAction" value="available" />
                      <button className="btn btn-secondary min-h-11">Označi kot na voljo</button>
                    </form>
                  )}
                  <form action={setOfferAction}>
                    <input type="hidden" name="id" value={bike.id} />
                    <input type="hidden" name="offerAction" value="delete" />
                    <button className="btn btn-secondary min-h-11 border-accent/40 text-accent hover:border-accent hover:bg-accent/5">
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
