# TrackStar Website: Claude Code Development Brief

**Project:** new Vercel project `trackstar-website` (separate from `instatickets-website` and `instatickets-backoffice`)
**Final domain:** www.trackstar.co.zw. An existing site currently runs there. Do not touch it; the domain is repointed only in Phase 5, after approval.
**Place this file at:** `docs/TRACKSTAR_WEBSITE_BRIEF.md`. Brand files from Claude Design go in `public/brand/` (Section 5).

---

## 1. Your role

Build the public marketing and sales website for TrackStar, a **live** white-label ticketing and transport management platform for bus operators. TrackStar is a Bullion Technologies product. The platform already runs and can onboard multiple operators; this project is the website only.

The site has four jobs, in this order of importance:

1. Sell TrackStar to bus operators.
2. Win operators who have **no ticketing system**, so none are left out of digital ticketing.
3. Explain, briefly and calmly, how TrackStar and InstaTickets fit together.
4. Send passengers who arrive looking for a ticket to InstaTickets.

All page copy is in **Appendix A** and the privacy notice in **Appendix B**. Use that text as written. Do not rewrite, extend or invent copy. If you think copy is wrong, say so in your plan; do not change it yourself.

## 2. How to work

1. Read this brief in full before writing code. Check which brand files exist in `public/brand/` and read `public/brand/BRAND.md`.
2. **Re-evaluate the brief first.** Post a plan covering: file structure, data model, services, environment variables, and a list of anything in this brief you think is wrong, contradictory, risky or unclear. Then **stop and wait for approval.** No code before approval.
3. Build in the phase order in Section 11. Each phase ends with a working preview deployment.
4. Keep all copy in `content/site.ts` and all fact switches in `content/facts.ts` (Section 4), so wording and claims can change without touching components.
5. Stop and ask when this brief is silent or ambiguous. Never guess on legal text, prices, operators, partners or product capabilities.

## 3. Stack

Use the same stack as the InstaTickets pre-launch website so the two projects can be maintained the same way.

| Area | Choice |
|---|---|
| Framework | Next.js (App Router), TypeScript, strict mode |
| Styling | Tailwind CSS with tokens from `public/brand/BRAND.md` |
| Hosting | Vercel; function region closest to Zimbabwe that is available |
| Database | Postgres via the Vercel Marketplace (e.g. Neon); migrations in the repo |
| Email | Resend (or equivalent) from a verified trackstar.co.zw sending domain |
| Spam protection | Cloudflare Turnstile on the form, verified server-side |
| Validation | Zod on the server; `libphonenumber-js` for phone numbers |
| Analytics | Vercel Web Analytics (cookieless) |
| Icons | One icon library (e.g. Lucide); no illustration packs |

No CMS. No animation libraries; use CSS transitions only, and respect `prefers-reduced-motion`. If you believe a different choice is clearly better, say so in your plan with the reason.

## 4. Fact switches (`content/facts.ts`)

Some capabilities are not yet confirmed for public claims. Every one of them is a boolean switch. **A section, card or line tied to a switch that is `false` must not render at all**: no placeholder, no "coming soon".

| Switch | Default | Controls |
|---|---|---|
| `nativeCustomerApp` | false | Wording "customer mobile app" (when false, say "mobile booking" instead; see Appendix A notes) |
| `agentApp` | true | Agent app card and chip |
| `whatsappBooking` | true | WhatsApp card and chip |
| `ticketAuthenticator` | false | "Ticket validation at boarding" card and FAQ line |
| `manifests` | true | Manifests in the RUN group |
| `parcels` | false | The PARCELS card |
| `directToOperatorAccount` | false | The line "payments go straight to your own account" |
| `showPaymentMarks` | false | Payment brand marks (wallet and card logos); copy stays generic either way |
| `showContactPhones` | false | Phone numbers on Contact and in the footer |
| `showAddress` | false | Office address on Contact, footer and structured data |

List every switch, and its current value, in the README under "Facts to confirm before launch". Write a test that each `false` switch removes its content from the rendered home page.

## 5. Brand

Brand files were produced in Claude Design (hand-off v1.1) and are placed in `public/brand/`. Each logo has an SVG and a 2x PNG; use the SVG on the site. The brand sheet is at `docs/brand/brand-sheet.pdf` for reference only.

| File | Use |
|---|---|
| `trackstar-horizontal.svg` (+ `-reversed`) | Header, desktop and mobile. Never below 32 px high. Reversed on navy |
| `trackstar-wordmark.svg` (+ `-reversed`) | Tight spots only, where the horizontal lockup would fall below 32 px high |
| `trackstar-full.svg` (+ `-reversed`) | Hero and footer |
| `trackstar-symbol.svg` (+ `-reversed`) | Decorative use in the platform section only, sparingly, never below 48 px high |
| `trackstar-mark.svg` | Not used on pages; it is the source of the icon set |
| `icon.svg`, `icon-512.png`, `icon-32.png`, `icon-16.png`, `apple-touch-icon.png`, `icon-192-maskable.png`, `icon-512-maskable.png` | Favicon, touch icon and web manifest, wired as in the "FAVICON AND APP ICONS" part of `BRAND.md` (theme colour #153B4E, background #FFFFFF) |
| `og-image.png` | Open Graph and Twitter image (1200 x 630) |
| `BRAND.md` | Colour tokens, fonts, clear space, minimum sizes |
| `bullion-full.png`, `bullion-compact.png` | Copy these from the `instatickets-website` repo (`public/brand/`). Footer endorsement only, on white or light backgrounds only |

Rules:
- Use the files exactly as supplied. Never redraw, crop, recolour or recreate any logo in CSS, SVG or code.
- Take every colour and font from `BRAND.md`. If `BRAND.md` is missing, stop and ask; do not sample colours from images yourself.
- If any file in the table is missing, stop and list what is missing before Phase 1.
- **Ignore the "BULLION TECHNOLOGIES ENDORSEMENT (v1.1)" part of `BRAND.md`** and every footer, endorsement or Bullion file it names. Those files contain an unapproved rebuild of the Bullion logo and are withheld from the repo. Do not recreate them.
- **Footer endorsement:** on a white or light band, place `bullion-compact.png` beside the live text "A BULLION TECHNOLOGIES PRODUCT" in Nunito Sans 700, uppercase, letter-spacing 0.14em, navy. This matches the wording on the InstaTickets website.
- **Green and contrast:** brand green `#369851` is 3.64:1 on white, so it is for the logo, graphics, icons and large text only. Small green text and links use `green-text` `#2B7F44`. Primary buttons use white text on `#2B7F44` or on navy, never on `#369851`. Never put body text colour on navy.
- **Fonts:** Nunito (700, 800) for headings and buttons, Nunito Sans (400, 600, 700) for body, loaded with `next/font/google` rather than the stylesheet link in `BRAND.md`, so they are self-hosted and allowed by the Content Security Policy. Never set the word "TrackStar" in Nunito in place of the logo.
- Style: premium, modern, technology-led, operator-focused, trustworthy. Clean cards, subtle shadows, strong type, generous spacing. It must read as infrastructure for businesses, not as a consumer bus-booking site.
- No stock photography, no fake product screenshots, no fake dashboards with invented numbers, no customer logos. Where a visual is needed, use simple abstract UI shapes built from the brand tokens with no real-looking data.
- Text on coloured backgrounds must meet WCAG AA.

## 6. Site structure

**Home** (`/`), in this order:

1. Hero
2. No ticketing solution?
3. Your brand, not ours
4. The platform (one grouped grid)
5. From search to boarding
6. Who TrackStar is for
7. TrackStar and InstaTickets (includes the "Already have a ticketing system?" path)
8. Looking for a bus ticket?
9. FAQ
10. Get TrackStar (final call to action and enquiry form, anchor `#get-trackstar`)

**Separate pages:** `/contact`, `/privacy` (Appendix B), `/terms` and `/cookies` (placeholder pages that say COMING SOON; do not write legal text). `/admin` (Section 9).

**Top strip** (above the header, every page, small): the passenger redirect line from Appendix A, driven by the InstaTickets setting (Section 8).

**Header:** logo left. Menu: Platform, Your Brand, InstaTickets, FAQ, Contact (the first four scroll to Home sections). One primary button: GET TRACKSTAR, linking to `#get-trackstar`. No Sign In. Hamburger menu on mobile.

**Calls to action:** only two kinds anywhere on the site.
- GET TRACKSTAR (primary): opens the form with "How can TrackStar help?" preset to *I need a ticketing system*.
- BOOK A DEMO (secondary): opens the form preset to *I would like a demo*.
Implement the preset with a query parameter or URL hash; the visitor can change it.

**InstaTickets links** go to `https://www.instatickets.co.zw` (passengers) or `https://www.instatickets.co.zw/for-businesses` (operators with an existing system). Open in the same tab.

## 7. Enquiry form and data

One form, as a server action or route handler. Every submission must:

- validate on the server with Zod and show clear field messages;
- verify the Turnstile token server-side;
- be rate-limited per IP (never store IP addresses in plain text);
- store the record in Postgres **before** sending any email;
- email the full enquiry to `info@trackstar.co.zw`, with reply-to set to the enquirer's email; if email sending fails, log it and still show success;
- show the success message from Appendix A.

**Phone numbers:** country selector defaulting to Zimbabwe (+263). Validate with `libphonenumber-js`, store E.164 (e.g. `+263771234567`), reject invalid numbers.

**Consent:** marketing checkbox unticked by default; store `marketing_consent` and `marketing_consent_at` (null if not given). Privacy acknowledgement is required; store `privacy_notice_version` (`2026-10-trackstar`).

**Duplicates:** do not merge. Each operator enquiry is a separate record (one company may send several).

**Tables:**

| Table | Key fields |
|---|---|
| `operator_enquiries` | id, full_name, company, phone_e164, email, country, fleet_size, help_type, current_ticketing (none / own_system / not_sure), current_system_name, message, marketing_consent, marketing_consent_at, privacy_notice_version, utm_source, utm_medium, utm_campaign, created_at |
| `contact_enquiries` | id, name, email, phone_e164, enquiry_type, message, privacy_notice_version, created_at |
| `site_settings` | key, value, updated_at, updated_by |
| `admin_audit` | id, action, details, created_at |

Contact form submissions also go to `info@trackstar.co.zw`.

## 8. InstaTickets setting

InstaTickets launches in November 2026. Until it does, passengers following a link from TrackStar cannot buy tickets there yet.

- Store `instatickets_status` in `site_settings` with values `prelaunch` (default) or `live`. It is edited from `/admin`, never derived from a date.
- The top strip, section 8 and the related FAQ answer use the `prelaunch` or `live` wording from Appendix A.
- Provide a development-only way to preview both states (e.g. a query parameter that does nothing in production).

## 9. Admin page

A minimal `/admin`, not linked from the public site and blocked in `robots.txt`:

- password from an environment variable, signed session cookie, lockout after repeated failed attempts;
- lists `operator_enquiries` and `contact_enquiries` newest first, with simple search;
- CSV export per table (phones in E.164);
- toggle for `instatickets_status`;
- every export and settings change written to `admin_audit`.

## 10. Quality, SEO and security

- Mobile first: design at 360 px wide first; tap targets at least 44 px; no horizontal scroll; forms usable one-handed.
- Lighthouse on mobile: Performance, Accessibility, Best Practices and SEO each at least 90.
- SEO: title `TrackStar | Bus Ticketing & Transport Management Platform`; meta description `TrackStar gives bus operators a complete ticketing and transport management platform for bookings, payments, agents, digital tickets and daily operations, under their own brand.`; canonical `https://www.trackstar.co.zw` read from an environment variable so preview deployments do not claim it; `sitemap.xml`; `robots.txt` blocking `/admin`; Organization structured data (include the address only when `showAddress` is true). Use these search concepts naturally, never stuffed: TrackStar Zimbabwe, bus ticketing system Zimbabwe, bus ticketing software, bus operator software, transport management software, digital ticketing Zimbabwe.
- Semantic HTML, one H1 per page, correct heading order, visible focus states, labelled form fields, alt text on every image.
- Security headers (Content Security Policy that allows Turnstile, HSTS, frame protection). No secrets in client code.
- `README.md`: environment variables, running locally, editing copy in `content/site.ts`, the fact switches, the InstaTickets setting, and the Phase 5 domain checklist.

## 11. Phase order

| Phase | Scope |
|---|---|
| 1. Skeleton | Project setup, brand tokens from `BRAND.md`, layout, header, top strip, footer, all pages with Appendix A copy, fact switches, preview deployment |
| 2. Form | Enquiry and contact forms, database, validation, Turnstile, rate limiting, email to info@trackstar.co.zw, success states |
| 3. Admin | Admin login, lists, CSV export, InstaTickets setting, audit |
| 4. Polish | SEO, security headers, accessibility, Lighthouse targets, README |
| 5. Domain cutover | **Stop before any DNS change.** Produce the checklist below for approval; make no change to the existing site or DNS yourself. |

**Phase 5 checklist (prepare, do not execute):**
1. Inventory what the existing www.trackstar.co.zw serves: pages, subdomains, and any operator booking or ticket links in use. Anything live must keep working (redirect or keep the subdomain) before the root is repointed.
2. Record the current DNS zone in full, especially MX, SPF, DKIM and DMARC records, so `info@trackstar.co.zw` keeps receiving mail.
3. Add the Resend sending records without replacing existing mail records.
4. List the exact records to add for Vercel and the order of changes, with a rollback step.

**Acceptance for the whole build:**
- every rule in Section 12 holds;
- automated tests cover: phone validation and E.164 storage; consent defaults; email failure not blocking a submission; CTA presets on the form; each `false` fact switch removing its content; the `prelaunch` and `live` InstaTickets wording; and **no em dash character (U+2014) anywhere in `content/site.ts`**;
- the production build passes on Vercel with no errors or warnings, and the browser console is clean.

## 12. Content rules (must hold everywhere)

- Describe TrackStar as a ticketing and transport management platform for bus operators. Never as "an online bus booking website".
- TrackStar is bus-only. Do not mention events, sports or other transport modes.
- Never say or imply that operators must use InstaTickets, that TrackStar depends on InstaTickets, that InstaTickets is the only distribution channel, or that TrackStar is "the backend of InstaTickets".
- Never say or imply that any ticketing system connects to InstaTickets automatically.
- Do not name any bus operator, customer, partner, bank or payment provider. Payment copy stays generic ("mobile money and card payments"); brand marks appear only when `showPaymentMarks` is true.
- Do not invent or publish: operator, passenger, ticket or transaction numbers; revenue; market share; years of operation; awards; testimonials; certifications; security claims; regulatory approvals; prices, fees or commission rates.
- Do not display any person's name or personal email address.
- No em dashes in any copy.

## 13. Out of scope

Booking, payments, operator or passenger login, a demo environment, pricing pages, a blog, a CMS, any integration with the TrackStar platform or InstaTickets systems, and any change to the existing www.trackstar.co.zw site or DNS.

---

## Appendix A: Page copy

Lines marked `[switch: name]` render only when that switch is true.

### Top strip (every page)

- `prelaunch`: Looking for a bus ticket? Passengers book through InstaTickets, launching November 2026. **Pre-register on InstaTickets**
- `live`: Looking for a bus ticket? **Book on InstaTickets**

### Home

**1. Hero**
H1: YOUR TICKETING. YOUR BRAND. YOUR BUSINESS.
Subheading: A complete ticketing and transport management platform for bus operators.
Supporting line: Bookings, payments, agents, digital tickets and daily operations, all under your own brand.
Status line: Live now and onboarding bus operators.
Buttons: GET TRACKSTAR (primary), BOOK A DEMO (secondary).

**2. No ticketing solution?**
Headline: NO TICKETING SOLUTION?
Second line: DON'T WORRY. TRACKSTAR HAS YOU COVERED.
Copy: Your business should not have to wait for technology, or build its own. TrackStar gives you a complete, white-label ticketing platform, set up around your routes, your operation and your brand.
Chips: Your own website · Mobile booking `[when nativeCustomerApp: Customer app]` · Agent app `[switch: agentApp]` · WhatsApp booking `[switch: whatsappBooking]` · Mobile money and card payments · Digital tickets · Full back office
Button: GET TRACKSTAR

**3. Your brand, not ours**
Headline: YOUR BRAND. NOT OURS.
Copy: Your passengers see your business. TrackStar powers the technology behind it.
Points:
- Your website, in your name and your colours.
- Booking on mobile and WhatsApp `[switch: whatsappBooking]` under your brand.
- Tickets that carry your company name.
- Your passengers, your bookings and your data stay yours.

**4. The platform**
Headline: EVERYTHING YOU NEED TO RUN DIGITAL TICKETING.
Groups (one card each, title plus one line):
- SELL: Sell through your own website, mobile booking `[when nativeCustomerApp: customer app]`, WhatsApp `[switch: whatsappBooking]` and your agents `[switch: agentApp]`.
- GET PAID: Take mobile money and card payments as part of every booking. `[switch: directToOperatorAccount]` Payments go straight to your own account.
- RUN: Manage routes, schedules, trips, seats, bookings and passengers. Print or share manifests `[switch: manifests]`.
- CONTROL: Manage agents, branches, users and permissions from one back office.
- KNOW: See sales, bookings, trips, routes and agent activity in clear reports.
- BOARD: Issue digital tickets. Validate them at boarding with TrackStar Ticket Authenticator `[switch: ticketAuthenticator]`.
- PARCELS `[switch: parcels]`: Register and track luggage and parcels alongside your passenger operation.
Closing line: One platform. Every channel. Your brand.

**5. From search to boarding**
Headline: FROM SEARCH TO BOARDING.
Steps (one line each):
- SEARCH: Passengers choose departure, destination and travel date.
- SELECT: They pick a trip and a seat.
- BOOK: They enter passenger details.
- PAY: They pay by mobile money or card.
- TICKET: A digital ticket arrives in your name.
- BOARD: Your team checks the ticket at departure.

**6. Who TrackStar is for**
Headline: BUILT FOR BUS OPERATORS.
Cards:
- INTERCITY OPERATORS: Sell every route and every seat from one platform.
- CROSS-BORDER OPERATORS: Take bookings from passengers wherever they are.
- GROWING OPERATORS: Add routes, branches and agents without changing systems.
- ESTABLISHED OPERATORS: Modernise how you sell and manage tickets.
- STARTING FROM PAPER: Move from manual ticketing to digital, without building anything yourself.

**7. TrackStar and InstaTickets**
Headline: RUN YOUR BUSINESS WITH TRACKSTAR. REACH MORE CUSTOMERS WITH INSTATICKETS.
Copy: TrackStar gives you the technology to run your own ticketing operation through your own channels. InstaTickets is a separate marketplace where passengers discover and book tickets from participating operators. Both are Bullion Technologies products.
Flow (simple diagram): YOUR BUSINESS → TRACKSTAR → YOUR OWN CHANNELS, with an optional branch TRACKSTAR → INSTATICKETS → MORE PASSENGERS (label the branch "Optional").
Points:
- Your own channels work on their own. Joining InstaTickets is your choice.
- TrackStar connects to InstaTickets through the same integration standard and certification as every other ticketing system.
- Tickets sold through InstaTickets carry InstaTickets fees only. TrackStar fees apply only to tickets sold through your own TrackStar channels. No ticket is charged twice.
Buttons: GET TRACKSTAR (primary), EXPLORE INSTATICKETS (secondary, links to the InstaTickets home page).

Sub-card: **ALREADY HAVE A TICKETING SYSTEM?**
Copy: Keep it. Compatible ticketing systems may connect to InstaTickets, subject to integration requirements and approval.
Link: CONNECT YOUR SYSTEM TO INSTATICKETS (to `/for-businesses` on InstaTickets).

**8. Looking for a bus ticket?**
Headline: LOOKING FOR A BUS TICKET?
- `prelaunch`: TrackStar is technology for bus operators. Passengers will book through InstaTickets, launching November 2026. Pre-register now to hear first. Button: PRE-REGISTER ON INSTATICKETS
- `live`: TrackStar is technology for bus operators. To find and book a bus ticket, visit InstaTickets. Button: VISIT INSTATICKETS

**9. FAQ**
- **What is TrackStar?** A ticketing and transport management platform for bus operators. It runs your bookings, payments, agents, tickets and daily operations under your own brand.
- **Is TrackStar live?** Yes. The platform is live and onboarding bus operators.
- **I don't have a ticketing system. Can I still go digital?** Yes. That is what TrackStar is for. We set the platform up around your routes and your brand.
- **Will passengers see TrackStar or my company?** Your company. TrackStar works behind your brand.
- **Can my passengers pay with mobile money and cards?** Yes. Both are part of the booking journey.
- **Do I have to join InstaTickets?** No. Your own channels work on their own. InstaTickets is an optional extra channel.
- **Will I pay twice on tickets sold through InstaTickets?** No. Tickets sold through InstaTickets carry InstaTickets fees only. TrackStar fees apply only to tickets sold through your own TrackStar channels.
- **I already have a ticketing system. What are my options?** You can keep it. Compatible systems may connect to InstaTickets, subject to integration requirements and approval.
- **What does TrackStar cost?** It depends on your operation. Send us your details and we will take you through it.
- **Who is behind TrackStar?** TrackStar is a Bullion Technologies product.
- **I want to buy a bus ticket.** Use the InstaTickets wording for the current `instatickets_status` from Section 8.

**10. Get TrackStar** (anchor `#get-trackstar`)
Headline: READY TO DIGITISE YOUR TICKETING?
Copy: Whether you are moving from paper, replacing an existing system or starting from scratch, TrackStar gives you the technology to move forward.
Fields:
- Full Name (required)
- Company (required)
- Mobile Number with country selector, default +263 (required)
- Email Address (required)
- Country (required; default Zimbabwe)
- Fleet size: 1 to 5 buses, 6 to 15, 16 to 40, More than 40 (required)
- How can TrackStar help? (required): I need a ticketing system; I want to replace my current system; I would like a demo; I want to connect my system to InstaTickets; Other
- Current ticketing: None or manual; Our own system (show "System name", optional); Not sure
- Message (optional, multi-line)
- Checkbox, unticked: I would like to receive TrackStar updates by email.
- Checkbox, required: I have read the TrackStar Privacy Notice. (link to /privacy)
Button: SEND MY REQUEST
Success: THANK YOU. WE HAVE RECEIVED YOUR REQUEST. The TrackStar team will contact you to discuss your operation, a demo and onboarding.

### Contact

Headline: GET IN TOUCH
Email: info@trackstar.co.zw (`mailto:` link)
Phones `[switch: showContactPhones]`: values supplied later in `content/facts.ts`; render as `tel:` links.
Address `[switch: showAddress]`: value supplied later in `content/facts.ts`.
Form: Name, Email, Phone, Enquiry Type (General, Sales, Demo, Integration, Technical, Other), Message, required Privacy Notice checkbox. Button: SEND MESSAGE. Success: THANK YOU. YOUR MESSAGE HAS BEEN RECEIVED.
Note: Bus operators interested in TrackStar: please use the Get TrackStar form. (link to `/#get-trackstar`)

### Footer (every page)

Full logo (reversed if on navy). YOUR TICKETING. YOUR BRAND. YOUR BUSINESS.
Endorsement, on a white or light band: A BULLION TECHNOLOGIES PRODUCT, with the Bullion logo.
Line: Bullion Technologies products: InstaTickets · TrackStar (InstaTickets links to its home page).
Links: Platform, Your Brand, InstaTickets, FAQ, Contact, Get TrackStar.
Contact: info@trackstar.co.zw. Phones and address only when their switches are true.
Legal: Privacy Notice, Terms & Conditions (COMING SOON), Cookie Policy (COMING SOON).
© 2026 TrackStar. All rights reserved.

---

## Appendix B: Privacy notice (`/privacy`)

Publish as below once the bracketed values are confirmed. Until then, render the brackets visibly so they cannot be missed.

**TRACKSTAR PRIVACY NOTICE**
Effective date: [DATE PUBLISHED]

This notice explains how TrackStar handles the personal information you give us through this website. It does not cover the TrackStar platform used by operators and their passengers, which has its own terms.

**Who we are**
TrackStar is operated by [REGISTERED COMPANY NAME], a Bullion Technologies company, [REGISTERED ADDRESS]. We are responsible for the information described in this notice.

**What we collect**
Operator enquiries: your name, company, mobile number, email address, country, fleet size, how we can help, details of any current ticketing system, your message, and whether you want marketing emails.
Contact form: your name, email, phone number, enquiry type and message.
Website use: basic, anonymous usage statistics. See the Cookie Policy.

**Why we use it**
- To respond to your enquiry, arrange a demo and discuss onboarding.
- To send TrackStar updates, only if you ticked the marketing box.
- To keep the website secure and understand how it is used.

**Who can see it**
Only authorised TrackStar staff and the service providers that host our website, database and email, who act on our instructions. Some of these providers may store information outside Zimbabwe; where they do, we take steps to protect it as required by law.
If your enquiry is about InstaTickets, we may share it with the InstaTickets team, which is also part of Bullion Technologies, so they can respond. We do not sell your information or share it with other companies for their own marketing.

**How long we keep it**
Operator enquiries: [24] months from your last contact with us, unless you become a TrackStar customer, in which case your customer agreement applies.
Contact form enquiries: [12] months after the enquiry is closed.

**Your choices and rights**
You can ask us to show you, correct or delete the information we hold about you, or stop sending you marketing emails at any time. Every marketing email will also tell you how to opt out.
To make a request, email info@trackstar.co.zw with the subject "Data Request". We will respond within [30] days.
If you are unhappy with how we handle your information, you may complain to the Data Protection Authority (POTRAZ).

**Changes**
We may update this notice. The effective date above shows when it last changed.

---

## First prompt to paste into Claude Code

```text
Read docs/TRACKSTAR_WEBSITE_BRIEF.md in full. Then check public/brand/: confirm every file
listed in Section 5 is present and read public/brand/BRAND.md. Do not write any code yet.

Re-evaluate the brief and post:
1. your plan: file structure, data model, services and environment variables;
2. any brand files that are missing or unusable;
3. anything in the brief you think is wrong, contradictory, risky or unclear, including
   copy in Appendix A that conflicts with the content rules in Section 12;
4. the fact switches in Section 4 with their defaults, so I can confirm them.

Then stop and wait for my approval before starting Phase 1.
```
