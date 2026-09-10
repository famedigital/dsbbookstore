import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  /** lacquer = navy seal on light; white = ivory seal on dark */
  variant?: "lacquer" | "white" | "ink";
  href?: string;
  className?: string;
  withWordmark?: boolean;
  size?: number;
};

/** Authentic DSB Enterprises crest (original artwork) + wordmark. */
export function DsbLogo({
  variant = "lacquer",
  href = "/",
  className,
  withWordmark = true,
  size = 44,
}: Props) {
  const light = variant === "white";
  const src = light
    ? "/brand/dsb-seal-white.png"
    : "/brand/dsb-seal-navy.png";
  const wordClass =
    size >= 48
      ? "text-2xl md:text-[1.75rem]"
      : size >= 40
        ? "text-xl md:text-2xl"
        : "text-lg md:text-xl";

  const inner = (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <Image
        src={src}
        alt="DSB Enterprises"
        width={size}
        height={size}
        className="object-contain"
        priority
        unoptimized
      />
      {withWordmark ? (
        <span
          className={cn(
            "font-heading tracking-tight",
            wordClass,
            light ? "text-[#f7f2e8]" : "text-[color:var(--sf-ink,#0f172a)]"
          )}
        >
          DSB
          <span
            className={
              light
                ? "text-[#7dd3fc]"
                : "text-[color:var(--sf-accent,#0284c7)]"
            }
          >
            Books
          </span>
        </span>
      ) : null}
    </span>
  );

  if (!href) return inner;
  return (
    <Link href={href} className="shrink-0">
      {inner}
    </Link>
  );
}
