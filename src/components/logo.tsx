import Image from "next/image";
import Link from "next/link";

export function Logo({ className = "h-9 w-auto sm:h-11" }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt=""
      width={1772}
      height={400}
      unoptimized
      className={className}
    />
  );
}

export function LogoLink({ className = "h-8 w-auto sm:h-10" }: { className?: string }) {
  return (
    <Link href="/" aria-label="EL-MOTO, domov" className="inline-flex shrink-0 items-center">
      <Logo className={className} />
    </Link>
  );
}
