# BusRep website

Public marketing and sales site for BusRep, "Your Bus Online" (a Bullion Technologies product). Brand rules: [`brand/BRAND.md`](brand/BRAND.md).

- **Site:** Next.js (App Router, TypeScript, Tailwind), built as a **static export**: `npm run build` writes plain files to `out/`.
- **Forms:** two small PHP 8 scripts in `public/api/` (MySQL for storage, PHPMailer for e-mail).
- **Hosting:** ordinary PHP/MySQL hosting (Hepsia). The site's domain is **busrep.co.zw** (live at www, tried first on a test subdomain). Vercel is used only for visual previews of the pages; the forms do not work there.
- **Not this site:** the operator portal (`portalUrl` in `site.config.json`) is a different platform, hosted elsewhere and being moved to the BusRep identity. It is never touched or presented as the website; the site only links to it ("Operator portal", in the header and footer, same tab).

To put the site online, follow **[DEPLOY.md](DEPLOY.md)**. Original brief: `docs/TRACKSTAR_WEBSITE_BRIEF.md`, kept as history (it predates the BusRep name; see "Where this differs from the brief" below).

## Commands

```bash
npm install
npm run dev                 # http://localhost:3000 (pages only; forms need PHP, see below)
npm test                    # all tests (PHP tests run when `php` is installed)
npm run typecheck && npm run lint
npm run build               # static site into out/

npm run package:test        # dist/busrep-test-subdomain.zip   (test subdomain, hidden from search)
npm run package:production  # dist/busrep-production.zip       (www, open to search engines)
```

Each package script builds, checks the result (required files present, no `config.php`, the right domain, canonical URLs, the icon, manifest and OG tags from `brand/BRAND.md`, a sensible `robots.txt`, the portal linked only as the portal) and zips the contents of `out/`.

The two packages differ only in where they say they live: production has canonical URLs, a sitemap and an open `robots.txt`; the test one is blocked from search engines (`robots.txt`, a `noindex` tag and an `X-Robots-Tag` header). Both use the same absolute `og:image` URL on the live domain.

Testing on another address: `npm run package:test -- some.host.example` builds the test package for that host name. For a temporary address that has no HTTPS certificate yet, add `--allow-http` (turns off forced HTTPS for that test build only; refused for production).

## Name, domain and contact e-mail: settings

`site.config.json` is the only place these are written:

```json
{
  "productName": "BusRep",
  "legalProductName": "BusRep",
  "legalEntityName": "Bullion Technologies Private Limited",
  "legalEffectiveDate": "",
  "hostLogRetention": "3 months",
  "domain": "busrep.co.zw",
  "contactEmail": "info@busrep.co.zw",
  "testSubdomain": "new",
  "portalUrl": "https://www.trackstar.solutions"
}
```

- **`productName`** is used wherever the name appears in text: page copy (in the brand spelling "BusRep" even in capital lines, for example "GET BusRep"), form labels, alt text and aria labels, page titles and descriptions, `og:site_name`, the web manifest, structured data, and the subject and body of the notification e-mails. `npm run sync:config` (it runs before every build) copies the file to `public/api/site.config.json` so the PHP scripts read the same value.
- **`legalProductName`** is the name used inside legal text: the Privacy Notice and the consent wording beside the form checkboxes. It is separate so legal wording changes only after review. It is `BusRep`, the same as `productName`.
- **`legalEntityName`** is the company named as responsible in the Privacy Notice and in the footer copyright line (spelling still to be confirmed against the certificate).
- **`legalEffectiveDate`** is the Privacy Notice's effective date, as it should read. Empty in the repo: the test build shows `[DATE PUBLISHED]`; a production build (`npm run package:production`, or any build with `NEXT_PUBLIC_INDEXABLE=true`) fails until it is set.
- **`hostLogRetention`** is how long the web host keeps its server logs, as the Privacy Notice states it. The host's own setting must match (a line in the publish-day checklist in DEPLOY.md).
- **`domain`** gives the production and test host names (`www.<domain>`, `<testSubdomain>.<domain>`), canonical URLs, the sitemap, structured data, the absolute `og:image` URL and the `.htaccess` apex-to-www redirect.
- **`contactEmail`** is the public address shown on the site (contact page, footer, Privacy Notice, error messages).
- **`portalUrl`** is the "Operator portal" link target, a different site. When the portal has its new address, change this one line.

The addresses the PHP scripts send from and to (`MAIL_FROM`, `MAIL_TO`) are **not** in the code: they are in `public/api/config.php` (and the sender name defaults to `productName`).

Tests enforce all of this: they fail if the product name, the domain or an e-mail address is written anywhere else in code that produces text, and one test renames the product and checks that every page, the header, the footer, the manifest, the structured data and the e-mails follow, while the legal text stays on `legalProductName`.

## Brand

`brand/` holds the whole BusRep asset pack as supplied (source of truth, not deployed). The site uses these, copied unchanged (a test compares every copy byte for byte):

- `public/` root: `favicon.svg`, `favicon.ico`, `favicon-16/32/48.png`, `apple-touch-icon.png`, `android-chrome-192/512.png`, `og-image.png`. The `<head>` tags are the ones suggested in `BRAND.md`. `site.webmanifest` is served from the product-name setting with the same content as `brand/icons/site.webmanifest`, except `display` is `browser` (the site opens as an ordinary web page, not as an installed app).
- `public/brand/`: the horizontal, stacked and symbol SVGs (and their `-reverse` versions) that `components/Logo.tsx` places. The files are cropped tight, so the height you set is the height people see; `clearSpace()` gives the margin `BRAND.md` requires (the wordmark's capital B). Header logo: 32 px tall with 24 px of clear space above and below. Footer: stacked reverse on navy.
- Colours are tokens in `app/globals.css` (the palette from `BRAND.md`, plus functional `muted`, `error`, `error-bg` and `notice` for secondary text, form errors and privacy-notice placeholders, never used in brand areas; `tests/colours.test.ts` checks contrast). `content/brand.ts` holds the two literals metadata needs.
- Fonts: Nunito 600/700/800/900 for headings, buttons and labels; Nunito Sans 400/600/700 for running text. Both come from Google Fonts at build time through `next/font` and are served from this site.
- "Powered by BusRep" badges (`brand/badges/`) are for operators' own apps and sites. This is BusRep's own site, so it shows the full logo and no badge.

### Renaming or re-branding again: what the settings do not cover

Edit `site.config.json`, then change by hand what is not text:

- **Brand files:** replace `brand/`, re-copy the files listed above, and update the proportions in `components/Logo.tsx` (a test checks them against the SVGs).
- **Internal names**, which visitors never see: the `TrackStar*` PHP class names, `getTrackStar` in `content/site.ts`, the `TRACKSTAR_CONFIG` test variable, the `trackstar_utm` browser storage key, and the privacy-notice version string `2026-10-busrep-2` (`privacyNoticeVersion` in `content/site.ts` and `options.php`, stored with each enquiry; change both together whenever the Privacy Notice text changes).
- **Form anchor:** the enquiry form section is `#get-busrep`; the old `#get-trackstar` id is kept on the same section (`aliasId` in `components/ui.tsx`) so links already shared still land there. Remove the alias when those links no longer matter.
- **Documents:** `DEPLOY.md` and this README are written for BusRep; the original brief still says TrackStar.

## Editing copy

All page copy is in `content/site.ts`; wording that depends on a fact switch is composed in `content/compose.ts`. There are no em dash characters in copy (a test enforces it in `site.ts`). After any change, run `npm run package:production`, upload the new zip as described in DEPLOY.md.

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

`instaTicketsStatus` in `content/facts.ts` is `"prelaunch"` (default) or `"live"`. It switches the top strip, the "Looking for a bus ticket?" section and the related FAQ answer. It is a build-time setting: change it, run `npm run package:production`, upload.

## How the forms work

The pages are static; the forms are a small React component (`components/forms/`) that POSTs JSON with `fetch` to `/api/enquiry.php` and `/api/contact.php`. The PHP scripts (`public/api/`) do, in order:

1. **Honeypot:** a hidden field only bots fill; those submissions look successful but are dropped.
2. **Validation** with the same rules as the old TypeScript schemas (required fields, lengths, choices, e-mail shape, privacy acknowledgement) and the same messages, returned as JSON field errors (HTTP 422). Phone numbers are normalised to E.164 by `lib/phone.php`, a port of libphonenumber-js driven by metadata generated from it (`scripts/gen-phone-data.mjs`); a test compares the two on about 10,000 inputs.
3. **Rate limit:** 5 per 10 minutes per form, per hashed IP (HMAC with `IP_SALT`; raw IPs are never stored), counted in the `rate_limits` table. Rows older than 24 hours are deleted on every submission and by the daily `api/cleanup.php`.
4. **Turnstile** (Cloudflare), only when `TURNSTILE_SECRET` is set in `config.php`; off otherwise.
5. **Save** to MySQL with prepared statements, before anything is e-mailed.
6. **E-mail** through SMTP (PHPMailer) from `MAIL_FROM` to `MAIL_TO`, both set in `config.php`, with reply-to set to the enquirer. If sending fails it is logged to `api/logs/api.log` and the visitor still sees success. That log is capped at 1 MB and lines older than 30 days are removed (on every log write and every submission), as the Privacy Notice says.

**Daily cleanup:** `public/api/cleanup.php` runs both cleanups (spam-limit rows older than 24 hours, error-log lines older than 30 days) from a scheduled task (cron) set up in the hosting panel (DEPLOY.md, Part 7). It is safe to repeat, quiet unless something is wrong (`--verbose` shows what it did), and cannot run from the web: `api/.htaccess` serves only `enquiry.php` and `contact.php`, and the script refuses anything but the command line.

Settings live in `public/api/config.php` (copy of `config.example.php`, git-ignored). `.htaccess` rules make sure only `enquiry.php` and `contact.php` can be requested; config, logs, `lib/` and `vendor/` are never served. Requires PHP 8.0+ with `pdo_mysql`, `mbstring` and `openssl`.

Leads are read in the inbox and in phpMyAdmin (tables `operator_enquiries`, `contact_enquiries`). The schema is `db/schema.mysql.sql`. There is no admin page.

### Turnstile (optional)

Create a site in Cloudflare Turnstile, put the secret in `config.php` (`TURNSTILE_SECRET`) and build with the site key: `NEXT_PUBLIC_TURNSTILE_SITE_KEY=... npm run package:production`. The Content-Security-Policy in `public/.htaccess` already allows Turnstile.

### Running the forms locally

```bash
cp public/api/config.example.php public/api/config.php   # fill in a local MySQL database
npm run build && php -S localhost:8000 -t out
```

## Tests

`npm test` runs everything. The PHP tests need `php` on the path and skip themselves otherwise:

- `tests/php/handler_test.php`: the submission pipeline with fake services.
- `tests/api.test.ts`: starts a real PHP server and a fake SMTP server and exercises both endpoints over HTTP (save-then-email order, e-mail failure still succeeds, honeypot, rate limit, Turnstile on/off, hashed IPs, consent, E.164, missing config). It uses SQLite by default; to run it against MySQL/MariaDB with the real `db/schema.mysql.sql`:
  `TRACKSTAR_TEST_MYSQL_DSN="mysql:host=127.0.0.1;port=3306;dbname=trackstar_test;charset=utf8mb4" TRACKSTAR_TEST_MYSQL_USER=... TRACKSTAR_TEST_MYSQL_PASS=... npm test` (the test database's tables are dropped and recreated).
- `tests/php/services_test.php` (run by `tests/php.test.ts`): spam-limit rows deleted on every submission, error log pruned at 30 days, 1 MB rotation, and the daily `cleanup.php` script (what it removes, repeat-safe, exit codes). `tests/api.test.ts` checks it answers 404 from the web; `tests/php.test.ts` checks `api/.htaccess` does not allow it.
- `tests/phone-parity.test.ts`: PHP phone check against libphonenumber-js.
- `tests/php.test.ts`: PHP and website option lists must match; `config.example.php` must list every setting; the old domain must not appear.
- `tests/brand-assets.test.ts`, `tests/colours.test.ts`, `tests/typography.test.tsx`: the assets are the pack's files, icon sizes, flat artwork in palette colours only, clear space and minimum sizes; token values equal `brand/BRAND.md` and every text colour pairing is at least 4.5:1; font weights match what is loaded; no uppercase style touches the product name.
- `tests/rebrand-settings.test.tsx`: renaming through the settings changes everything it should, and legal text stays on `legalProductName`.

## Where this differs from the brief

The brief (`docs/TRACKSTAR_WEBSITE_BRIEF.md`) was written for Vercel, Postgres and Resend. What changed:

- Static export plus PHP/MySQL instead of server actions, Neon and Resend. Hosting is Hepsia, with a test subdomain first.
- No `/admin` page and no `admin_audit` table; leads are read in the inbox and phpMyAdmin.
- `instatickets_status` is a build-time setting (`instaTicketsStatus` in `content/facts.ts`), not a database setting, and there is no `?it=` development preview.
- The product name, domain and public contact e-mail are three settings (`site.config.json`); `MAIL_FROM` and `MAIL_TO` are in `config.php`.
- A small "Operator portal" text link (header and footer, same tab) goes to the operator portal, `portalUrl`. The brief's "No Sign In" in the header is superseded. Because the header now has one more item, the full menu appears from 1024 px wide; below that it is the hamburger menu (which also has the link).
- Vercel Web Analytics is gone (it only exists on Vercel). The privacy notice still says "basic, anonymous usage statistics, collected without cookies"; see DEPLOY.md before publishing it.
- Vercel previews show the pages only; the PHP forms cannot work there.
