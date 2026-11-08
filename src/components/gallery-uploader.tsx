"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, Image as ImageIcon, Link as LinkIcon, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

type PreviewItem = {
  id: string;
  name: string;
  dataUrl: string;
  sizeKb: number;
};

async function optimizeImageFile(file: File): Promise<{ dataUrl: string; sizeKb: number }> {
  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error(`${file.name}: branje datoteke ni uspelo.`));
    reader.readAsDataURL(file);
  });

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const maxDim = 2000;
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
      if (!ctx) {
        resolve({ dataUrl: rawDataUrl, sizeKb: Math.round(file.size / 1024) });
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      let outputUrl = canvas.toDataURL("image/webp", 0.85);
      if (!outputUrl.startsWith("data:image/webp")) {
        outputUrl = canvas.toDataURL("image/jpeg", 0.85);
      }
      const sizeKb = Math.round((outputUrl.length * 3) / 4 / 1024);
      resolve({ dataUrl: outputUrl, sizeKb });
    };
    img.onerror = () => {
      resolve({ dataUrl: rawDataUrl, sizeKb: Math.round(file.size / 1024) });
    };
    img.src = rawDataUrl;
  });
}

export function GalleryUploader() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"file" | "url">("file");
  const [previews, setPreviews] = useState<PreviewItem[]>([]);
  const [altText, setAltText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [singleImageUrl, setSingleImageUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressText, setProgressText] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function handleSelectedFiles(files: File[]) {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!files.length) return;

    setIsProcessing(true);
    setProgressText(`Pripravljam ${files.length} fotografij...`);

    const newPreviews: PreviewItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgressText(`Obdelujem fotografijo ${i + 1} od ${files.length} (${file.name})...`);
      try {
        const { dataUrl, sizeKb } = await optimizeImageFile(file);
        newPreviews.push({
          id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
          name: file.name,
          dataUrl,
          sizeKb,
        });
      } catch (err) {
        console.error("Napaka pri pripravi slike:", err);
      }
    }

    setPreviews((prev) => [...prev, ...newPreviews]);
    setIsProcessing(false);
    setProgressText(null);
  }

  function removePreview(id: string) {
    setPreviews((prev) => prev.filter((p) => p.id !== id));
  }

  async function uploadPreviews() {
    if (previews.length === 0) {
      setErrorMsg("Izberi vsaj eno fotografijo.");
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const batchSize = 4;
      let uploadedCount = 0;

      for (let i = 0; i < previews.length; i += batchSize) {
        const batch = previews.slice(i, i + batchSize);
        setProgressText(`Nalagam v bazo (${i + 1}–${Math.min(i + batch.length, previews.length)} od ${previews.length})...`);

        const res = await fetch("/api/admin/galerija", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "upload_data_urls",
            items: batch.map((item) => ({
              dataUrl: item.dataUrl,
              alt: altText || item.name.replace(/\.[^.]+$/, ""),
              linkUrl,
            })),
          }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || "Nalaganje ni uspelo.");
        }
        uploadedCount += batch.length;
      }

      setPreviews([]);
      setAltText("");
      setLinkUrl("");
      setSuccessMsg(`Uspešno naloženih ${uploadedCount} fotografij!`);
      router.refresh();
      setTimeout(() => {
        window.location.reload();
      }, 700);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Prišlo je do napake pri nalaganju.");
    } finally {
      setIsProcessing(false);
      setProgressText(null);
    }
  }

  async function uploadViaUrl(e: React.FormEvent) {
    e.preventDefault();
    if (!singleImageUrl.trim()) {
      setErrorMsg("Vnesi URL povezavo do slike.");
      return;
    }
    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const form = new FormData();
      form.append("action", "upload");
      form.append("imageUrl", singleImageUrl.trim());
      form.append("alt", altText.trim());
      form.append("linkUrl", linkUrl.trim());

      const res = await fetch("/api/admin/galerija", {
        method: "POST",
        body: form,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Nalaganje ni uspelo.");
      }

      setSingleImageUrl("");
      setAltText("");
      setLinkUrl("");
      setSuccessMsg("Fotografija preko URL je bila uspešno dodana!");
      router.refresh();
      setTimeout(() => {
        window.location.reload();
      }, 700);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Napaka pri dodajanju slike.");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="grid gap-4 rounded-[14px] border border-black/10 bg-white p-5 sm:p-6 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/8 pb-4">
        <div>
          <h2 className="display text-2xl text-[#16181c]">Dodaj nove fotografije v galerijo</h2>
          <p className="mt-1 text-xs text-[#5B616B]">
            Izberi eno ali več fotografij iz računalnika ali telefona. Slike se samodejno optimizirajo za hiter prikaz.
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-black/10 bg-[#f6f6f4] p-1">
          <button
            type="button"
            onClick={() => setMode("file")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
              mode === "file" ? "bg-white text-[#16181c] shadow-2xs" : "text-[#5B616B] hover:text-[#16181c]"
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5" />
            Naloži datoteke
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
              mode === "url" ? "bg-white text-[#16181c] shadow-2xs" : "text-[#5B616B] hover:text-[#16181c]"
            }`}
          >
            <LinkIcon className="h-3.5 w-3.5" />
            Preko URL povezave
          </button>
        </div>
      </div>

      {successMsg ? (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-50 p-3 text-sm font-semibold text-emerald-900">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          {successMsg}
        </div>
      ) : null}

      {errorMsg ? (
        <div className="flex items-center gap-2 rounded-lg border border-[#E31B2B]/30 bg-red-50 p-3 text-sm font-semibold text-[#E31B2B]">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errorMsg}
        </div>
      ) : null}

      {mode === "file" ? (
        <div className="grid gap-4">
          {/* DRAG & DROP OBLIČ */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
              void handleSelectedFiles(files);
            }}
            className={`flex flex-col items-center justify-center rounded-[12px] border-2 border-dashed p-6 text-center transition ${
              isDragging
                ? "border-[#E31B2B] bg-red-50/50"
                : "border-black/15 bg-[#f8f9fa] hover:border-black/30 hover:bg-[#f1f3f5]"
            }`}
          >
            <UploadCloud className="h-10 w-10 text-[#5B616B]" />
            <p className="mt-2 text-sm font-semibold text-[#16181c]">
              Povleci fotografije sem ali klikni gumb spodaj
            </p>
            <p className="mt-1 text-xs text-[#5B616B]">
              Dovoljeni formati: JPG, PNG, WebP ali HEIC (izbereš lahko več slik hkrati)
            </p>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                e.target.value = "";
                void handleSelectedFiles(files);
              }}
            />

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 rounded-[10px] bg-[#16181c] px-4 py-2 text-xs font-semibold text-white shadow-2xs transition hover:bg-[#E31B2B] disabled:opacity-50"
            >
              Izberi fotografije iz naprave
            </button>
          </div>

          {/* STANJE OBDELAVE */}
          {progressText ? (
            <div className="flex items-center gap-2 rounded-lg border border-black/10 bg-[#f8f9fa] p-3 text-xs text-[#16181c]">
              <Loader2 className="h-4 w-4 animate-spin text-[#E31B2B]" />
              <span>{progressText}</span>
            </div>
          ) : null}

          {/* PREDOGLED IZBRANIH SLIK */}
          {previews.length > 0 ? (
            <div className="grid gap-3 rounded-[12px] border border-black/10 bg-[#f8f9fa] p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#16181c]">
                  Izbrane fotografije za objavo ({previews.length})
                </span>
                <button
                  type="button"
                  onClick={() => setPreviews([])}
                  className="text-xs text-red-600 hover:underline"
                >
                  Počisti vse
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
                {previews.map((item) => (
                  <div key={item.id} className="group relative aspect-square overflow-hidden rounded-lg border border-black/10 bg-white shadow-2xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.dataUrl} alt={item.name} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePreview(item.id)}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-[10px] font-bold text-white transition hover:bg-red-600"
                      title="Odstrani"
                    >
                      ✕
                    </button>
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1 py-0.5 text-center text-[10px] text-white backdrop-blur-2xs truncate">
                      {item.sizeKb} KB
                    </div>
                  </div>
                ))}
              </div>

              {/* DODATNA POLJA ZA OPIS */}
              <div className="grid gap-3 pt-2 sm:grid-cols-2">
                <label className="field">
                  <span>Skupen opis / naslov fotografij (neobvezno)</span>
                  <input
                    type="text"
                    placeholder="npr. Salon EL-MOTO ali Nova dobava KOVE"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                  />
                </label>
                <label className="field">
                  <span>Povezava ob kliku na sliko (neobvezno)</span>
                  <input
                    type="text"
                    placeholder="npr. /motorji ali /kove"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                  />
                </label>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => void uploadPreviews()}
                  className="btn btn-primary w-full sm:w-auto"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Nalagam fotografije...
                    </>
                  ) : (
                    `✓ Naloži ${previews.length} fotografij v galerijo`
                  )}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        /* NAČIN URL POVEZAVE */
        <form onSubmit={uploadViaUrl} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="field sm:col-span-3">
              <span>Spletna povezava (URL) do fotografije *</span>
              <input
                type="text"
                required
                placeholder="https://.../slika.jpg"
                value={singleImageUrl}
                onChange={(e) => setSingleImageUrl(e.target.value)}
              />
            </label>
            <label className="field sm:col-span-2">
              <span>Opis / naslov fotografije (neobvezno)</span>
              <input
                type="text"
                placeholder="npr. Salon EL-MOTO Trzin"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
              />
            </label>
            <label className="field sm:col-span-1">
              <span>Povezava ob kliku (neobvezno)</span>
              <input
                type="text"
                placeholder="/motorji"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="btn btn-primary w-full sm:w-auto"
          >
            {isProcessing ? "Dodajam..." : "✓ Dodaj fotografijo preko povezave"}
          </button>
        </form>
      )}
    </div>
  );
}
