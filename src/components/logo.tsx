import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  className?: string;
  theme?: "dark" | "light";
  ariaHidden?: boolean;
};

export function Logo({
  className = "h-8 w-auto sm:h-10 md:h-11",
  theme = "light",
  ariaHidden = false,
}: LogoProps) {
  const isDark = theme === "dark";

  return (
    <Image
      src="/images/logo/logo-transparent.png"
      alt={ariaHidden ? "" : "EL-MOTO d.o.o."}
      width={859}
      height={210}
      priority
      unoptimized
      aria-hidden={ariaHidden || undefined}
      className={`${className} select-none object-contain ${
        isDark ? "drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]" : ""
      }`}
    />
  );
}

export function LogoLink({
  className = "h-8 w-auto sm:h-10 md:h-11",
  theme = "light",
}: {
  className?: string;
  theme?: "dark" | "light";
}) {
  return (
    <Link href="/" aria-label="EL-MOTO d.o.o., domov" className="inline-flex shrink-0 items-center">
      <Logo className={className} theme={theme} />
    </Link>
  );
}
