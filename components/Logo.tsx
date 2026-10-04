import Image from "next/image";

/** Logo files are used exactly as supplied; sizes keep each lockup at or above its minimum. */
const files = {
  horizontal: { src: "/brand/trackstar-horizontal.svg", w: 2134.69, h: 488 },
  "horizontal-reversed": { src: "/brand/trackstar-horizontal-reversed.svg", w: 2134.69, h: 488 },
  full: { src: "/brand/trackstar-full.svg", w: 943.5, h: 693.75 },
  "full-reversed": { src: "/brand/trackstar-full-reversed.svg", w: 943.5, h: 693.75 },
  symbol: { src: "/brand/trackstar-symbol.svg", w: 651.75, h: 488 },
  "symbol-reversed": { src: "/brand/trackstar-symbol-reversed.svg", w: 651.75, h: 488 },
} as const;

export function Logo({
  variant,
  height,
  priority = false,
  decorative = false,
  className = "",
}: {
  variant: keyof typeof files;
  height: number;
  priority?: boolean;
  decorative?: boolean;
  className?: string;
}) {
  const f = files[variant];
  const width = Math.round((f.w / f.h) * height);
  return (
    <Image
      src={f.src}
      width={width}
      height={height}
      alt={decorative ? "" : "TrackStar"}
      aria-hidden={decorative || undefined}
      unoptimized
      priority={priority}
      className={className}
      style={{ height, width: "auto" }}
    />
  );
}
