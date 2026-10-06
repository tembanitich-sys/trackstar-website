// Builds the static site for a target and zips it for upload.
//   node scripts/package.mjs test [host] [--allow-http]  -> dist/<name>-test-subdomain.zip (hidden from search)
//        --allow-http: for a temporary test address with no HTTPS certificate yet (never for the live site)
//   node scripts/package.mjs production    -> dist/<name>-production.zip       (the live domain)
// The domain comes from site.config.json (one setting). The test host defaults to
// <testSubdomain>.<domain>; pass another host name to try the site somewhere else.
// The zip holds the contents of out/ (upload its files, not the folder). It never contains api/config.php.
import { execFileSync } from "node:child_process";
import { appendFileSync, chmodSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
execFileSync("node", [path.join(root, "scripts", "sync-site-config.mjs")], { stdio: "inherit" });
const config = JSON.parse(readFileSync(path.join(root, "site.config.json"), "utf8"));
const domain = config.domain;
// File names of the zips follow the product name (letters and digits only).
const slug = config.productName.toLowerCase().replace(/[^a-z0-9]+/g, "") || "site";

const args = process.argv.slice(2);
const allowHttp = args.includes("--allow-http");
const [mode, hostArg] = args.filter((a) => !a.startsWith("--"));
const testHost = hostArg ?? `${config.testSubdomain}.${domain}`;
const targets = {
  test: { host: testHost, indexable: "", zip: `${slug}-test-subdomain.zip` },
  production: { host: `www.${domain}`, indexable: "true", zip: `${slug}-production.zip` },
};
const target = targets[mode];
if (allowHttp && mode !== "test") {
  console.error("--allow-http is only for test builds");
  process.exit(1);
}
if (!target) {
  console.error("usage: node scripts/package.mjs test [host] [--allow-http] | production");
  process.exit(1);
}
const origin = `${allowHttp ? "http" : "https"}://${target.host}`;
const out = path.join(root, "out");
const dist = path.join(root, "dist");
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

console.log(`\nBuilding the ${mode} site for ${origin}\n`);
rmSync(out, { recursive: true, force: true });
execFileSync("npx", ["next", "build"], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, NEXT_PUBLIC_SITE_URL: origin, NEXT_PUBLIC_INDEXABLE: target.indexable },
});

// Local secrets and logs must never travel with the site.
rmSync(path.join(out, "api", "config.php"), { force: true });
const logs = path.join(out, "api", "logs");
if (existsSync(logs)) for (const f of readdirSync(logs)) if (![".htaccess", ".gitkeep"].includes(f)) rmSync(path.join(logs, f), { force: true });

// Put the domain into the Apache rules.
const htaccess = path.join(out, ".htaccess");
writeFileSync(htaccess, readFileSync(htaccess, "utf8").replaceAll("__SITE_DOMAIN_REGEX__", escapeRegex(domain)).replaceAll("__SITE_DOMAIN__", domain));

// Test builds can run on a plain-http address: no forced HTTPS, no HSTS, no upgrade-insecure-requests.
if (allowHttp) {
  let rules = readFileSync(htaccess, "utf8");
  rules = rules.replace(/ *# HTTPS-BEGIN[\s\S]*?# HTTPS-END\n/, "").replace(/ *# HSTS-BEGIN[\s\S]*?# HSTS-END\n/, "").replace("; upgrade-insecure-requests", "");
  writeFileSync(htaccess, rules);
}

// The test copy must stay out of search engines even if someone links to it.
if (mode === "test") {
  appendFileSync(htaccess, '\n# Test copy: keep out of search engines\n<IfModule mod_headers.c>\n    Header set X-Robots-Tag "noindex, nofollow"\n</IfModule>\n');
}

// Normalise permissions: a file kept owner-only would be unreadable by the web server after upload.
const walkAll = (dir) => readdirSync(dir).flatMap((n) => {
  const full = path.join(dir, n);
  return statSync(full).isDirectory() ? [full, ...walkAll(full)] : [full];
});
chmodSync(out, 0o755);
for (const entry of walkAll(out)) chmodSync(entry, statSync(entry).isDirectory() ? 0o755 : 0o644);

// Sanity checks on what will be uploaded.
const problems = [];
const required = [
  "index.html", "404.html", ".htaccess", "robots.txt", "contact/index.html", "privacy/index.html", "terms/index.html", "cookies/index.html",
  "api/.htaccess", "api/enquiry.php", "api/contact.php", "api/config.example.php", "api/lib/handler.php", "api/lib/phone_data.php",
  "api/vendor/phpmailer/PHPMailer.php", "api/vendor/phpmailer/SMTP.php", "api/vendor/phpmailer/Exception.php", "api/logs/.htaccess", "brand/bullion-compact.png",
  "favicon.svg", "favicon.ico", "apple-touch-icon.png", "android-chrome-192.png", "android-chrome-512.png", "og-image.png", "site.webmanifest",
  "brand/busrep-horizontal.svg", "brand/busrep-stacked-reverse.svg", "brand/busrep-symbol.svg",
];
for (const f of required) if (!existsSync(path.join(out, f))) problems.push(`missing ${f}`);
if (existsSync(path.join(out, "api", "config.php"))) problems.push("api/config.php is in the build");

const portal = config.portalUrl.replace(/\/$/, "");
const portalDomain = new URL(portal).hostname.replace(/^www\./, "");
const textFile = /\.(html|txt|xml|webmanifest|php|css|js)$|^\.htaccess$/;
let portalLinks = 0;
for (const file of walkAll(out).filter((f) => statSync(f).isFile() && textFile.test(path.basename(f)))) {
  const rel = path.relative(out, file);
  const text = readFileSync(file, "utf8");
  if (/__SITE_DOMAIN/.test(text)) problems.push(`${rel} still has a domain placeholder`);
  if (/localhost:3000/.test(text)) problems.push(`${rel} mentions localhost`);
  // The portal is only ever a link ("Operator login"), never the site's own address.
  const withoutPortal = text.replaceAll(portal, "");
  if (withoutPortal.includes(portalDomain)) problems.push(`${rel} mentions ${portalDomain} other than as the portal link`);
  if (rel === "index.html") portalLinks += text.split(`href="${portal}"`).length - 1;
  // Legal wording keeps its own name until reviewed; nowhere else may show it (the privacy page is legal text in full).
  if (rel.endsWith(".html") && rel !== "privacy/index.html" && config.legalProductName !== config.productName) {
    const html = text.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<!-- -->/g, "").replaceAll(portal, "");
    const consent = [`I have read the ${config.legalProductName}`, `receive ${config.legalProductName} updates`];
    let rest = html;
    for (const c of consent) rest = rest.replaceAll(c, "");
    if (rest.includes(config.legalProductName)) problems.push(`${rel} shows "${config.legalProductName}" outside the legal wording`);
  }
}
if (portalLinks < 2) problems.push(`index.html should link to ${portal} in the header and the footer (found ${portalLinks})`);
const finalRules = readFileSync(path.join(out, ".htaccess"), "utf8");
if (/__SITE_DOMAIN/.test(finalRules)) problems.push(".htaccess has a domain placeholder");
if (mode === "production" && !/Strict-Transport-Security/.test(finalRules)) problems.push("production .htaccess lost HSTS");
if (mode === "production" && !/upgrade-insecure-requests/.test(finalRules)) problems.push("production .htaccess lost upgrade-insecure-requests");
if (mode === "production" && !/RewriteCond %\{HTTPS\} !=on/.test(finalRules)) problems.push("production .htaccess does not force HTTPS");

// The head tags brand/BRAND.md asks for, and an absolute og:image on the live domain (in every build).
{
  const head = readFileSync(path.join(out, "index.html"), "utf8");
  const tag = (re) => re.test(head);
  if (!tag(/<link rel="icon" href="\/favicon\.svg" type="image\/svg\+xml"\/?>/)) problems.push('index.html has no <link rel="icon" href="/favicon.svg" type="image/svg+xml">');
  if (!tag(/<link rel="icon" href="\/favicon\.ico" sizes="any"\/?>/)) problems.push('index.html has no <link rel="icon" href="/favicon.ico" sizes="any">');
  if (!tag(/<link rel="apple-touch-icon" href="\/apple-touch-icon\.png"\/?>/)) problems.push('index.html has no <link rel="apple-touch-icon" href="/apple-touch-icon.png">');
  if (!tag(/<link rel="manifest" href="\/site\.webmanifest"[^>]*\/?>/)) problems.push('index.html has no <link rel="manifest" href="/site.webmanifest">');
  const og = head.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
  if (og !== `https://www.${domain}/og-image.png`) problems.push(`og:image is ${og}, expected https://www.${domain}/og-image.png`);
  const twitter = head.match(/<meta name="twitter:image" content="([^"]+)"/)?.[1];
  if (twitter !== `https://www.${domain}/og-image.png`) problems.push(`twitter:image is ${twitter}, expected https://www.${domain}/og-image.png`);
  if (!tag(new RegExp(`<meta property="og:site_name" content="${config.productName}"`))) problems.push("og:site_name is not the product name");
  if (!tag(new RegExp(`<title>${config.productName} \\|`))) problems.push("the page title does not start with the product name");
  const manifest = JSON.parse(readFileSync(path.join(out, "site.webmanifest"), "utf8"));
  if (manifest.name !== config.productName) problems.push("site.webmanifest has the wrong name");
  const ld = head.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)?.[1];
  if (!ld || JSON.parse(ld).name !== config.productName) problems.push('structured data "name" is not the product name');
}

const canonicalOf = (rel) => readFileSync(path.join(out, rel), "utf8").match(/<link rel="canonical" href="([^"]+)"/)?.[1];
const robots = readFileSync(path.join(out, "robots.txt"), "utf8");
if (mode === "production") {
  for (const [rel, urlPath] of [["index.html", "/"], ["contact/index.html", "/contact/"], ["privacy/index.html", "/privacy/"]]) {
    if (canonicalOf(rel) !== `${origin}${urlPath}`) problems.push(`${rel}: canonical is ${canonicalOf(rel)}, expected ${origin}${urlPath}`);
  }
  if (/Disallow: \/\s*$/m.test(robots)) problems.push("production robots.txt blocks everything");
  if (!robots.includes(`${origin}/sitemap.xml`)) problems.push("production robots.txt does not list the sitemap");
  if (!readFileSync(path.join(out, "sitemap.xml"), "utf8").includes(`<loc>${origin}/</loc>`)) problems.push("sitemap.xml does not list the home page");
} else {
  if (canonicalOf("index.html")) problems.push("test build has a canonical URL");
  if (!/Disallow: \/\s*$/m.test(robots)) problems.push("test robots.txt does not block everything");
  if (!/<meta name="robots" content="noindex/.test(readFileSync(path.join(out, "index.html"), "utf8"))) problems.push("test index.html is not marked noindex");
}

if (problems.length) {
  console.error("\nPackaging stopped:\n - " + problems.join("\n - "));
  process.exit(1);
}

mkdirSync(dist, { recursive: true });
const zipPath = path.join(dist, target.zip);
rmSync(zipPath, { force: true });
execFileSync("zip", ["-r", "-X", "-q", zipPath, ".", "-x", "api/config.php", "-x", ".DS_Store"], { cwd: out, stdio: "inherit" });
console.log(`\n${mode}: ${path.relative(root, zipPath)} (${(statSync(zipPath).size / 1024).toFixed(0)} KB) for ${origin}`);
