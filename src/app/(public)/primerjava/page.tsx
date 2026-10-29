import type { Metadata } from "next";
import { allSaleBikes, coverOf } from "@/lib/motorcycles";
import { displayName } from "@/lib/utils";
import { SavedBikes } from "@/components/saved-bikes";

export const metadata: Metadata = {
  title: "Primerjava motorjev | EL-MOTO",
  description: "Primerjava do treh motorjev iz ponudbe EL-MOTO.",
};

export const dynamic = "force-dynamic";

export default async function ComparePage() {
  const bikes = await allSaleBikes();
  const availableBikes = bikes.map((bike) => ({
    id: bike.id,
    name: displayName(bike),
    image: coverOf(bike)?.url ?? null,
    priceCents: bike.priceCents,
    priceConfirmed: bike.priceConfirmed,
    year: bike.year,
    mileageKm: bike.mileageKm,
    engineCc: bike.engineCc,
  }));

  return (
    <SavedBikes
      title="Primerjava motorjev"
      empty="Trenutno nimate izbranih motorjev za primerjavo. Spodaj izberite motorje iz naše ponudbe ali kliknite 'Dodaj v primerjavo' pri posameznem motorju."
      availableBikes={availableBikes}
    />
  );
}
