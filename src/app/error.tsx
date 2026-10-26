"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main id="vsebina" className="public-site grid min-h-[70svh] place-items-center px-6 py-16 text-center text-ink">
      <div>
        <h1 className="display text-5xl">Nekaj je šlo narobe</h1>
        <p className="mx-auto mt-4 max-w-md text-ink/70">Strani trenutno ni mogoče prikazati. Poskusi znova.</p>
        <button className="btn btn-primary mt-8" type="button" onClick={() => reset()}>
          Poskusi znova
        </button>
      </div>
    </main>
  );
}
