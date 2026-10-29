import { AdminHeroEditor } from "@/components/admin-hero-editor";
import {
  deleteFaq,
  deleteMedia,
  deleteTestimonial,
  saveFaq,
  savePage,
  saveSettings,
  saveTestimonial,
  uploadMedia,
} from "@/lib/actions/admin";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function ContentPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const query = await searchParams;
  const [settings, pages, faqs, testimonials, media] = await Promise.all([
    getSettings(),
    prisma.page.findMany({ orderBy: { title: "asc" } }),
    prisma.faqItem.findMany({ orderBy: [{ category: "asc" }, { sortOrder: "asc" }] }),
    prisma.testimonial.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.mediaAsset.findMany({ orderBy: [{ kind: "asc" }, { sortOrder: "asc" }] }),
  ]);

  return (
    <section className="grid gap-8">
      <div>
        <h1 className="display text-4xl text-[#16181c]">Urejanje naslovne strani in podatkov podjetja</h1>
        <p className="mt-1 text-sm text-[#4e555d]">
          Tukaj lahko samostojno urejaš Hero sekcijo na naslovnici, kontaktne podatke podjetja, delovni čas, mnenja in galerijo.
        </p>
      </div>

      {query.saved ? (
        <p className="rounded-[10px] border border-emerald-500/30 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
          Spremembe so bile uspešno shranjene in objavljene na strani.
        </p>
      ) : null}
      {query.error ? (
        <p className="rounded-[10px] border border-[#E31B2B]/40 bg-red-50 px-4 py-3 text-sm font-semibold text-[#E31B2B]">
          Preverite vnos ({query.error}).
        </p>
      ) : null}

      {/* 1. HERO SEKCIJA */}
      <AdminHeroEditor hero={settings.hero} />

      {/* 2. PODATKI PODJETJA IN KONTAKT */}
      <form action={saveSettings} className="grid gap-4 rounded-[14px] border border-black/10 bg-white p-5 sm:p-6">
        <div>
          <h2 className="display text-3xl text-[#16181c]">Podatki podjetja EL-MOTO <span className="lowercase font-sans text-xl font-bold">d.o.o.</span> in kontakt</h2>
          <p className="mt-1 text-sm text-[#4e555d]">
            Ti podatki se samodejno prikazujejo v glavi (Header), nogi (Footer) in na podstrani Kontakt.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Text name="phone" label="Telefonska številka" defaultValue={settings.phoneDisplay} />
          <Text name="email" label="E-poštni naslov" defaultValue={settings.email} />
          <Text name="street" label="Ulica in hišna številka" defaultValue={settings.street} />
          <div className="grid grid-cols-2 gap-3">
            <Text name="postalCode" label="Poštna št." defaultValue={settings.postalCode} />
            <Text name="city" label="Kraj" defaultValue={settings.city} />
          </div>
          <Text name="hours" label="Delovni čas (npr. Po dogovoru)" defaultValue={settings.hours} />
          <Text name="notifyEmail" label="E-pošta za prejem povpraševanj" defaultValue={settings.notifyEmail} />
          <Text name="facebook" label="Facebook povezava" defaultValue={settings.facebook} />
          <Text name="instagram" label="Instagram povezava" defaultValue={settings.instagram} />
          <Text name="seoHomeTitle" label="SEO naslov prve strani" defaultValue={settings.seoHomeTitle} />
          <label className="field sm:col-span-2">
            <span>SEO opis prve strani</span>
            <textarea name="seoHomeDescription" defaultValue={settings.seoHomeDescription} className="min-h-24" />
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="newsletter" defaultChecked={settings.newsletterEnabled} className="h-5 w-5" />
          Vklopi prijavo na e-novice v nogi strani
        </label>
        <div>
          <button className="btn btn-primary w-full sm:w-auto">Shrani podatke podjetja</button>
        </div>
      </form>

      {/* 3. FOTOGRAFIJE STRANI IN GALERIJA */}
      <form action={uploadMedia} className="grid gap-4 rounded-[14px] border border-black/10 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="display text-3xl text-[#16181c]">Dodaj fotografijo v galerijo ali stran</h2>
          <a
            href="/admin/galerija"
            className="text-xs font-semibold text-[#E31B2B] hover:underline"
          >
            Odpri namenski urejevalnik galerije →
          </a>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="field">
            <span>Mesto prikaza</span>
            <select name="kind" defaultValue="gallery">
              <option value="gallery">Galerija</option>
              <option value="about">O nas</option>
              <option value="hero">Glavna fotografija</option>
              <option value="sale">Prodaja</option>
            </select>
          </label>
          <Text name="alt" label="Opis fotografije" />
          <Text name="linkUrl" label="Povezava (neobvezno)" />
          <label className="field">
            <span>Izberi datoteko</span>
            <input name="file" type="file" accept="image/jpeg,image/png,image/webp" required />
          </label>
        </div>
        <div>
          <button className="btn btn-primary w-full sm:w-auto">Naloži fotografijo</button>
        </div>
      </form>

      {media.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {media.map((item) => (
            <article key={item.id} className="rounded-[12px] border border-black/10 bg-white p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt={item.alt} className="aspect-video w-full rounded-lg object-cover" />
              <p className="mt-2 text-xs text-[#4e555d]">
                {item.kind} {item.linkUrl ? `· ${item.linkUrl}` : ""}
              </p>
              <form action={deleteMedia}>
                <input type="hidden" name="id" value={item.id} />
                <button className="mt-1 text-xs font-semibold text-[#E31B2B] underline">Odstrani</button>
              </form>
            </article>
          ))}
        </div>
      ) : null}

      {/* 4. OCENE STRANK */}
      <div className="grid gap-4 rounded-[14px] border border-black/10 bg-white p-5 sm:p-6">
        <h2 className="display text-3xl text-[#16181c]">Mnenja strank</h2>
        <p className="text-sm text-[#4e555d]">Dodatna mnenja se prikažejo v drsniku »MNENJA STRANK«.</p>
        <form action={saveTestimonial} className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <Text name="authorName" label="Ime in priimek stranke" />
            <Text name="rating" label="Ocena (1–5)" type="number" defaultValue={5} />
            <Text name="source" label="Vir (npr. Google)" defaultValue="Google" />
          </div>
          <label className="field">
            <span>Mnenje stranke</span>
            <textarea name="text" className="min-h-24" />
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" name="published" defaultChecked className="h-5 w-5" /> Objavi mnenje
          </label>
          <div>
            <button className="btn btn-primary w-full sm:w-auto">Dodaj mnenje</button>
          </div>
        </form>
        {testimonials.map((item) => (
          <form
            key={item.id}
            action={deleteTestimonial}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-black/10 bg-[#f8f9fa] p-3 text-sm"
          >
            <input type="hidden" name="id" value={item.id} />
            <span>
              <strong>{item.authorName}</strong> · {item.published ? "objavljeno" : "skrito"}
            </span>
            <button className="font-semibold text-[#E31B2B] underline">Izbriši</button>
          </form>
        ))}
      </div>

      {/* 5. POGOSTA VPRAŠANJA */}
      <div className="grid gap-4 rounded-[14px] border border-black/10 bg-white p-5 sm:p-6">
        <h2 className="display text-3xl text-[#16181c]">Pogosta vprašanja (FAQ)</h2>
        {faqs.map((faq) => (
          <form key={faq.id} action={saveFaq} className="grid gap-3 rounded-lg border border-black/10 bg-[#f8f9fa] p-4">
            <input type="hidden" name="id" value={faq.id} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Text name="category" label="Kategorija" defaultValue={faq.category} />
              <Text name="sortOrder" label="Vrstni red" type="number" defaultValue={faq.sortOrder} />
            </div>
            <Text name="question" label="Vprašanje" defaultValue={faq.question} />
            <label className="field">
              <span>Odgovor</span>
              <textarea name="answer" defaultValue={faq.answer} className="min-h-24" />
            </label>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" name="published" defaultChecked={faq.published} className="h-5 w-5" /> Objavi
              </label>
              <button className="btn btn-primary w-full sm:w-auto">Shrani vprašanje</button>
            </div>
          </form>
        ))}
        <form action={saveFaq} className="grid gap-3 rounded-lg border border-dashed border-black/20 p-4">
          <h3 className="font-semibold">Dodaj novo vprašanje</h3>
          <Text name="category" label="Kategorija" defaultValue="Splošno" />
          <Text name="question" label="Vprašanje" />
          <label className="field">
            <span>Odgovor</span>
            <textarea name="answer" className="min-h-24" />
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" name="published" defaultChecked className="h-5 w-5" /> Objavi
          </label>
          <div>
            <button className="btn btn-primary w-full sm:w-auto">Dodaj vprašanje</button>
          </div>
        </form>
        {faqs.map((faq) => (
          <form key={`delete-${faq.id}`} action={deleteFaq}>
            <input type="hidden" name="id" value={faq.id} />
            <button className="text-xs font-semibold text-[#E31B2B] underline">Izbriši: {faq.question}</button>
          </form>
        ))}
      </div>

      {/* 6. PRAVNA BESEDILA */}
      <div className="grid gap-4 rounded-[14px] border border-black/10 bg-white p-5 sm:p-6">
        <h2 className="display text-3xl text-[#16181c]">Pravna besedila</h2>
        {pages.map((page) => (
          <form key={page.slug} action={savePage} className="grid gap-3 rounded-lg border border-black/10 bg-[#f8f9fa] p-4">
            <input type="hidden" name="slug" value={page.slug} />
            <Text name="title" label="Naslov" defaultValue={page.title} />
            <Text name="seoTitle" label="SEO naslov" defaultValue={page.seoTitle} />
            <Text name="seoDescription" label="SEO opis" defaultValue={page.seoDescription} />
            <label className="field">
              <span>Besedilo</span>
              <textarea name="body" defaultValue={page.body} className="min-h-48" />
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" name="confirmed" defaultChecked={page.confirmed} className="h-5 w-5" /> Besedilo je pregledano in lahko velja kot uradno
            </label>
            <div>
              <button className="btn btn-primary w-full sm:w-auto">Shrani besedilo</button>
            </div>
          </form>
        ))}
      </div>
    </section>
  );
}

function Text({
  name,
  label,
  defaultValue = "",
  type = "text",
}: {
  name: string;
  label: string;
  defaultValue?: string | number;
  type?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input name={name} type={type} defaultValue={defaultValue} />
    </label>
  );
}
