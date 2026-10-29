import Link from "next/link";
import { AdminDeleteButton } from "@/components/admin-delete-button";
import { deleteEquipment, saveEquipment } from "@/lib/actions/admin";
import { prisma } from "@/lib/db";
import { avtoNetOpremaUrl } from "@/lib/site";
import { formatPrice } from "@/lib/utils";
import { ensureEquipmentSynced } from "@/lib/shared-store";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  "Čelade",
  "Oblačila & Jakne",
  "Hlače",
  "Rokavice",
  "Škornji & Obutev",
  "Zaščitna oprema",
  "Dodatki & Kovčki",
  "Olja & Vzdrževanje",
  "Splošno",
];

export default async function AdminOpremaPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const query = await searchParams;
  await ensureEquipmentSynced();
  const items = await prisma.equipment.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <section className="grid gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="display text-4xl text-[#16181c]">Moto oprema</h1>
          <p className="mt-1 text-sm text-[#4e555d]">
            Dodaj in upravljaj moto opremo, oblačila in dodatke v ponudbi EL-MOTO.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/oprema"
            target="_blank"
            className="rounded-[10px] border border-black/15 bg-white px-4 py-2 text-sm font-semibold text-[#16181c] transition-colors hover:border-black/30 hover:bg-[#f8f9fa]"
          >
            Odpri stran Moto oprema ↗
          </Link>
          <a
            href={avtoNetOpremaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-[10px] border border-[#E31B2B]/30 bg-[#E31B2B]/10 px-4 py-2 text-sm font-semibold text-[#E31B2B] transition-colors hover:bg-[#E31B2B] hover:text-white"
          >
            Avto.net Oprema ↗
          </a>
        </div>
      </div>

      {query.saved ? (
        <p className="rounded-[10px] border border-emerald-500/30 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
          Podatki o moto opremi so bili uspešno posodobljeni.
        </p>
      ) : null}
      {query.error ? (
        <p className="rounded-[10px] border border-[#E31B2B]/40 bg-red-50 px-4 py-3 text-sm font-semibold text-[#E31B2B]">
          Pri shranjevanju je prišlo do napake ({decodeURIComponent(query.error)}). Preverite vnesene podatke.
        </p>
      ) : null}

      {/* OBRAZEC ZA DODAJANJE NOVEGA ARTIKLA */}
      <form action={saveEquipment} className="grid gap-4 rounded-[14px] border border-black/10 bg-white p-5 sm:p-6 shadow-2xs">
        <div>
          <h2 className="display text-2xl text-[#16181c]">Dodaj nov kos moto opreme</h2>
          <p className="mt-1 text-xs text-[#5B616B]">
            Vnesi osnovne podatke za moto opremo (ime, cena, opis in slika).
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="field">
            <span>Naziv opreme *</span>
            <input name="title" type="text" placeholder="npr. Čelada Scorpion EXO-R1 Carbon" required />
          </label>

          <label className="field">
            <span>Cena v € (pusti prazno za po dogovoru)</span>
            <input name="priceEur" type="text" placeholder="npr. 289 ali 289,00" />
          </label>

          <label className="field">
            <span>Kategorija</span>
            <select name="category" defaultValue="Splošno">
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Povezava na oglas na Avto.net (neobvezno)</span>
            <input name="avtonetUrl" type="url" placeholder="https://www.avto.net/..." />
          </label>

          <label className="field">
            <span>Izberi sliko artikla iz računalnika</span>
            <input
              name="file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="file:mr-4 file:rounded-md file:border-0 file:bg-[#16181c] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-[#E31B2B]"
            />
          </label>

          <label className="field">
            <span>Ali prilepi URL povezavo do slike</span>
            <input name="imageUrl" type="url" placeholder="https://..." />
          </label>

          <label className="field sm:col-span-2">
            <span>Kratek opis artikla</span>
            <textarea
              name="description"
              rows={3}
              placeholder="npr. Velikosti na voljo: M, L, XL. Vrhunska aerodinamična školjka, pinlock vključen v ceno..."
            />
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm font-medium text-[#16181c]">
          <input type="checkbox" name="published" defaultChecked className="h-5 w-5 accent-[#E31B2B]" />
          Objavi artikel na spletni strani
        </label>

        <div className="pt-2">
          <button type="submit" className="btn btn-primary w-full sm:w-auto">
            + Dodaj v ponudbo opreme
          </button>
        </div>
      </form>

      {/* SEZNAM OBSTOJEČE OPREME */}
      <div className="grid gap-4 rounded-[14px] border border-black/10 bg-white p-5 sm:p-6 shadow-2xs">
        <div className="flex items-center justify-between">
          <h2 className="display text-2xl text-[#16181c]">Vsa vnesena moto oprema ({items.length})</h2>
        </div>

        {items.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <article
                key={item.id}
                className="group relative flex flex-col overflow-hidden rounded-[12px] border border-black/10 bg-[#f8f9fa] transition hover:shadow-md"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/5">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-[#888]">
                      Ni slike
                    </div>
                  )}
                  <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-0.5 text-[11px] font-semibold text-white">
                    {item.category}
                  </span>
                  {!item.published ? (
                    <span className="absolute right-2 top-2 rounded bg-amber-500 px-2 py-0.5 text-[11px] font-semibold text-white">
                      Osnutek
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-1 flex-col justify-between p-4">
                  <div>
                    <h3 className="text-base font-bold text-[#16181c]">{item.title}</h3>
                    <p className="mt-1 text-sm font-semibold text-[#E31B2B]">
                      {item.priceCents ? formatPrice(item.priceCents, true) : "Cena po dogovoru"}
                    </p>
                    {item.description ? (
                      <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-[#5B616B]">{item.description}</p>
                    ) : null}
                    {item.avtonetUrl ? (
                      <a
                        href={item.avtonetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-xs font-semibold text-blue-600 hover:underline"
                      >
                        Povezava na Avto.net ↗
                      </a>
                    ) : null}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-black/8 pt-3">
                    <span className="text-[11px] text-[#888]">
                      {new Date(item.createdAt).toLocaleDateString("sl-SI")}
                    </span>
                    <form action={deleteEquipment}>
                      <input type="hidden" name="id" value={item.id} />
                      <AdminDeleteButton
                        confirmMessage={`Ali ste prepričani, da želite izbrisati "${item.title}"?`}
                        label="Izbriši"
                      />
                    </form>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[10px] border border-dashed border-black/20 p-8 text-center">
            <p className="text-sm font-medium text-[#4e555d]">
              Trenutno še ni dodane opreme v bazi. Uporabi zgornji obrazec za dodajanje artiklov.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
