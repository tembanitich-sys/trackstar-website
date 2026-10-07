import { spawnSync } from "node:child_process";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildCorpus, referenceE164 } from "./phone-corpus";

const php = spawnSync("php", ["-v"]);
const hasPhp = php.status === 0;

describe.skipIf(!hasPhp)("PHP phone check matches libphonenumber-js", () => {
  it("gives the same E.164 result on ~10,000 inputs across every country", () => {
    const corpus = buildCorpus();
    const run = spawnSync("php", [path.join(__dirname, "php", "phone_batch.php")], {
      input: JSON.stringify(corpus),
      maxBuffer: 1 << 28,
    });
    expect(run.status, String(run.stderr)).toBe(0);
    const got = JSON.parse(String(run.stdout)) as (string | null)[];

    const diffs: string[] = [];
    corpus.forEach(([input, country], i) => {
      const want = referenceE164(input, country);
      if (want !== got[i]) diffs.push(`${JSON.stringify(input)} [${country}] libphonenumber-js=${want} php=${got[i]}`);
    });
    expect(diffs.slice(0, 20), `${diffs.length} of ${corpus.length} differ`).toEqual([]);
  }, 120000);

  it("covers the numbers this site mostly sees", () => {
    const run = spawnSync("php", [path.join(__dirname, "php", "phone_batch.php")], {
      input: JSON.stringify([["077 123 4567", "ZW"], ["+263 77 123 4567", "ZW"], ["082 123 4567", "ZA"], ["12", "ZW"], ["", "ZW"]]),
    });
    expect(JSON.parse(String(run.stdout))).toEqual(["+263771234567", "+263771234567", "+27821234567", null, null]);
  });
});
