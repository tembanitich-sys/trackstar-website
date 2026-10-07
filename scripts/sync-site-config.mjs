// Copies site.config.json (the one place the product name, domain and contact e-mail are
// written) next to the PHP scripts, so the e-mails use the same product name as the site.
// Runs automatically before builds and packaging. A test fails if the copy is stale.
import { copyFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
copyFileSync(path.join(root, "site.config.json"), path.join(root, "public", "api", "site.config.json"));
