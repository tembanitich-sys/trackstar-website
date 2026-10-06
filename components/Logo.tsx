import Image from "next/image";
import { productName } from "@/content/site";

/**
 * BusRep logo files, used exactly as supplied (brand/BRAND.md). The files are cropped tight to the
 * artwork, so the height you set is the height people see. `w` and `h` are each file's viewBox, and
 * `clear` is the wordmark's capital B as a share of the artwork's height: BRAND.md asks for a margin
 * at least that big around the logo, so use clearSpace() when placing it.
 *
 * Minimums: horizontal lockup 120 px wide; symbol with road markings 48 px tall (the "small symbol"
 * is for anything smaller). Never recolour or retype the wordmark.
 */
const files = {
  horizontal: { src: "/brand/busrep-horizontal.svg", w: 454.12, h: 98.38, clear: 0.72 },
  "horizontal-reverse": { src: "/brand/busrep-horizontal-reverse.svg", w: 454.12, h: 98.38, clear: 0.72 },
  stacked: { src: "/brand/busrep-stacked.svg", w: 345.75, h: 255.5, clear: 0.276 },
  "stacked-reverse": { src: "/brand/busrep-stacked-reverse.svg", w: 345.75, h: 255.5, clear: 0.276 },
  symbol: { src: "/brand/busrep-symbol.svg", w: 96.38, h: 101.12, clear: 0.821 },
  "symbol-reverse": { src: "/brand/busrep-symbol-reverse.svg", w: 96.38, h: 101.12, clear: 0.821 },
} as const;

/** Exposed for tests, which check these proportions against the SVG files. */
export const logoFiles = files;

export type LogoVariant = keyof typeof files;

/** Width of the logo at a given height, from the file's proportions. */
export function logoWidth(variant: LogoVariant, height: number): number {
  const f = files[variant];
  return Math.round((f.w / f.h) * height);
}

/** The margin BRAND.md requires around the logo at this height, in whole pixels (rounded up). */
export function clearSpace(variant: LogoVariant, height: number): number {
  return Math.ceil(files[variant].clear * height);
}

export function Logo({
  variant,
  height,
  priority = false,
  decorative = false,
  className = "",
}: {
  variant: LogoVariant;
  height: number;
  priority?: boolean;
  decorative?: boolean;
  className?: string;
}) {
  const f = files[variant];
  return (
    <Image
      src={f.src}
      width={logoWidth(variant, height)}
      height={height}
      alt={decorative ? "" : productName}
      aria-hidden={decorative || undefined}
      unoptimized
      priority={priority}
      className={className}
      style={{ height, width: "auto" }}
    />
  );
}
