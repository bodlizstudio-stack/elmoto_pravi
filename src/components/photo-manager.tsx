"use client";

import { useState } from "react";

export type Photo = {
  id: string;
  url: string;
  alt: string;
  isCover: boolean;
  sortOrder: number;
};

async function fileToDataUrl(file: File): Promise<string> {
  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error(`${file.name}: branje datoteke ni uspelo.`));
    reader.readAsDataURL(file);
  });

  // Compress/resize in browser so multiple high-res phone photos never exceed serverless body limits
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("Image load failed"));
      element.src = rawDataUrl;
    });
    const maxDim = 1600;
    let width = img.naturalWidth || img.width;
    let height = img.naturalHeight || img.height;
    if (width > maxDim || height > maxDim) {
      const scale = Math.min(maxDim / width, maxDim / height);
      width = Math.max(1, Math.round(width * scale));
      height = Math.max(1, Math.round(height * scale));
    }
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return rawDataUrl;
    ctx.drawImage(img, 0, 0, width, height);
    const webp = canvas.toDataURL("image/webp", 0.84);
    if (webp.startsWith("data:image/webp")) return webp;
    return canvas.toDataURL("image/jpeg", 0.85);
  } catch {
    return rawDataUrl;
  }
}

export function PhotoManager({ images }: { motorcycleId?: string; images: Photo[] }) {
  const [items, setItems] = useState<Photo[]>(images);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<{ name: string; value: number } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  async function handleFiles(files: File[]) {
    setErrors([]);
    if (!files.length) return;

    const currentCount = items.length;
    if (currentCount + files.length > 30) {
      setErrors(["Na enem motorju je lahko največ 30 fotografij."]);
      return;
    }

    setBusy(true);
    const added: Photo[] = [];

    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      const heic = file.type === "image/heic" || file.type === "image/heif" || /\.hei[cf]$/i.test(file.name);
      if (heic) {
        setErrors((current) => [...current, `${file.name}: HEIC ni podprt. V telefonu izberi Najbolj združljivo ali JPG.`]);
        continue;
      }
      if (file.size > 15 * 1024 * 1024) {
        setErrors((current) => [...current, `${file.name}: fotografija mora biti manjša od 15 MB.`]);
        continue;
      }
      setProgress({ name: file.name, value: Math.round(((i + 1) / files.length) * 100) });
      try {
        const dataUrl = await fileToDataUrl(file);
        added.push({
          id: `local-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
          url: dataUrl,
          alt: file.name.replace(/\.[^.]+$/, ""),
          isCover: false,
          sortOrder: currentCount + added.length + 1,
        });
      } catch (error) {
        setErrors((current) => [...current, error instanceof Error ? error.message : `${file.name}: nalaganje ni uspelo.`]);
      }
    }

    if (added.length > 0) {
      setItems((prev) => {
        const combined = [...prev, ...added].map((item, idx) => ({
          ...item,
          sortOrder: idx + 1,
        }));
        if (!combined.some((item) => item.isCover) && combined.length > 0) {
          combined[0] = { ...combined[0], isCover: true };
        }
        return combined;
      });
    }

    setProgress(null);
    setBusy(false);
  }

  function setCover(imageId: string) {
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        isCover: item.id === imageId,
      })),
    );
  }

  function move(index: number, direction: -1 | 1) {
    setItems((prev) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next.map((item, idx) => ({ ...item, sortOrder: idx + 1 }));
    });
  }

  function remove(imageId: string) {
    setItems((prev) => {
      const filtered = prev.filter((item) => item.id !== imageId).map((item, idx) => ({
        ...item,
        sortOrder: idx + 1,
      }));
      if (filtered.length > 0 && !filtered.some((item) => item.isCover)) {
        filtered[0] = { ...filtered[0], isCover: true };
      }
      return filtered;
    });
  }

  return (
    <div className="grid gap-4">
      <input type="hidden" name="galleryJson" value={JSON.stringify(items)} />
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
          void handleFiles([...event.dataTransfer.files]);
        }}
      >
        <p className="text-sm leading-6 text-ink/70">
          Dodaš lahko več fotografij hkrati. Dovoljeni so JPG, PNG in WebP. Vrstni red z Višje in Nižje je vrstni red, ki ga obiskovalec vidi, ko gre levo in desno.
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
              void handleFiles(files);
            }}
          />
        </label>
        <p className="text-sm text-ink/60">Na računalniku jih lahko tudi povlečeš sem.</p>
        {progress ? (
          <p className="text-sm" role="status">
            Pripravljam {progress.name}: {progress.value} %
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
                <button type="button" className="btn btn-secondary min-h-11" disabled={busy || image.isCover} onClick={() => setCover(image.id)}>
                  Nastavi kot naslovno
                </button>
                <button type="button" className="btn btn-secondary min-h-11" disabled={busy || index === 0} onClick={() => move(index, -1)}>
                  Višje
                </button>
                <button type="button" className="btn btn-secondary min-h-11" disabled={busy || index === items.length - 1} onClick={() => move(index, 1)}>
                  Nižje
                </button>
                <button type="button" className="btn btn-secondary min-h-11" disabled={busy} onClick={() => remove(image.id)}>
                  Odstrani
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink/70">Fotografij še ni. Klikni »Izberi fotografije« ali jih povleci v okvir zgoraj.</p>
      )}
    </div>
  );
}
