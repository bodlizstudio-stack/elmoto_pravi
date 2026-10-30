import Link from "next/link";
import { AdminDeleteButton } from "@/components/admin-delete-button";
import { deleteKoveModel, resetKoveModels, saveKoveModel } from "@/lib/actions/admin";
import { getKoveModels } from "@/lib/kove";
import { koveCatalogUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function AdminKovePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string; edit?: string }>;
}) {
  const query = await searchParams;
  const models = await getKoveModels();
  const editingModel = query.edit ? models.find((m) => m.slug === query.edit) || null : null;

  return (
    <section className="grid gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="display text-4xl text-[#16181c]">Modeli KOVE</h1>
          <p className="mt-1 text-sm text-[#4e555d]">
            Upravljaj modele pooblaščenega programa KOVE (nazivi, prostornina, tehnični podatki, opisi in fotografije).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/kove"
            target="_blank"
            className="rounded-[10px] border border-black/15 bg-white px-4 py-2 text-sm font-semibold text-[#16181c] transition-colors hover:border-black/30 hover:bg-[#f8f9fa]"
          >
            Odpri stran KOVE ↗
          </Link>
          <a
            href={koveCatalogUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-[10px] border border-[#E31B2B]/30 bg-[#E31B2B]/10 px-4 py-2 text-sm font-semibold text-[#E31B2B] transition-colors hover:bg-[#E31B2B] hover:text-white"
          >
            Uradni katalog kove.si ↗
          </a>
        </div>
      </div>

      {query.saved ? (
        <p className="rounded-[10px] border border-emerald-500/30 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
          Podatki modelov KOVE so bili uspešno posodobljeni in shranjeni.
        </p>
      ) : null}
      {query.error ? (
        <p className="rounded-[10px] border border-[#E31B2B]/40 bg-red-50 px-4 py-3 text-sm font-semibold text-[#E31B2B]">
          Pri shranjevanju je prišlo do napake ({decodeURIComponent(query.error)}). Preverite vnesene podatke.
        </p>
      ) : null}

      {/* OBRAZEC ZA DODAJANJE / UREJANJE MODELA KOVE */}
      <form action={saveKoveModel} className="grid gap-4 rounded-[14px] border border-black/10 bg-white p-5 sm:p-6 shadow-2xs">
        {editingModel ? <input type="hidden" name="originalSlug" value={editingModel.slug} /> : null}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="display text-2xl text-[#16181c]">
              {editingModel ? `Uredi model: ${editingModel.name}` : "Dodaj nov model KOVE"}
            </h2>
            <p className="mt-1 text-xs text-[#5B616B]">
              {editingModel
                ? "Spremeni naziv, prostornino, tehnične podatke ali fotografijo modela."
                : "Vnesi podatke za nov model v katalogu KOVE."}
            </p>
          </div>
          {editingModel ? (
            <Link
              href="/admin/kove"
              className="rounded-[8px] border border-black/15 bg-[#f8f9fa] px-3 py-1.5 text-xs font-semibold text-[#16181c] hover:bg-white"
            >
              ✕ Prekliči urejanje
            </Link>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="field">
            <span>Naziv modela *</span>
            <input
              name="name"
              type="text"
              placeholder="npr. KOVE 525X ADV ali KOVE 800X TOURING"
              defaultValue={editingModel?.name || ""}
              required
            />
          </label>

          <label className="field">
            <span>Ključ modela / slug (neobvezno)</span>
            <input
              name="slug"
              type="text"
              placeholder="npr. 525x-adv"
              defaultValue={editingModel?.slug || ""}
            />
          </label>

          <label className="field sm:col-span-2">
            <span>Tehnični poudarki &amp; specifikacije (ločeni z vejico ali v novi vrstici)</span>
            <input
              name="features"
              type="text"
              placeholder="npr. 494 ccm, 39,6 kW, sedež 820 mm, rezervoar 20 l"
              defaultValue={editingModel?.features ? editingModel.features.join(", ") : ""}
            />
          </label>

          <label className="field">
            <span>Izberi sliko iz računalnika {editingModel?.image ? "(neobvezno, slika že obstaja)" : ""}</span>
            <input
              name="file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="file:mr-4 file:rounded-md file:border-0 file:bg-[#16181c] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-[#E31B2B]"
            />
          </label>

          <label className="field">
            <span>Ali prilepi URL povezavo do slike</span>
            <input
              name="imageUrl"
              type="url"
              placeholder="https://..."
              defaultValue={editingModel?.image || ""}
            />
          </label>

          <label className="field sm:col-span-2">
            <span>Opis modela</span>
            <textarea
              name="description"
              rows={3}
              placeholder="Kratek opis modela, opreme in namena..."
              defaultValue={editingModel?.description || ""}
            />
          </label>

          <label className="field sm:col-span-2">
            <span>Povezava na uradni katalog (neobvezno)</span>
            <input
              name="sourceUrl"
              type="url"
              placeholder="https://kove.si/..."
              defaultValue={editingModel?.sourceUrl || "https://kove.si"}
            />
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm font-medium text-[#16181c]">
          <input
            type="checkbox"
            name="published"
            defaultChecked={editingModel ? editingModel.published : true}
            className="h-5 w-5 accent-[#E31B2B]"
          />
          Objavi model na spletni strani (naslovnica in /kove)
        </label>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" className="btn btn-primary w-full sm:w-auto">
            {editingModel ? "✓ Shrani spremembe" : "+ Dodaj model KOVE"}
          </button>
          {editingModel ? (
            <Link href="/admin/kove" className="btn btn-secondary w-full sm:w-auto">
              Prekliči
            </Link>
          ) : null}
        </div>
      </form>

      {/* SEZNAM MODELOV KOVE */}
      <div className="grid gap-4 rounded-[14px] border border-black/10 bg-white p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="display text-2xl text-[#16181c]">Vsi modeli KOVE ({models.length})</h2>
          <form action={resetKoveModels}>
            <AdminDeleteButton
              confirmMessage="Ali ste prepričani, da želite ponastaviti modele KOVE na privzete tovarniške podatke?"
              label="Ponastavi na privzeto"
              className="rounded-[8px] border border-black/15 bg-[#f8f9fa] px-3 py-1.5 text-xs font-semibold text-[#5B616B] transition hover:border-black/30 hover:bg-white"
            />
          </form>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {models.map((model) => (
            <article
              key={model.slug}
              className="group relative flex flex-col overflow-hidden rounded-[12px] border border-black/10 bg-[#f8f9fa] transition hover:shadow-md"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/5 p-3">
                {model.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={model.image}
                    alt={model.name}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-[#888]">
                    Brez slike
                  </div>
                )}
                <span className="absolute left-3 top-3 rounded-md bg-[#16181c] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white">
                  KOVE
                </span>
                {!model.published ? (
                  <span className="absolute right-3 top-3 rounded-md bg-amber-500 px-2 py-0.5 text-[11px] font-bold text-white">
                    Skrito
                  </span>
                ) : null}
              </div>

              <div className="flex flex-1 flex-col justify-between p-4">
                <div>
                  <h3 className="display text-xl text-[#16181c]">{model.name}</h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#5B616B]">
                    {model.description}
                  </p>
                  {model.features && model.features.length > 0 ? (
                    <div className="mt-2.5 flex flex-wrap gap-1">
                      {model.features.map((feat) => (
                        <span
                          key={feat}
                          className="rounded-full bg-white px-2 py-0.5 text-[10.5px] font-semibold text-[#16181c] shadow-2xs"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-black/8 pt-3">
                  <span className="text-[11px] font-mono text-[#888]">slug: {model.slug}</span>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/kove?edit=${model.slug}`}
                      className="text-xs font-semibold text-blue-600 transition hover:underline"
                    >
                      Uredi
                    </Link>
                    <form action={deleteKoveModel}>
                      <input type="hidden" name="slug" value={model.slug} />
                      <AdminDeleteButton
                        confirmMessage={`Ali ste prepričani, da želite izbrisati model "${model.name}"?`}
                        label="Izbriši"
                      />
                    </form>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
