BRAND.md
TrackStar brand hand-off, v1.1, October 2026

COLOUR TOKENS
  navy        #153B4E   sampled from the supplied logo (median of interior pixels)
  green       #369851   sampled from the supplied logo (median of interior pixels)
  neutral-bg  #F5F7F8   section and card backgrounds
  border      #DCE3E7   dividers, card and input outlines (not for text)
  text        #1E2A32   body copy

  Supporting (optional, for small text only):
  muted       #5B6B75   secondary text, captions (5.52:1 on white)
  green-text  #2B7F44   green links or labels under 19 px bold / 24 px regular (4.97:1 on white)

  Contrast (WCAG 2.x):
  text on white          14.66:1   AAA
  navy on white          11.88:1   AAA
  green on white          3.64:1   large text and graphics only
  white on navy          11.88:1   AAA
  neutral-bg on navy     11.06:1   AAA
  green on navy           3.26:1   large text and graphics only
  text on navy            1.23:1   do not use

  Green on navy passes the 3:1 threshold for graphics and large text, so the
  reversed logo keeps the original green with no adjustment. If you ever want
  more lift on navy, the lightest step is #3CA35A (3.72:1), but I recommend
  keeping #369851 so the logo is one colour everywhere.

TYPOGRAPHY (Google Fonts)
  Headings: Nunito, weights 800 (display, H1, H2) and 700 (H3, buttons)
  Body:     Nunito Sans, weights 400 (body), 600 (emphasis, labels), 700 (strong)
  Embed:    https://fonts.googleapis.com/css2?family=Nunito:wght@700;800&family=Nunito+Sans:wght@400;600;700&display=swap
  Nunito is a very close match to the wordmark's rounded geometric letterforms.
  Never set the word "TrackStar" in Nunito as a substitute for the logo; use the files.

CLEAR SPACE
  Unit T = the cap height of the "T" in the wordmark, at the size the logo is used.
  Keep at least 1 T clear on every side of every logo version.
  Example: horizontal lockup at 40 px high has T of about 18 px, so keep 18 px clear.

MINIMUM SIZES
  Horizontal lockup   32 px high (screen)
  Full stacked logo   120 px wide (screen), 30 mm wide (print)
  Wordmark only       96 px wide
  Symbol only         48 px high
  Footer stacked      lockup at 56 px high or more (the endorsement line matches the lockup width)
  Footer inline       lockup at 40 px high or more (endorsement line set at 11 px)
  Below these sizes, use the small-size mark (once approved).

WHICH FILE TO USE
  On white or light backgrounds (white, neutral-bg):
    header           trackstar-horizontal.svg
    hero / about     trackstar-full.svg
    footer           trackstar-footer-stacked.svg or trackstar-footer-inline.svg
    text-only spots  trackstar-wordmark.svg
  On navy (#153B4E):
    header           trackstar-horizontal-reversed.svg
    hero / about     trackstar-full-reversed.svg
    footer           trackstar-footer-stacked-reversed.svg or trackstar-footer-inline-reversed.svg
    text-only spots  trackstar-wordmark-reversed.svg
  Use SVG on the website; PNGs are 2x exports for places that cannot take SVG.

BULLION TECHNOLOGIES ENDORSEMENT (v1.1)
  The footer lockups now include a vector rebuild of the Bullion Technologies logo.
  Footer layout: TrackStar lockup | divider | "A PRODUCT OF" + Bullion logo.
  Label: Montserrat 600, uppercase, letter-spacing 0.227em (same tracking as
  "TECHNOLOGIES" in the Bullion logo), colour bullion-navy #132742 (white on navy).
  Alignment: the label baseline sits on the baseline of "Bullion". The Bullion logo
  is the same height as the TrackStar lockup (40 px), with 10 px between label and logo.
  Text-only alternative: endorsement-line.svg ("A BULLION TECHNOLOGIES PRODUCT" with
  the Bullion emblem), for tight spaces.

  Bullion colour tokens (sampled from the supplied Bullion logo):
  bullion-gold          #E0AB0D   B emblem (graphics only, 2.10:1 on white)
  bullion-bronze        #AD8F65   "Bullion" wordmark (3.05:1 on white, logo only)
  bullion-navy          #132742   squares, endorsement label (15.04:1 on white)
  bullion-bronze-dark   #8C6F45   small bronze text on light (4.69:1 on white)
  bullion-bronze-light  #C9AE84   bronze on TrackStar navy (5.58:1)

  Bullion files: bullion-logo.svg (flat, recommended on screen),
  bullion-logo-metallic.svg (gold gradient, as in the original),
  bullion-logo-reversed.svg (navy backgrounds: squares white, wordmark bronze-light),
  bullion-emblem.svg.
  Source note: rebuilt from a 162 x 82 px crop. The B, dots and square fan are
  measured geometry; the wordmark is set in Montserrat SemiBold, the closest free
  match. Confirm with Bullion Technologies, or replace with their master file if
  one exists.

FAVICON AND APP ICONS (pending your approval of the mark)
  <link rel="icon" href="/icon.svg" type="image/svg+xml">
  <link rel="icon" href="/icon-512.png" sizes="512x512" type="image/png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  manifest icons: icon-192-maskable.png and icon-512-maskable.png with "purpose": "maskable",
  plus icon-512.png with "purpose": "any"; theme_color #153B4E, background_color #FFFFFF.

CONCERNS AT SMALL SIZES
  1. The four-part symbol gets busy below about 48 px. In the 40 px header lockup it
     still reads, but the parcel's tape lines and the gap between parcel and passenger
     blur together. Do not go below 32 px high.
  2. The proposed mark (green pin with person) reads well at 32 px. At 16 px the person
     becomes a single dot inside a ring: it reads as "a green location pin", which is fine
     for a favicon but is a generic shape shared with many map and delivery apps.
  3. Green text below 19 px bold on white fails AA (3.64:1). Use green-text #2B7F44
     for small green copy and links.
  4. The supplied raster had small inconsistencies (the pin was slightly lopsided and the
     artwork carried faint dark edge halos). The rebuild draws the pin, heads and headlights
     as true circles and straight tangents, and drops the halos. Everything else is traced
     from the original at sub-pixel accuracy. The original vector source, if it exists,
     would still be the best master; please send it if you find it.
