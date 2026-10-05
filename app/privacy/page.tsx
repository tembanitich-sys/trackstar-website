import type { Metadata } from "next";
import { Fragment } from "react";
import { privacy } from "@/content/site";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = { title: "Privacy Notice", alternates: canonical("/privacy/") };

/** Bracketed values are highlighted so they cannot be missed until confirmed. */
function Brackets({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\[[^\]]+\])/).map((part, i) =>
        /^\[[^\]]+\]$/.test(part) ? (
          <mark key={i} className="rounded bg-yellow-200 px-1 font-semibold text-ink">
            {part}
          </mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="text-4xl text-navy sm:text-5xl">{privacy.title}</h1>
      <p className="mt-4 text-base font-semibold text-ink">
        <Brackets text={privacy.effective} />
      </p>
      <p className="mt-6 text-base text-ink">{privacy.intro}</p>
      {privacy.sections.map((s) => (
        <section key={s.heading} className="mt-10">
          <h2 className="text-2xl text-navy">{s.heading}</h2>
          {s.paragraphs?.map((p) => (
            <p key={p} className="mt-3 text-base text-ink">
              <Brackets text={p} />
            </p>
          ))}
          {s.bullets ? (
            <ul className="mt-3 list-disc space-y-2 pl-6 text-base text-ink">
              {s.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </div>
  );
}
