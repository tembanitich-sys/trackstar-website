import Image from "next/image";
import { productName } from "@/content/site";

/**
 * A brand name shown as its logo wherever it appears in running text, headings, cards, the diagram and
 * the footer, following the InstaTickets site. One component, SVG files only (public/brand/):
 *   - BusRep: busrep-wordmark.svg (light backgrounds) and busrep-wordmark-reverse.svg (navy).
 *   - InstaTickets: instatickets-wordmark.svg (light) and instatickets-wordmark-reverse.svg (navy, all
 *     white: its red "Tickets" is only 2.5:1 on BusRep navy at inline sizes). Never on BusRep green.
 * Only the variant for the background is rendered, never both. The alignment numbers come from
 * brand/instatickets/README.md ("Inline alignment"): the logo's height is the surrounding text's
 * capital-letter height times `heightRatio`, and it sits `baseline` (a share of its own height) below the
 * text baseline so its letters stand on the same line as the text. Both are in `em`, so the logo follows
 * responsive text sizes by itself. `textPx` says how big the text around it is (the smallest size it is
 * shown at) and is used only for the minimum-size rule: a logo that would come out smaller than
 * `minHeight` is replaced by the plain name.
 *
 * Accessibility: the image's alt text is the only thing announced, never hidden text as well.
 * Where the logo sits in a sentence, keep the line height at 1.5 or more: the InstaTickets swoosh hangs
 * well below the baseline.
 */
export const NAMED_CAP_HEIGHT = 0.705; // Nunito cap height, in em

export type BrandName = "busrep" | "instatickets";
export type Surface = "light" | "navy";

export const marks = {
  busrep: {
    src: { light: "/brand/busrep-wordmark.svg", navy: "/brand/busrep-wordmark-reverse.svg" },
    w: 345.75,
    h: 90.5,
    heightRatio: 1.284,
    baseline: 0.214,
    minHeight: 14,
  },
  instatickets: {
    src: { light: "/brand/instatickets-wordmark.svg", navy: "/brand/instatickets-wordmark-reverse.svg" },
    w: 1600.63,
    h: 350.03,
    heightRatio: 1.61,
    baseline: 0.377,
    minHeight: 16,
  },
} as const;

/** Rendered height in px of the logo next to text of this size. */
export function markHeight(name: BrandName, textPx: number): number {
  return textPx * NAMED_CAP_HEIGHT * marks[name].heightRatio;
}

/** The text shown in place of the logo (alt text, and the fallback below the minimum size). */
export function markName(name: BrandName): string {
  return name === "busrep" ? productName : "InstaTickets";
}

export function BrandMark({ name, on = "light", textPx }: { name: BrandName; on?: Surface; textPx: number }) {
  const m = marks[name];
  if (markHeight(name, textPx) < m.minHeight) {
    // Too small to read as a logo: the plain name, spelled as the brand spells it even in capital lines.
    return <span style={{ textTransform: "none" }}>{markName(name)}</span>;
  }
  const heightEm = NAMED_CAP_HEIGHT * m.heightRatio;
  return (
    <Image
      src={m.src[on]}
      width={Math.round(m.w)}
      height={Math.round(m.h)}
      alt={markName(name)}
      unoptimized
      // display is set because the page-wide reset makes images blocks, which would put each logo on its own line
      style={{ display: "inline", height: `${heightEm.toFixed(4)}em`, width: "auto", verticalAlign: `${(-heightEm * m.baseline).toFixed(4)}em` }}
    />
  );
}
