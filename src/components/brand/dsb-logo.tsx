import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  /** ink = navy on light; ivory = light on dark footers */
  variant?: "lacquer" | "white" | "ink";
  href?: string;
  className?: string;
  withWordmark?: boolean;
  size?: number;
};

/** Sharp vector seal — transparent bg, navy (no red). */
function DsbSeal({
  size,
  light,
}: {
  size: number;
  light?: boolean;
}) {
  const ink = light ? "#f7f2e8" : "#0f172a";
  const accent = light ? "#7dd3fc" : "#0284c7";
  const fill = light ? "#0f172a" : "#0f172a";
  const text = "#ffffff";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="shrink-0"
    >
      {/* Outer ring */}
      <circle cx="60" cy="60" r="56" fill={fill} />
      <circle
        cx="60"
        cy="60"
        r="52"
        stroke={accent}
        strokeWidth="2.5"
        fill="none"
      />
      {/* Sunburst arcs */}
      {Array.from({ length: 18 }).map((_, i) => {
        const a = ((i * 20 - 90) * Math.PI) / 180;
        const x1 = 60 + Math.cos(a) * 40;
        const y1 = 60 + Math.sin(a) * 40;
        const x2 = 60 + Math.cos(a) * 48;
        const y2 = 60 + Math.sin(a) * 48;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={accent}
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        );
      })}
      {/* Top ribbon */}
      <path
        d="M22 48 C30 36 48 30 60 30 C72 30 90 36 98 48 L90 52 C82 42 70 38 60 38 C50 38 38 42 30 52 Z"
        fill={accent}
      />
      <text
        x="60"
        y="46"
        textAnchor="middle"
        fill={text}
        fontSize="6.5"
        fontFamily="system-ui, sans-serif"
        fontWeight="700"
        letterSpacing="0.04em"
      >
        DSB ENTERPRISES
      </text>
      {/* Om */}
      <text
        x="60"
        y="72"
        textAnchor="middle"
        fill={text}
        fontSize="22"
        fontFamily="Georgia, serif"
        fontWeight="600"
      >
        ॐ
      </text>
      {/* Stars */}
      <text x="34" y="70" fill={accent} fontSize="10">
        ★
      </text>
      <text x="78" y="70" fill={accent} fontSize="10">
        ★
      </text>
      {/* Bottom banner */}
      <rect x="24" y="82" width="72" height="16" rx="2" fill={accent} />
      <text
        x="60"
        y="93"
        textAnchor="middle"
        fill={text}
        fontSize="5.8"
        fontFamily="Georgia, serif"
        fontWeight="700"
        letterSpacing="0.12em"
      >
        IN GOD WE TRUST
      </text>
      {/* Hairline for crisp edge on light bg */}
      {!light ? (
        <circle
          cx="60"
          cy="60"
          r="56"
          stroke={ink}
          strokeWidth="1"
          fill="none"
          opacity="0.15"
        />
      ) : null}
    </svg>
  );
}

export function DsbLogo({
  variant = "lacquer",
  href = "/",
  className,
  withWordmark = true,
  size = 44,
}: Props) {
  const light = variant === "white";

  const inner = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <DsbSeal size={size} light={light} />
      {withWordmark ? (
        <span
          className={cn(
            "font-heading text-xl tracking-tight md:text-2xl",
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
