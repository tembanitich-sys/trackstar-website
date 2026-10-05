# TrackStar website

Public marketing and sales site for TrackStar (a Bullion Technologies product).

- **Site:** Next.js (App Router, TypeScript, Tailwind), built as a **static export**: `npm run build` writes plain files to `out/`.
- **Forms:** two small PHP 8 scripts in `public/api/` (MySQL for storage, PHPMailer for e-mail).
- **Hosting:** ordinary PHP/MySQL hosting (Hepsia). The site's domain is **trackstar.co.zw** (live at www, tried first on a test subdomain). Vercel is used only for visual previews of the pages; the forms do not work there.
- **Not this site:** the live TrackStar operator portal (`portalUrl` in `site.config.json`) is a different platform, hosted elsewhere. It is never touched or presented as the website; the site only links to it ("Operator login", in the header and footer, same tab).

To put the site online, follow **[DEPLOY.md](DEPLOY.md)**. Original brief: `docs/TRACKSTAR_WEBSITE_BRIEF.md` (see "Where this differs from the brief" below).

## Commands

```bash
npm install
npm run dev                 # http://localhost:3000 (pages only; forms need PHP, see below)
npm test                    # all tests (PHP tests run when `php` is installed)
npm run typecheck && npm run lint
npm run build               # static site into out/

npm run package:test        # dist/trackstar-test-subdomain.zip   (test subdomain, hidden from search)
npm run package:production  # dist/trackstar-production.zip       (www, open to search engines)
```

Each package script builds, checks the result (required files present, no `config.php`, the right domain, canonical URLs, a sensible `robots.txt`, the portal linked only as the portal) and zips the contents of `out/`.

The two packages differ only in where they say they live: production has canonical URLs, a sitemap and an open `robots.txt`; the test one is blocked from search engines (`robots.txt`, a `noindex` tag and an `X-Robots-Tag` header).

Testing on another address: `npm run package:test -- some.host.example` builds the test package for that host name. For a temporary address that has no HTTPS certificate yet, add `--allow-http` (turns off forced HTTPS for that test build only; refused for production).

## The domain: one setting

`site.config.json` is the only place the site's domain is written:

```json
{ "domain": "trackstar.co.zw", "testSubdomain": "new", "portalUrl": "https://www.trackstar.solutions" }
```

Everything else follows from it: the public contact e-mail (`info@<domain>`, also in the Privacy Notice), canonical URLs, the sitemap, structured data, social-sharing image URLs, the `.htaccess` apex-to-www redirect, and the production and test host names. To change the domain, edit that file and run the package scripts. `portalUrl` is the "Operator login" target. A test fails if the domain or an e-mail address is written anywhere else in code or markup.

The e-mail addresses the PHP scripts send from and to (`MAIL_FROM`, `MAIL_TO`) are **not** in the code: they are in `public/api/config.php`.

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
3. **Rate limit:** 5 per 10 minutes per form, per hashed IP (HMAC with `IP_SALT`; raw IPs are never stored), counted in the `rate_limits` table.
4. **Turnstile** (Cloudflare), only when `TURNSTILE_SECRET` is set in `config.php`; off otherwise.
5. **Save** to MySQL with prepared statements, before anything is e-mailed.
6. **E-mail** through SMTP (PHPMailer) from `MAIL_FROM` to `MAIL_TO`, both set in `config.php`, with reply-to set to the enquirer. If sending fails it is logged to `api/logs/api.log` and the visitor still sees success.

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
- `tests/phone-parity.test.ts`: PHP phone check against libphonenumber-js.
- `tests/php.test.ts`: PHP and website option lists must match; `config.example.php` must list every setting; the old domain must not appear.

## Where this differs from the brief

The brief (`docs/TRACKSTAR_WEBSITE_BRIEF.md`) was written for Vercel, Postgres and Resend. What changed:

- Static export plus PHP/MySQL instead of server actions, Neon and Resend. Hosting is Hepsia, with a test subdomain first.
- No `/admin` page and no `admin_audit` table; leads are read in the inbox and phpMyAdmin.
- `instatickets_status` is a build-time setting (`instaTicketsStatus` in `content/facts.ts`), not a database setting, and there is no `?it=` development preview.
- The site domain is one setting (`site.config.json`); `MAIL_FROM` and `MAIL_TO` are in `config.php`.
- A small "Operator login" text link (header and footer, same tab) goes to the operator portal, `portalUrl`. The brief's "No Sign In" in the header is superseded. Because the header now has one more item, the full menu appears from 1024 px wide; below that it is the hamburger menu (which also has the link).
- Vercel Web Analytics is gone (it only exists on Vercel). The privacy notice still says "basic, anonymous usage statistics, collected without cookies"; see DEPLOY.md before publishing it.
- Vercel previews show the pages only; the PHP forms cannot work there.
