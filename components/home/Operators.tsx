import { ArrowDown, ArrowRight, BusFront, Check } from "lucide-react";
import { H2, Section } from "@/components/ui";
import { operators } from "@/content/site";

/** "Built for every bus operator": who it is for (navy), what every operator gets (white), a green arrow between. */
export function Operators({ benefits }: { benefits: string[] }) {
  return (
    <Section id="who-for" tone="light" labelledBy="audience-title">
      <H2 id="audience-title" className="text-navy">
        {operators.headline}
      </H2>
      <div className="mt-10 grid items-stretch gap-6 lg:grid-cols-[minmax(0,0.8fr)_auto_minmax(0,1.2fr)] lg:gap-0">
        <section aria-labelledby="who-for-title" className="rounded-3xl bg-navy p-6 text-white sm:p-8">
          <h3 id="who-for-title" className="font-heading text-xs font-extrabold tracking-[0.14em] text-white/80">
            {operators.forLabel}
          </h3>
          <ul className="mt-3">
            {operators.forRows.map((row) => (
              <li key={row} className="flex items-center gap-4 border-t border-white/15 py-4">
                <BusFront aria-hidden="true" className="size-6 shrink-0 text-white" />
                <span className="font-heading text-lg font-bold">{row}</span>
              </li>
            ))}
          </ul>
        </section>

        <div aria-hidden="true" className="flex flex-col items-center justify-center gap-2 text-green lg:w-28 lg:px-3">
          <ArrowRight className="hidden size-11 stroke-[1.5] lg:block" />
          <ArrowDown className="size-9 stroke-[1.5] lg:hidden" />
          <span className="text-center font-heading text-[11px] font-extrabold leading-tight tracking-wide text-green-text">
            {operators.arrowLabel[0]}
            <br />
            {operators.arrowLabel[1]}
          </span>
        </div>

        <section aria-labelledby="gets-title" className="rounded-3xl border border-border bg-white p-6 sm:p-8">
          <h3 id="gets-title" className="font-heading text-xs font-extrabold tracking-[0.14em] text-green-text">
            {operators.getsLabel}
          </h3>
          <ul className="mt-3">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-4 border-t border-border py-4">
                <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-green-text/10 text-green-text">
                  <Check className="size-4 stroke-[2.5]" />
                </span>
                <span className="text-base text-ink sm:text-[17px]">{benefit}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Section>
  );
}
