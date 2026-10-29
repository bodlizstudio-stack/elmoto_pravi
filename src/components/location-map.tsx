"use client";

import { mapsDirectionsUrl, mapsSearchUrl, site } from "@/lib/site";

const googleMapsEmbedUrl =
  "https://maps.google.com/maps?q=EL-MOTO%2C+%C5%A0pruha+33%2C+1236+Trzin%2C+Slovenija&t=&z=16&ie=UTF8&iwloc=&output=embed&hl=sl";

export function LocationMap() {
  return (
    <section className="mt-10" aria-labelledby="map-heading" data-testid="location-map">
      <h2 id="map-heading" className="display text-3xl text-[#16181C] sm:text-4xl">
        Kje nas najdeš
      </h2>
      <p className="mt-2 text-[#5B616B]">
        {site.brand}, {site.street}, {site.postalCode} {site.city}
      </p>
      <div className="mt-4 h-80 overflow-hidden rounded-[14px] border border-[#E2E5E9] bg-white sm:h-[420px]">
        <iframe
          title="Google Maps lokacija EL-MOTO d.o.o., Špruha 33, 1236 Trzin"
          src={googleMapsEmbedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-full w-full"
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <a className="btn btn-primary w-full sm:w-auto" href={mapsDirectionsUrl} target="_blank" rel="noreferrer">
          Odpri navigacijo v Google Maps
        </a>
        <a className="btn btn-secondary w-full sm:w-auto" href={mapsSearchUrl} target="_blank" rel="noreferrer">
          Poglej večji zemljevid
        </a>
      </div>
    </section>
  );
}
