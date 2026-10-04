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

Set these in Vercel (Project Settings, Environment Variables). Mark secrets as Sensitive. See `.env.example`.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical origin (`https://www.trackstar.co.zw`). Leave unset on previews: no canonical tag, and `robots.txt` disallows everything |
| `DATABASE_URL` | Postgres. The Neon integration sets it (and `POSTGRES_URL`) automatically |
| `RESEND_API_KEY` | Resend API key |
| `MAIL_FROM` | Sender on the verified domain, e.g. `TrackStar <noreply@send.trackstar.co.zw>` |
| `MAIL_TO` | Where enquiries are delivered: `info@trackstar.co.zw` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key (public) |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret key |
| `IP_HASH_SALT` | Secret salt for hashing IP addresses (rate limiting). Never store raw IPs |
| `ADMIN_PASSWORD` | `/admin` password (Phase 3) |
| `ADMIN_SESSION_SECRET` | Signs the `/admin` session cookie (Phase 3) |

## Enquiry forms

Both forms (`components/forms/`) submit to server actions (`app/actions/enquiry.ts`). Each submission, in order:

1. validated with Zod (`lib/enquiries/validation.ts`); phone numbers are checked with `libphonenumber-js` and stored as E.164;
2. rate limited per hashed IP (5 per 10 minutes per form, `lib/rate-limit.ts`);
3. Turnstile token verified server-side (`lib/turnstile.ts`). Without `TURNSTILE_SECRET_KEY` this fails closed in production. For previews you can use Cloudflare's dummy keys: site key `1x00000000000000000000AA`, secret `1x0000000000000000000000000000000AA`;
4. stored in Postgres;
5. emailed to `MAIL_TO` with reply-to set to the enquirer. If the email fails it is logged and the visitor still sees success; if the database write fails they see an error and no email is sent.

The pipeline is `lib/enquiries/process.ts`, with all services injected so tests run without a database or network.

## Database

Migrations are SQL files in `db/migrations/`, applied by `scripts/migrate.mjs` (`npm run db:migrate`). `npm run build` runs it first, so every deploy brings the schema up to date; it skips quietly when no database URL is set. Migrations are idempotent and additive only. Previews and production share one database unless you use Neon branching.

Tables: `operator_enquiries`, `contact_enquiries`, `site_settings`, `admin_audit`, plus `rate_limits` and `admin_login_attempts`.

## Regions

The Vercel function region follows the database region, not the visitor. Functions run next to the Neon database to keep queries fast, so a visitor in Zimbabwe is served by the same region as one anywhere else. If the database region changes, change the function region (Project Settings, Functions) to match.

## Email sending domain

Mail is sent from the Resend domain `send.trackstar.co.zw`. Resend will not deliver until its DNS records for that domain are added (Phase 5 checklist, item 3); until then sends fail, are logged, and enquiries are still saved.

## Status

Phase 2 (forms). `/privacy` shows its bracketed values until they are confirmed. `/admin` arrives in Phase 3.
