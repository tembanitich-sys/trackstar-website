# InstaTickets logo files for the BusRep website

Converted from `source/InstaTickets_Logo_Final.pdf` (Adobe Illustrator, pure vector). The shapes are the original artwork, unchanged; only the colours of the reverse versions differ. Four zero-area export slivers were removed. Every file is cropped tight to the artwork, with no built-in margin.

## Colours (from the source file)

| Name | Hex | Used for |
|---|---|---|
| InstaTickets navy | `#233367` | "Insta" |
| InstaTickets red | `#E11D25` | "Tickets" and the swoosh |

These are InstaTickets' own colours. Do not add them to the BusRep palette or use them anywhere except inside these logo files.

## Files

| File | Use |
|---|---|
| `instatickets-wordmark.svg` | Light backgrounds (white, `#F5F7F8`). Main file for inline use |
| `instatickets-wordmark-reverse.svg` | Navy and dark backgrounds, all white. Default for inline use on navy |
| `instatickets-wordmark-reverse-colour.svg` | Navy backgrounds, white "Insta" with red "Tickets". **Only at 48 px tall or more** |
| `instatickets-logo-tagline.svg` | With "BUS / EVENTS / SPORTS". Section headers and large placements only, never inline |
| `instatickets-logo-tagline-reverse.svg` | The same, all white, for navy |

Why the reverse version is all white: the red on BusRep navy (`#153B4E`) is only 2.5:1, below the 3:1 a logo needs. At inline sizes "Tickets" becomes hard to read. The two-colour reverse is fine when large.

Never place either logo on BusRep green (`#369851`); the red on that green is 1.3:1.

## Inline alignment (for the BrandMark component)

Size each logo so its capital letters match the surrounding text's cap height, then shift it down so its baseline sits on the text baseline. Nunito's cap height is 0.705 em.

| Logo | Height = cap height x | Baseline is this fraction of the height above the bottom | Width = height x |
|---|---|---|---|
| BusRep wordmark (`busrep-wordmark*.svg`) | 1.284 | 0.214 (the "p" descender) | 3.820 |
| InstaTickets wordmark (`instatickets-wordmark*.svg`) | 1.610 | 0.377 (the swoosh) | 4.573 |

In CSS terms, for text with font-size `F`:

```
height: calc(F * 0.705 * RATIO_HEIGHT);
vertical-align: calc(-1 * F * 0.705 * RATIO_HEIGHT * RATIO_BASELINE);
```

The InstaTickets swoosh hangs well below the baseline, so keep body line-height at 1.5 or more where it appears inline, or it will touch the line below.

## Minimum sizes

- InstaTickets wordmark: 16 px tall (about 10 px cap height, which suits body text of 14 px and up). Below that, fall back to plain text.
- Tagline versions: 64 px tall; the tagline is unreadable below that.

## Accessibility

Each logo must be announced once: either `alt="InstaTickets"` on the image, or visually hidden text with `alt=""`, never both.
