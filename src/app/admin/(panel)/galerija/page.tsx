import Link from "next/link";
import { deleteMedia, uploadMedia } from "@/lib/actions/admin";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminGalerijaPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const query = await searchParams;
  const photos = await prisma.mediaAsset.findMany({
    where: { kind: "gallery" },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <section className="grid gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="display text-4xl text-[#16181c]">Galerija slik</h1>
          <p className="mt-1 text-sm text-[#4e555d]">
            Dodaj in upravljaj fotografije, ki se prikazujejo v javni galeriji EL-MOTO.
          </p>
        </div>
        <Link
          href="/galerija"
          target="_blank"
          className="rounded-[10px] border border-black/15 bg-white px-4 py-2 text-sm font-semibold text-[#16181c] transition-colors hover:border-black/30 hover:bg-[#f8f9fa]"
        >
          Odpri javno galerijo ↗
        </Link>
      </div>

      {query.saved ? (
        <p className="rounded-[10px] border border-emerald-500/30 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
          Galerija je bila uspešno posodobljena.
        </p>
      ) : null}
      {query.error ? (
        <p className="rounded-[10px] border border-[#E31B2B]/40 bg-red-50 px-4 py-3 text-sm font-semibold text-[#E31B2B]">
          Pri nalaganju je prišlo do napake ({query.error}). Preveri datoteko (dovoljeni so JPG, PNG, WebP do 10 MB).
        </p>
      ) : null}

      {/* OBRAZEC ZA DODAJANJE NOVE SLIKE */}
      <form action={uploadMedia} className="grid gap-4 rounded-[14px] border border-black/10 bg-white p-5 sm:p-6 shadow-2xs">
        <div>
          <h2 className="display text-2xl text-[#16181c]">Dodaj novo sliko v galerijo</h2>
          <p className="mt-1 text-xs text-[#5B616B]">Izberi sliko iz računalnika in vpiši morebiten opis.</p>
        </div>

        <input type="hidden" name="returnTo" value="/admin/galerija" />
        <input type="hidden" name="kind" value="gallery" />

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="field sm:col-span-2">
            <span>Izberi sliko *</span>
            <input
              name="file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required
              className="file:mr-4 file:rounded-md file:border-0 file:bg-[#16181c] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-[#E31B2B]"
            />
          </label>

          <label className="field">
            <span>Opis slike / naslov (neobvezno)</span>
            <input name="alt" type="text" placeholder="npr. Salon EL-MOTO Trzin ali Predaja motorja Kove" />
          </label>

          <label className="field">
            <span>Povezava ob kliku (neobvezno)</span>
            <input name="linkUrl" type="url" placeholder="https://..." />
          </label>
        </div>

        <div className="pt-2">
          <button type="submit" className="btn btn-primary w-full sm:w-auto">
            Naloži v galerijo
          </button>
        </div>
      </form>

      {/* PRIKAZ OBSTOJEČIH SLIK */}
      <div className="grid gap-4 rounded-[14px] border border-black/10 bg-white p-5 sm:p-6 shadow-2xs">
        <div className="flex items-center justify-between">
          <h2 className="display text-2xl text-[#16181c]">Naložene fotografije ({photos.length})</h2>
        </div>

        {photos.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((item) => (
              <article
                key={item.id}
                className="group relative flex flex-col overflow-hidden rounded-[12px] border border-black/10 bg-[#f8f9fa] transition hover:shadow-md"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={item.alt || "Galerijska slika"}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between p-3.5">
                  <div>
                    <p className="text-sm font-semibold text-[#16181c]">
                      {item.alt || <span className="italic text-[#888]">Brez opisa</span>}
                    </p>
                    {item.linkUrl ? (
                      <p className="mt-1 truncate text-xs text-[#5B616B]">Povezava: {item.linkUrl}</p>
                    ) : null}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-black/8 pt-2.5">
                    <span className="text-[11px] text-[#888]">
                      {new Date(item.createdAt).toLocaleDateString("sl-SI")}
                    </span>
                    <form action={deleteMedia}>
                      <input type="hidden" name="returnTo" value="/admin/galerija" />
                      <input type="hidden" name="id" value={item.id} />
                      <button
                        type="submit"
                        className="text-xs font-semibold text-[#E31B2B] transition hover:underline"
                        onClick={(e) => {
                          if (!confirm("Ali ste prepričani, da želite odstraniti to sliko iz galerije?")) {
                            e.preventDefault();
                          }
                        }}
                      >
                        Odstrani sliko
                      </button>
                    </form>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[10px] border border-dashed border-black/20 p-8 text-center">
            <p className="text-sm font-medium text-[#4e555d]">
              Trenutno v galeriji še ni naloženih fotografij. Uporabi zgornji obrazec za prvo naloženo sliko.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
