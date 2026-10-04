# TrackStar website

Public marketing and sales site for TrackStar (a Bullion Technologies product). Next.js App Router, TypeScript, Tailwind. Full brief: `docs/TRACKSTAR_WEBSITE_BRIEF.md`.

## Running locally

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # vitest
npm run typecheck && npm run lint && npm run build
```

## Editing copy

All page copy is in `content/site.ts`; wording that depends on a fact switch is composed in `content/compose.ts`. No em dash characters in copy (a test enforces it in `site.ts`).

## Facts to confirm before launch

Switches live in `content/facts.ts`. A `false` switch removes its content entirely (tests cover this).

| Switch | Value |
|---|---|
| `nativeCustomerApp` | false |
| `agentApp` | true |
| `whatsappBooking` | true |
| `ticketAuthenticator` | false |
| `manifests` | true |
| `parcels` | false |
| `directToOperatorAccount` | false |
| `operatorOwnsData` | false |
| `showPaymentMarks` | false |
| `showContactPhones` | false |
| `showAddress` | false |

Phone numbers and the office address go in `contactDetails` in the same file.

## InstaTickets setting

`prelaunch` (default) or `live` switches the top strip, the passenger section and the related FAQ answer. Phase 3 stores it in `site_settings` and edits it from `/admin`. Until then it is always `prelaunch`. In development only, `?it=live` or `?it=prelaunch` previews each state (cookie set by `proxy.ts`).

## Environment variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical origin (`https://www.trackstar.co.zw`). Leave unset on previews: no canonical tag, and `robots.txt` disallows everything |

More are added in later phases (database, email, Turnstile, admin).

## Status

Phase 1 (skeleton). The enquiry and contact forms render but their submit buttons are disabled until Phase 2. `/privacy` shows its bracketed values until they are confirmed.
