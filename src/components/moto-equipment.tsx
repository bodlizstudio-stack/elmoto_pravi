import Link from "next/link";
import { enableMotoEquipment, motoEquipment } from "@/lib/moto-equipment";

export function MotoEquipmentSection() {
  if (!enableMotoEquipment || motoEquipment.length === 0) return null;
  const categories = [...new Set(motoEquipment.map((item) => item.category))];
  return (
    <section className="bg-[#111216] py-16 text-[#F5F5F5] md:py-24" aria-labelledby="oprema">
      <div className="wrap">
        <h2 id="oprema" className="display text-4xl text-white sm:text-5xl">
          Moto oprema
        </h2>
        <p className="mt-3 max-w-2xl text-[17px] leading-7 text-[#B9BDC5]">
          Izbrana oprema iz ponudbe EL-MOTO. Za izdelek piši, nakup prek strani ni mogoč.
        </p>
        {categories.length ? <p className="mt-4 text-sm text-[#B9BDC5]">{categories.join(" · ")}</p> : null}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {motoEquipment.map((item) => (
            <article key={item.slug} className="rounded-[14px] border border-white/10 bg-[#25272D] p-4">
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image} alt={item.name} className="aspect-[4/3] w-full rounded-[8px] object-cover" />
              ) : null}
              <h3 className="mt-3 text-xl font-semibold text-white">{item.name}</h3>
              <p className="mt-2 text-[16px] leading-7 text-[#B9BDC5]">{item.description}</p>
              <Link className="btn btn-primary mt-4" href={`/kontakt?vrsta=GENERAL&model=${encodeURIComponent(item.interest || item.name)}`}>
                Pošlji povpraševanje
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
