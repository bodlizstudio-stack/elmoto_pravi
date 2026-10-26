import Image from "next/image";

export function Photo({
  src,
  alt,
  priority = false,
  sizes,
  className = "",
  fit = "cover",
}: {
  src: string;
  alt: string;
  priority?: boolean;
  sizes: string;
  className?: string;
  fit?: "cover" | "contain";
}) {
  const fitClass = `${fit === "contain" ? "object-contain" : "object-cover"} ${className}`.trim();
  if (src.startsWith("/")) {
    return <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className={fitClass} />;
  }
  return (
    // External photos are admin-provided and may not be on an allowed image host.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={`absolute inset-0 h-full w-full ${fitClass}`} />
  );
}

export function PhotoFrame({
  src,
  alt,
  priority = false,
  sizes,
  className = "aspect-[4/3]",
  fit = "cover",
}: {
  src?: string | null;
  alt: string;
  priority?: boolean;
  sizes: string;
  className?: string;
  fit?: "cover" | "contain";
}) {
  return (
    <div className={`card-media relative overflow-hidden bg-[#f5f6f7] ${className}`}>
      {src ? (
        <Photo src={src} alt={alt} priority={priority} sizes={sizes} fit={fit} />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-[#e7e7e4] px-4 text-center">
          <span className="text-lg font-semibold text-ink/70">Fotografija sledi</span>
        </div>
      )}
    </div>
  );
}
