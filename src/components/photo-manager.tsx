"use client";

import { useState } from "react";

type Photo = {
  id: string;
  url: string;
  alt: string;
  isCover: boolean;
  sortOrder: number;
};

export function PhotoManager({ motorcycleId, images }: { motorcycleId: string; images: Photo[] }) {
  const [items, setItems] = useState(images);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<{ name: string; value: number } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  async function send(data: FormData) {
    const response = await fetch("/api/admin/fotografije", { method: "POST", body: data });
    const body = (await response.json().catch(() => ({}))) as { error?: string; images?: Photo[] };
    if (!response.ok || !body.images) {
      throw new Error(body.error || "Shranjevanje fotografije ni uspelo.");
    }
    setItems(body.images);
  }

  async function upload(files: File[]) {
    setErrors([]);
    for (const file of files) {
      const heic = file.type === "image/heic" || file.type === "image/heif" || /\.hei[cf]$/i.test(file.name);
      if (heic) {
        setErrors((current) => [...current, `${file.name}: HEIC ni podprt. V telefonu izberi Najbolj združljivo ali JPG.`]);
        continue;
      }
      if (file.size > 8 * 1024 * 1024) {
        setErrors((current) => [...current, `${file.name}: fotografija mora biti manjša od 8 MB.`]);
        continue;
      }
      setBusy(true);
      setProgress({ name: file.name, value: 0 });
      try {
        await new Promise<void>((resolve, reject) => {
          const data = new FormData();
          data.set("id", motorcycleId);
          data.set("action", "upload");
          data.set("file", file);
          const xhr = new XMLHttpRequest();
          xhr.open("POST", "/api/admin/fotografije");
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              setProgress({ name: file.name, value: Math.round((event.loaded / event.total) * 100) });
            }
          };
          xhr.onload = () => {
            const body = JSON.parse(xhr.responseText || "{}") as { error?: string; images?: Photo[] };
            if (xhr.status >= 200 && xhr.status < 300 && body.images) {
              setItems(body.images);
              resolve();
              return;
            }
            reject(new Error(body.error || `${file.name}: nalaganje ni uspelo.`));
          };
          xhr.onerror = () => reject(new Error(`${file.name}: povezava je spodletela. Prejšnje fotografije so ostale.`));
          xhr.send(data);
        });
      } catch (error) {
        setErrors((current) => [...current, error instanceof Error ? error.message : "Nalaganje ni uspelo."]);
      } finally {
        setProgress(null);
        setBusy(false);
      }
    }
  }

  async function act(action: string, imageId: string) {
    setBusy(true);
    setErrors([]);
    try {
      const data = new FormData();
      data.set("id", motorcycleId);
      data.set("action", action);
      data.set("imageId", imageId);
      await send(data);
    } catch (error) {
      setErrors([error instanceof Error ? error.message : "Dejanje ni uspelo. Galerija je ostala nespremenjena."]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-4">
      <div
        className={`grid gap-3 rounded-[12px] border border-dashed p-4 ${dragging ? "border-accent bg-white" : "border-black/20 bg-[#f6f6f4]"}`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void upload([...event.dataTransfer.files]);
        }}
      >
        <p className="text-sm leading-6 text-ink/70">
          Dodaš lahko več fotografij hkrati. Dovoljeni so JPG, PNG in WebP, posamezna do 8 MB. Vrstni red z Višje in Nižje je vrstni red, ki ga obiskovalec vidi, ko gre levo in desno. HEIC najprej shrani kot JPG.
        </p>
        <label className="btn btn-primary w-full cursor-pointer sm:w-auto">
          Izberi fotografije
          <input
            className="sr-only"
            type="file"
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            multiple
            disabled={busy}
            onChange={(event) => {
              const files = [...(event.target.files ?? [])];
              event.target.value = "";
              void upload(files);
            }}
          />
        </label>
        <p className="text-sm text-ink/60">Na računalniku jih lahko tudi povlečeš sem.</p>
        {progress ? (
          <p className="text-sm" role="status">
            Nalagam {progress.name}: {progress.value} %
          </p>
        ) : null}
      </div>
      {errors.length ? (
        <div className="border border-accent/40 bg-white p-3 text-sm text-accent" role="alert">
          {errors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      ) : null}
      {items.length ? (
        <ul className="grid gap-3">
          {items.map((image, index) => (
            <li key={image.id} className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 rounded-[12px] border border-black/10 bg-white p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt={image.alt || "Fotografija motorja"} className="h-20 w-full rounded-[8px] object-cover" />
              <div className="flex flex-wrap items-center gap-2">
                {image.isCover ? <span className="text-sm font-semibold text-accent">Naslovna</span> : null}
                <button type="button" className="btn btn-secondary min-h-11" disabled={busy || image.isCover} onClick={() => void act("cover", image.id)}>
                  Nastavi kot naslovno
                </button>
                <button type="button" className="btn btn-secondary min-h-11" disabled={busy || index === 0} onClick={() => void act("up", image.id)}>
                  Višje
                </button>
                <button type="button" className="btn btn-secondary min-h-11" disabled={busy || index === items.length - 1} onClick={() => void act("down", image.id)}>
                  Nižje
                </button>
                <button type="button" className="btn btn-secondary min-h-11" disabled={busy} onClick={() => void act("delete", image.id)}>
                  Odstrani
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink/70">Fotografij še ni. Dodaš jih lahko kadarkoli.</p>
      )}
    </div>
  );
}
