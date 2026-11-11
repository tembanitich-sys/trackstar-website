import { Fragment } from "react";
import { BrandMark, type Surface } from "@/components/BrandMark";
import { productName } from "@/content/site";

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const NAMES = new RegExp(`(${escapeRegex(productName)}|InstaTickets)`, "gi");

/**
 * Text with the brand names shown as logos. The copy stays a plain string (it is also used for meta tags,
 * structured data and tests); this swaps the names for <BrandMark> where it is shown. Use it only where
 * the page should show logos: not for page titles, menus, buttons, form labels, consent wording or the
 * Privacy Notice. `on` is the background colour behind the text; `textPx` the smallest text size in this spot.
 * It always renders one <span>, so it stays one piece inside flex containers such as <summary>.
 */
export function Rich({ children, on = "light", textPx }: { children: string; on?: Surface; textPx: number }) {
  const parts = children.split(NAMES);
  return (
    <span>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <BrandMark key={i} name={part.toLowerCase() === productName.toLowerCase() ? "busrep" : "instatickets"} on={on} textPx={textPx} />
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </span>
  );
}
