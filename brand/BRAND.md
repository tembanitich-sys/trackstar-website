# BusRep brand guide

**BusRep: Your Bus Online**

BusRep is the bus operator's digital representative: the software behind the operator's website, customer app, agent app, WhatsApp, payments and back office. The operator's brand stays in front of passengers; BusRep stands behind it. The identity should feel like dependable infrastructure, not a consumer travel app.

A Bullion Technologies product.

## Colours

| Name | Hex | Use |
|---|---|---|
| Navy | `#153B4E` | Primary. The B, "Bus", payoff line, backgrounds |
| Green | `#369851` | Accent. The road, "Rep" |
| Green text | `#2B7F44` | Green text smaller than 24 px on white |
| Neutral background | `#F5F7F8` | Page backgrounds |
| Border | `#DCE3E7` | Dividers, card borders |
| Body text | `#1E2A32` | Running text |
| White | `#FFFFFF` | Reverse artwork on navy; road markings |

Flat colour only: no gradients, shadows, outlines or tints in the logo.

Contrast notes: green on white is 3.6:1 and green on navy is 3.3:1. Both are fine for the logo and for text 24 px and larger, but not for small text. Use `#2B7F44` (5.0:1 on white) for small green text on white; on navy, set small text in white.

## The symbol

A bold B with a green road running up through it. The road enters at the lower left and sweeps up into the top bowl, forming both of the B's openings. White centre-line dashes shrink as the road climbs.

- **Full symbol** (`symbol/busrep-symbol.svg`): with road markings. Use at 48 px tall and above.
- **Small symbol** (`symbol/busrep-symbol-small.svg`): no markings and a wider gap between road and B. Use below 48 px, in favicons, badges and app UI.
- Reverse versions (white B) are for navy or dark backgrounds.

## Typography

- **Wordmark:** Nunito Black (900), tight tracking (-2.5%). "Bus" in navy, "Rep" in green. On navy: "Bus" in white, "Rep" in green.
- **Payoff line:** Nunito SemiBold (600), +4% tracking, sentence case: "Your Bus Online".
- **Website and documents:** Nunito / Nunito Sans.

All logo files have their text converted to outlines, so no fonts are needed to use them. Nunito is free from Google Fonts (SIL Open Font License).

## Lockups

| File | Use |
|---|---|
| `busrep-horizontal` | Primary. Website header, documents, email signatures |
| `busrep-horizontal-payoff` | Primary with payoff. Proposals, presentations, website hero |
| `busrep-stacked` | Square or narrow spaces |
| `busrep-stacked-payoff` | Covers, social profiles, posters |
| `busrep-wordmark` | Where the symbol cannot fit, such as very narrow headers |

Each comes as SVG (master) and as a 2000 px wide PNG with a transparent background; `-reverse` files are for navy backgrounds.

## Clear space and minimum size

- **Clear space:** keep a margin around the logo at least equal to the height of the capital B in the wordmark. The files are cropped tight to the artwork with no built-in margin, so the size you set is the size people see; add the clear space as padding when placing them.
- **Payoff line:** drop it when it would be smaller than 12 px. In practice, use the payoff lockups only when the wordmark's capital letters are at least 36 px tall.
- **Horizontal lockup:** minimum 120 px wide on screen, 30 mm in print.
- **Road markings:** only at 48 px and above. Below that, use the small symbol.

## Favicon and app icons

| File | Use |
|---|---|
| `icons/favicon.svg` | Modern browsers. Switches the B to white in dark mode automatically |
| `icons/favicon.ico` | Legacy browsers (16, 32, 48 px inside) |
| `icons/favicon-16.png` | Snapped to the 16 px pixel grid; use this rather than shrinking a larger file |
| `icons/favicon-32.png`, `favicon-48.png` | Standard sizes |
| `icons/apple-touch-icon.png` | iOS home screen, 180 px, navy tile |
| `icons/android-chrome-192.png`, `-512.png` | Android and PWA, with `site.webmanifest` |

Suggested HTML:

```html
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta property="og:image" content="https://[YOUR DOMAIN]/og-image.png">
```

## Powered by BusRep

`badges/powered-by-busrep.svg` (light backgrounds) and `-reverse.svg` (navy). Use in operators' apps and sites where BusRep runs underneath. They use the small symbol, and on navy the wordmark is all white because green at badge size is too faint there. Keep the badge small and quiet; it should never compete with the operator's brand.

## Social

`social/og-image.png`, 1200 x 630 px, for link previews.

## Do not

- Redraw, stretch, rotate or recolour the symbol or wordmark.
- Use the full symbol with road markings below 48 px.
- Add effects: gradients, shadows, outlines, glows.
- Put the logo on busy photos or on colours other than white, `#F5F7F8` or navy.
- Retype the wordmark in live text; use the outlined files.
- Put the payoff line where it falls below 12 px.

## Open items

- Trademark secured.
- The payoff "Your Bus Online" was approved on 6 October 2026. If it changes, only the four `-payoff` lockups and the OG image need regenerating.
