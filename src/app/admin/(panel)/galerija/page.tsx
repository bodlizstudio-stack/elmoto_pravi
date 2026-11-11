import Link from "next/link";
import { AdminDeleteButton } from "@/components/admin-delete-button";
import { GalleryUploader } from "@/components/gallery-uploader";
import {
  clearPlaceholderGalleryPhotos,
  deleteAllGalleryPhotos,
  deleteMedia,
  saveMedia,
} from "@/lib/actions/admin";
import { prisma } from "@/lib/db";
import { ensureMediaSynced } from "@/lib/shared-store";

export const dynamic = "force-dynamic";

export default async function AdminGalerijaPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string; edit?: string }>;
}) {
  const query = await searchParams;
  await ensureMediaSynced({ force: true });

  // Najnovejše fotografije se vedno prikažejo na vrhu
  const photos = await prisma.mediaAsset.findMany({
    where: { kind: "gallery" },
    orderBy: [{ createdAt: "desc" }, { sortOrder: "asc" }],
  });

  const editingPhoto = query.edit ? photos.find((p) => p.id === query.edit) || null : null;
  const samplePhotosCount = photos.filter((p) => p.url.startsWith("/images/galerija/")).length;
  const uploadedPhotosCount = photos.length - samplePhotosCount;

  return (
    <section className="grid gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="display text-4xl text-[#16181c]">Galerija slik</h1>
          <p className="mt-1 text-sm text-[#4e555d]">
            Dodaj, uredi in upravljaj fotografije, ki se prikazujejo v javni galeriji EL-MOTO.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/galerija"
            target="_blank"
            className="rounded-[10px] border border-black/15 bg-white px-4 py-2 text-sm font-semibold text-[#16181c] transition-colors hover:border-black/30 hover:bg-[#f8f9fa]"
          >
            Odpri javno galerijo ↗
          </Link>
        </div>
      </div>

      {query.saved ? (
        <p className="rounded-[10px] border border-emerald-500/30 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
          ✓ Galerija je bila uspešno posodobljena.
        </p>
      ) : null}
      {query.error ? (
        <p className="rounded-[10px] border border-[#E31B2B]/40 bg-red-50 px-4 py-3 text-sm font-semibold text-[#E31B2B]">
          Pri obdelavi je prišlo do napake ({decodeURIComponent(query.error)}). Preveri datoteko ali povezavo do slike.
        </p>
      ) : null}

      {/* OPOZORILO / HITRA DEJANJA ZA VZORČNE SLIKE */}
      {samplePhotosCount > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-amber-500/30 bg-amber-50/60 p-4 text-xs text-amber-900">
          <div>
            <span className="font-bold">Vzorčne fotografije v galeriji ({samplePhotosCount}):</span>
            <p className="mt-0.5 text-amber-800">
              V bazi je trenutno {samplePhotosCount} privzetih vzorčnih fotografij. Če želiš obdržati samo lastne slike, lahko vzorčne odstraniš z enim klikom.
            </p>
          </div>
          <form action={clearPlaceholderGalleryPhotos}>
            <AdminDeleteButton
              confirmMessage="Ali res želite odstraniti vse vzorčne fotografije iz galerije?"
              label="Počisti vzorčne fotografije"
              className="rounded-[8px] border border-amber-600/30 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 transition hover:bg-amber-100"
            />
          </form>
        </div>
      ) : null}

      {/* UREJANJE IZBRANE FOTOGRAFIJE */}
      {editingPhoto ? (
        <form action={saveMedia} className="grid gap-4 rounded-[14px] border border-black/10 bg-white p-5 sm:p-6 shadow-2xs">
          <input type="hidden" name="id" value={editingPhoto.id} />
          <input type="hidden" name="returnTo" value="/admin/galerija" />
          <input type="hidden" name="kind" value="gallery" />

          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/8 pb-4">
            <div>
              <h2 className="display text-2xl text-[#16181c]">Uredi fotografijo v galeriji</h2>
              <p className="mt-1 text-xs text-[#5B616B]">
                Spremeni opis, povezavo ali naloži nadomestno sliko.
              </p>
            </div>
            <Link
              href="/admin/galerija"
              className="rounded-[8px] border border-black/15 bg-[#f8f9fa] px-3 py-1.5 text-xs font-semibold text-[#16181c] hover:bg-white"
            >
              ✕ Prekliči urejanje
            </Link>
          </div>

          <div className="flex items-center gap-3.5 rounded-lg border border-black/10 bg-[#f8f9fa] p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={editingPhoto.url}
              alt={editingPhoto.alt || "Trenutna slika"}
              className="h-16 w-16 rounded-md object-cover border border-black/10 shadow-2xs"
            />
            <div className="text-xs text-[#5B616B]">
              <span className="font-semibold text-[#16181C]">Trenutna slika</span>
              <p className="max-w-md truncate font-mono text-[11px] text-[#4e555d]">{editingPhoto.url}</p>
              <p className="mt-0.5 text-[11px] text-[#888]">
                Če želiš sliko obdržati, pusti polji za novo sliko spodaj prazni.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="field">
              <span>Zamenjaj datoteko (neobvezno)</span>
              <input
                name="file"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                className="file:mr-4 file:rounded-md file:border-0 file:bg-[#16181c] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-[#E31B2B]"
              />
            </label>

            <label className="field">
              <span>Ali zamenjaj s povezavo (URL)</span>
              <input
                name="imageUrl"
                type="text"
                placeholder="https://... ali /images/..."
                defaultValue={editingPhoto.url}
              />
            </label>

            <label className="field">
              <span>Opis slike / naslov (neobvezno)</span>
              <input
                name="alt"
                type="text"
                placeholder="npr. Salon EL-MOTO Trzin"
                defaultValue={editingPhoto.alt || ""}
              />
            </label>

            <label className="field">
              <span>Povezava ob kliku (neobvezno)</span>
              <input
                name="linkUrl"
                type="text"
                placeholder="https://... ali /motorji/..."
                defaultValue={editingPhoto.linkUrl || ""}
              />
            </label>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="btn btn-primary w-full sm:w-auto">
              ✓ Shrani spremembe
            </button>
            <Link href="/admin/galerija" className="btn btn-secondary w-full sm:w-auto">
              Prekliči
            </Link>
          </div>
        </form>
      ) : (
        /* SODOBEN NALAGALNIK FOTOGRAFIJ (VEČ SLIK, DRAG&DROP, SAMODEJNA OPTIMIZACIJA) */
        <GalleryUploader />
      )}

      {/* PRIKAZ OBSTOJEČIH SLIK */}
      <div className="grid gap-4 rounded-[14px] border border-black/10 bg-white p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/8 pb-4">
          <div>
            <h2 className="display text-2xl text-[#16181c]">
              Fotografije v galeriji ({photos.length})
            </h2>
            <p className="mt-0.5 text-xs text-[#5B616B]">
              Najnovejše fotografije se nahajajo na vrhu. ({uploadedPhotosCount} naloženih
              {samplePhotosCount > 0 ? `, ${samplePhotosCount} vzorčnih` : ""})
            </p>
          </div>

          {photos.length > 0 ? (
            <div className="flex items-center gap-2">
              <form action={deleteAllGalleryPhotos}>
                <AdminDeleteButton
                  confirmMessage="Pozor! Ali ste popolnoma prepričani, da želite izbrisati VSE fotografije iz galerije?"
                  label="Izbriši vse"
                  className="rounded-[8px] border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                />
              </form>
            </div>
          ) : null}
        </div>

        {photos.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((item) => {
              const isSample = item.url.startsWith("/images/galerija/");
              return (
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
                      loading="lazy"
                    />
                    <div className="absolute left-2.5 top-2.5">
                      {isSample ? (
                        <span className="rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white/90 backdrop-blur-2xs">
                          Vzorčna slika
                        </span>
                      ) : (
                        <span className="rounded-md bg-emerald-700/80 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-2xs">
                          Naložena slika
                        </span>
                      )}
                    </div>
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
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/galerija?edit=${item.id}`}
                          className="text-xs font-semibold text-blue-600 transition hover:underline"
                        >
                          Uredi
                        </Link>
                        <form action={deleteMedia}>
                          <input type="hidden" name="returnTo" value="/admin/galerija" />
                          <input type="hidden" name="id" value={item.id} />
                          <AdminDeleteButton
                            confirmMessage="Ali ste prepričani, da želite odstraniti to sliko iz galerije?"
                            label="Izbriši"
                          />
                        </form>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[10px] border border-dashed border-black/20 p-8 text-center">
            <p className="text-sm font-medium text-[#4e555d]">
              Trenutno v galeriji še ni naloženih fotografij. Uporabi zgornji obrazec za nalaganje.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
