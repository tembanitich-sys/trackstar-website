/**
 * The two brand colours that metadata and the web manifest need as literal values (they cannot use
 * CSS variables). They must equal the tokens in app/globals.css and brand/BRAND.md; a test checks it.
 */
export const brandColors = {
  navy: "#153B4E",
  white: "#FFFFFF",
} as const;
