# Putting the TrackStar website online

This guide is for you, not a developer. It takes the finished website from a zip file to **https://www.trackstar.co.zw**, trying it first on a **test address** so you can check everything before anyone else sees it.

Allow about two hours the first time. You do not need to type any code, only fill in a few settings.

> **Two different sites.** The marketing website you are putting online lives at **trackstar.co.zw**. The TrackStar platform where operators sign in is a separate site that is hosted elsewhere. Nothing in this guide touches it. The website only has an **Operator login** link that sends visitors there.

> **A note on the screens.** The steps use the names Hepsia usually shows (File Manager, Databases, phpMyAdmin, Mail, and so on). Your panel may label things a little differently or put them in another menu. If you cannot find something, search the panel's help for the word in **bold**, or ask the hosting support team for exactly that item, for example "the SMTP server name and port for the mailbox noreply@trackstar.co.zw".

## What you have

| File | What it is |
|---|---|
| `trackstar-test-subdomain.zip` | The website for the **test address** (by default `new.trackstar.co.zw`). Hidden from Google on purpose. |
| `trackstar-production.zip` | The same website for **www.trackstar.co.zw**. Open to Google. Use it only at go-live (Part 7). |
| `schema.mysql.sql` | The instructions that create the database tables (Part 2). |

Both zips contain the **contents** of the site. Each already holds the form scripts in a folder called `api`. They never contain passwords: you create the settings file yourself (Part 4), and it stays on the server when you upload newer versions later.

## What the site needs from your hosting

Check these in the panel before you start (all are normal on PHP/MySQL hosting):

- [ ] PHP version **8.0 or newer** (look for **PHP version** or **PHP settings**; choose 8.1 or 8.2 if offered).
- [ ] You can create a **MySQL database** and open **phpMyAdmin**.
- [ ] You can create a **mailbox** (e-mail account).
- [ ] You can create a **subdomain** (or use another test address, see Part 1).
- [ ] The **File Manager** (or an FTP program) works.

If any of these is missing, stop and ask the host to enable it.

---

## Part 1. Prepare a test address

You will try the whole site on a test address first. Nothing else is affected by this.

### If trackstar.co.zw is already registered and added to this hosting

1. In the panel find **Subdomains** (sometimes under **Domains**). Create a subdomain named **new** on trackstar.co.zw.
2. Note the **folder** the panel assigns to it (for example `new` or `new.trackstar.co.zw`). This is the folder you will upload to.
3. If your domain's DNS is not managed in this same panel (for example it is at the domain registrar), the panel will tell you to add a DNS record for `new`. Add exactly what it says, then wait up to an hour. Opening `http://new.trackstar.co.zw` should show an empty or "welcome" page, not an error.
4. Turn on the free **SSL certificate** (**SSL**, **Let's Encrypt** or **Secure your site**) for the subdomain so the address works with `https://`. This can take a few minutes.

### If trackstar.co.zw is still being registered

The domain cannot be used until the registration is finished and its DNS points to this hosting, so a subdomain of it will not work yet. Use any other test address on **this hosting** instead:

- the **temporary address** the hosting gave you for your account (look for "temporary URL", "preview URL" or similar in the panel or in the welcome e-mail), or
- a subdomain of **another domain you own** that is on this hosting.

Do **not** use the operator platform's own domain for this: the platform is hosted elsewhere and must not be touched.

Two things to know:

1. **Ask for a matching test zip.** The test zip is built for `new.trackstar.co.zw`. It works on any address, but the picture shown when someone shares the link is tied to that name. If you are testing on a different address, ask for a test zip built for it.
2. **HTTPS.** The site forces `https://`. If your temporary address has no padlock (no SSL certificate), the browser cannot open it. Ask for a test zip built for plain `http://` (this is only for testing and is never used for the live site).

Write down your test address and its folder. Wherever this guide says "the test address", use yours.

---

## Part 2. Create the database

1. In **Databases** (or **MySQL**), create a new database. Suggested name: `trackstar`. The panel may add a prefix to the name; write down the **full** name it shows.
2. Create a database **user** with a strong password and give it **all privileges** on that database. Write down the **user name** and **password**.
3. Write down the database **host** (almost always `localhost`).
4. Open **phpMyAdmin** from the panel and click your new database in the left list.
5. Click the **SQL** tab. Open the file `schema.mysql.sql` in any text editor (Notepad is fine), select all, copy, and paste into the big box. Press **Go**.
6. You should see a green message and three tables in the left list: `operator_enquiries`, `contact_enquiries` and `rate_limits`. (Running it twice does no harm.)

Keep the three database details (name, user, password) handy for Part 4.

---

## Part 3. Mail settings

The website sends you a message for every enquiry. It needs a mailbox to send from and an address to send to. Both are just settings in a file (Part 4), so you can change them any time.

**Once trackstar.co.zw's e-mail is working** (the domain is registered and its mail points to this hosting):

1. In **Mail** (or **Mailboxes**, **E-mail accounts**), create the mailbox **noreply@trackstar.co.zw** with a strong password. Write the password down.
2. Make sure **info@trackstar.co.zw** exists as a mailbox or forwarder and that you can read it. This is where enquiries will arrive.

**While the domain is still being registered**, mail for it cannot work yet. For testing, use what you already have:

- Create (or use) any mailbox on this hosting for sending, for example one on the temporary domain. Most hosts only allow sending from a mailbox on the account.
- For receiving, use an e-mail address you can already read, for example your own.

You will switch to the real addresses in Part 7.

Whichever you use, find the **outgoing mail (SMTP) server** details for the sending mailbox: server name (often `mail.<your domain>`), port, and whether it uses SSL/TLS. These are usually listed in the mailbox's "settings for mail programs" or "manual configuration" page. Write down: **server**, **port**, and **security**.

- Port **587** with **STARTTLS/TLS** is the common choice, and port **465** with **SSL** the other.

---

## Part 4. Upload the test site and fill in the settings file

### Upload

1. In **File Manager**, open the folder for the test address (Part 1).
2. **Upload** `trackstar-test-subdomain.zip` into that folder.
3. Select the zip and choose **Extract** (or **Unzip**). Choose "extract here". When asked, allow overwriting.
4. Delete the zip file from the server afterwards.
5. Switch on **show hidden files** in File Manager's settings, and confirm you can see a file called `.htaccess` in the folder, and another one inside `api`. They are essential: without them the security rules do not apply.
   - If you prefer FTP: unzip the file on your computer, then upload everything inside, **including the hidden files**. Many FTP programs hide files that start with a dot; switch on "show hidden files" first.

You should now see these inside the folder: `index.html`, `.htaccess`, `api`, `contact`, `privacy`, `_next`, `brand` and others.

### Create `config.php`

1. Open the `api` folder.
2. Find `config.example.php`. **Copy** it (right-click, Copy) and name the copy exactly `config.php`.
3. **Edit** `config.php` (right-click, Edit or Code Edit). Replace every `CHANGE_ME...` as follows. Keep the quotes and commas as they are, and change only the text between the quotes:

| Setting | What to put |
|---|---|
| `DB_HOST` | `localhost` (or what Part 2 said) |
| `DB_NAME` | the full database name from Part 2 |
| `DB_USER` | the database user from Part 2 |
| `DB_PASS` | the database password from Part 2 |
| `SMTP_HOST` | the SMTP server from Part 3 |
| `SMTP_PORT` | the port from Part 3, for example `587` |
| `SMTP_SECURE` | `tls` for port 587, `ssl` for port 465 |
| `SMTP_USER` | the sending mailbox (live: `noreply@trackstar.co.zw`) |
| `SMTP_PASS` | that mailbox's password |
| `MAIL_FROM` | the same sending mailbox address as `SMTP_USER` |
| `MAIL_TO` | where enquiries are delivered (live: `info@trackstar.co.zw`; while testing, an address you can read) |
| `IP_SALT` | any long made-up text (40 or more random letters and numbers, no spaces). Make it up once and keep it |
| `TURNSTILE_SECRET` | leave empty `''` unless you set up Cloudflare Turnstile (optional; see README) |

4. **Save.** The file must be named `config.php`, in the `api` folder, next to `enquiry.php`.

> **Never share `config.php`** or put it in an e-mail. It contains passwords. The site's rules stop the web server from ever showing it (you will check this in Part 5).

---

## Part 5. Test everything on the test address

Open the test address (with `https://`) in a normal browser window and work through this list. Tick each line.

### The pages

- [ ] The home page loads, with the logo, the blue strip at the top and the footer.
- [ ] The padlock shows (the address starts with `https://`). Typing `http://` before the address jumps to `https://` by itself.
- [ ] **Contact**, **Privacy Notice**, **Terms & Conditions** and **Cookie Policy** open. Terms and Cookie Policy say COMING SOON.
- [ ] A made-up page such as `/nothing-here` shows the site's own "page not found" page.
- [ ] It looks right on your phone.
- [ ] **Operator login** (top of the page on a computer, in the menu on a phone, and at the bottom of every page) opens the TrackStar platform's sign-in site in the **same tab**. (This only checks the link; you do not need to sign in.)

### The forms

- [ ] On the home page, press **GET TRACKSTAR** (top right). The page jumps to the form and "How can TrackStar help?" says **I need a ticketing system**. Press **BOOK A DEMO** in the first section: it now says **I would like a demo**.
- [ ] Fill in the form with a made-up request and a mobile number, tick the privacy box, press **SEND MY REQUEST**. The button briefly says SENDING... and then you see **THANK YOU. WE HAVE RECEIVED YOUR REQUEST.**
- [ ] The request is **saved**: in phpMyAdmin open the database, click `operator_enquiries`, press **Browse**. Your test is there, with the phone shown like `+263771234567` (starting with `+`, no spaces).
- [ ] The e-mail **arrived** at the `MAIL_TO` address. Press **Reply**: the reply goes to the person who filled in the form, not to the sending mailbox. (If nothing arrived, check Spam, then see "If something does not work" below.)
- [ ] Try a mistake: a mobile number of `12`. You see a red message under the number, and everything you typed is still there.
- [ ] Do the same on the **Contact** page: send a message, and confirm it appears in `contact_enquiries` and in the inbox.
- [ ] Spam limit: send six valid test requests in a row (reload the page after each one, because the form shows the thank-you message). The sixth says **Too many requests**. It resets after 10 minutes. (This sends six test e-mails, so do it last.)

### Security spot checks

Type these addresses after your test address. **Every one must show "Forbidden" or "Not found", never a page of text or code:**

- [ ] `/api/config.php`
- [ ] `/api/config.example.php`
- [ ] `/api/logs/`
- [ ] `/api/lib/phone.php`

If any of these shows anything else, **stop** and see "If something does not work" (the `.htaccess` files are probably missing).

- [ ] `/robots.txt` says `Disallow: /` (the test copy is hidden from Google).

### Clean up the test data

When you are happy, in phpMyAdmin open the three tables (`operator_enquiries`, `contact_enquiries`, `rate_limits`), use the **Empty** option for each and confirm. This removes your test entries so the live database starts clean.

---

## Part 6. Show it to others before go-live (optional)

Send the test address to the people who should approve it. Anything you change in the text needs a new zip (ask your developer or Claude to make one); see Part 9.

---

## Part 7. Go live on www.trackstar.co.zw

Do this once Part 5 is completely ticked and **trackstar.co.zw is registered**.

### Point the domain at the hosting

1. In the panel, **add the domain** trackstar.co.zw to the hosting (look for **Domains**, **Add domain** or **Parked domains**). Note the **folder** it uses. The domain has no website yet, so this folder starts empty.
2. At the place where the domain is registered, point it to the hosting. Either change its **nameservers** to the ones the hosting gives you, or add the records the panel lists (an **A** record for `www` and for the bare domain, and the **MX** records if you want e-mail on the hosting). The hosting's support team can tell you exactly which. This can take from a few minutes to a day to spread.
3. Turn on the free **SSL certificate** for trackstar.co.zw and www.trackstar.co.zw (it can only be issued once the domain points to the hosting).
4. Create the real mailboxes now if you have not: **noreply@trackstar.co.zw** and **info@trackstar.co.zw** (Part 3), and ask your host to switch on **SPF** and **DKIM** for the domain's mail so messages are not marked as spam.

### Upload the live site

1. In File Manager, open the folder for www.trackstar.co.zw (step 1 above).
2. **Upload `trackstar-production.zip`** into it and **Extract**, exactly as in Part 4 (confirm the hidden `.htaccess` files are there, in the main folder and in `api`). Delete the zip afterwards.
3. **Copy `config.php`** from the test site (`api/config.php`) into this folder's `api` folder. Then **edit** it for the live addresses: `SMTP_USER` and `MAIL_FROM` = `noreply@trackstar.co.zw` (with its password in `SMTP_PASS`), `MAIL_TO` = `info@trackstar.co.zw`, and the SMTP server details for those mailboxes. The database settings can stay the same, because you emptied the test entries in Part 5.
4. Open **https://www.trackstar.co.zw**. Hold Ctrl (or Cmd on Mac) and press R to refresh. You should see the website.
5. **Repeat the Part 5 checks on www** (with the live address). Two differences:
   - `/robots.txt` should now **allow** search engines and list the sitemap.
   - Do one last test enquiry and check it arrives at **info@trackstar.co.zw**. Then delete that test row in phpMyAdmin, so only real leads remain.
6. Open `https://trackstar.co.zw` (without www). It should jump to `https://www.trackstar.co.zw`.

### If you need to take it down again

Delete the files in the folder (keep a copy of `api/config.php` first if you want it). Nothing else changes: the TrackStar platform is a different site and is not affected by anything in this guide.

---

## Part 8. After it is live

- **Reading enquiries.** In your inbox, and in phpMyAdmin: open the database, click `operator_enquiries` or `contact_enquiries`, press **Browse**. To download them as a spreadsheet use the **Export** tab, choose **CSV**. Times are in UTC (Zimbabwe time is two hours ahead).
- **Looking after the data.** The Privacy Notice promises how long enquiries are kept (the numbers in square brackets there). Delete older rows in phpMyAdmin to match it.
- **Emails not arriving?** The `api/logs/api.log` file records every failed e-mail (see below). Keep an eye on the inbox: if enquiries stop arriving, check this file.
- **Privacy Notice.** It still shows square-bracket placeholders ([DATE PUBLISHED], [REGISTERED COMPANY NAME], [REGISTERED ADDRESS] and the number of months and days). Fill these in with your lawyer's wording before you publish widely.
  - One sentence to review: it says the site collects "basic, anonymous usage statistics, collected without cookies". The old Vercel analytics were removed when the site moved to this hosting, so right now no such statistics are collected. Either keep the sentence if your hosting's own statistics (often **Statistics** or **Awstats** in the panel) count, or have the sentence changed.

---

## Part 9. Updating the site later

1. You receive a new zip (production and, if you want to try it first, test).
2. Upload it to the folder and **Extract**, allowing overwrite. Your `api/config.php` is **not** inside the zip, so it stays exactly as it is. **Never delete `api/config.php`.**
3. Refresh with Ctrl+R (Cmd+R on Mac) to see the change.

When InstaTickets goes live (the passenger wording changes from "launching November 2026"), ask for a new build with the status set to live. If the website's domain ever changes, that is a one-line change for your developer, followed by a new zip.

---

## If something does not work

First look at the log: File Manager, `api/logs/api.log` (download it or open it). Each line says what failed. The most common messages and what they mean:

| What you see | What it means and what to do |
|---|---|
| The form says "Sorry, something went wrong and your request was not sent" | Look at `api/logs/api.log`. If there is no log or no new line, see the next rows. |
| Log: `api/config.php is missing` | The settings file is missing or named wrongly. It must be `api/config.php` (not `config.example.php`, not `config.php.txt`). |
| Log: `database insert failed` or `SQLSTATE[HY000] [1045]` | A database setting in `config.php` is wrong (name, user or password), or the tables were not created (Part 2). Re-check the database details; remember the panel may add a prefix to the name and the user name. |
| Log: `SQLSTATE[42S02] ... doesn't exist` | The tables were not created. Run `schema.mysql.sql` again (Part 2 step 5). |
| Log: `IP_SALT is not set` | Replace `CHANGE_ME_long_random_text` with your own long made-up text. |
| Log: `email failed: SMTP Error: Could not authenticate` | The mailbox name or password in `config.php` is wrong (`SMTP_USER`, `SMTP_PASS`). |
| Log: `email failed: SMTP Error: Could not connect to SMTP host` | Wrong `SMTP_HOST` or `SMTP_PORT`, or wrong `SMTP_SECURE` (use `tls` with 587, `ssl` with 465). Some hosts block outgoing mail on some ports: ask support which port to use. |
| Log: `email failed: ... From address not allowed` or similar | `MAIL_FROM` must be the same mailbox as `SMTP_USER` (or one the host allows). |
| E-mails arrive in Spam | Ask your host to make sure **SPF** and **DKIM** are switched on for the domain's mail. (This is a DNS setting at the host; do not change DNS yourself without them.) |
| E-mails to info@trackstar.co.zw never arrive but the log shows no error | The domain's mail is not set up yet (the MX records), or the `MAIL_TO` address is wrong. While testing, set `MAIL_TO` to an address you can already read. |
| The form shows "We could not reach the server" | The `api` folder or the `.php` files were not uploaded, or the file names differ in capitals. |
| Forms say "We could not confirm you are human" | Turnstile is on but misconfigured. Leave `TURNSTILE_SECRET` empty in `config.php` to switch it off. |
| `/api/config.php` shows a blank page instead of "Forbidden" | The hidden `.htaccess` files were not uploaded or your host ignores them. Re-upload with hidden files visible. If it still happens, **delete `config.php` immediately** and contact the host (it must support `.htaccess` files). |
| Pages look unstyled or logos are missing | The `_next` and `brand` folders did not upload fully. Extract the zip again. |
| The site cannot be opened on the test address | If the address has no HTTPS certificate, the site's forced `https://` blocks it. Wait for the certificate, or ask for a test zip built for plain `http://` (Part 1). |

If you are stuck, send the last few lines of `api/logs/api.log` (they contain no passwords) to your developer or support.
