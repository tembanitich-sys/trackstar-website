import {
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  ChevronDown,
  CreditCard,
  Globe,
  LayoutDashboard,
  MessageCircle,
  Package,
  Route,
  ScanLine,
  ShieldCheck,
  Smartphone,
  Ticket,
  Users,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { facts as defaultFacts } from "@/content/facts";
import type { Facts } from "@/content/facts";
import { noSolutionChips, platformCards, yourBrandPoints } from "@/content/compose";
import type { InstaTicketsStatus } from "@/content/compose";
import * as c from "@/content/site";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { Logo } from "@/components/Logo";
import { Button, H2, Section } from "@/components/ui";

type Icon = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;

const chipIcons: Record<string, Icon> = {
  [c.noSolution.chips.website]: Globe,
  [c.noSolution.chips.mobileBooking]: Smartphone,
  [c.noSolution.chips.customerApp]: Smartphone,
  [c.noSolution.chips.agentApp]: Users,
  [c.noSolution.chips.whatsapp]: MessageCircle,
  [c.noSolution.chips.payments]: CreditCard,
  [c.noSolution.chips.tickets]: Ticket,
  [c.noSolution.chips.backOffice]: LayoutDashboard,
};

const cardIcons: Record<string, Icon> = {
  sell: Globe,
  "get-paid": CreditCard,
  run: Route,
  control: Users,
  know: BarChart3,
  board: ScanLine,
  parcels: Package,
};

export type HomeViewProps = {
  facts?: Facts;
  status: InstaTicketsStatus;
};

export function HomeView({ facts = defaultFacts, status }: HomeViewProps) {
  return (
    <>
      <Hero />
      <NoSolution facts={facts} />
      <YourBrand facts={facts} />
      <Platform facts={facts} />
      <Journey />
      <Audience />
      <InstaTickets />
      <Passengers status={status} />
      <Faq status={status} />
      <GetTrackStar />
    </>
  );
}

function Hero() {
  return (
    <section aria-labelledby="hero-title" className="bg-neutral-bg py-16 sm:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div>
          <h1 id="hero-title" className="text-4xl leading-[1.05] text-navy sm:text-5xl lg:text-6xl">
            {c.hero.h1}
          </h1>
          <p className="mt-6 text-xl font-semibold text-ink sm:text-2xl">{c.hero.sub}</p>
          <p className="mt-3 text-lg text-muted">{c.hero.support}</p>
          <p className="mt-6 flex items-center gap-2 text-base font-semibold text-navy">
            <span aria-hidden="true" className="size-2.5 rounded-full bg-green" />
            {c.hero.status}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/?help=need#get-trackstar">{c.cta.primary}</Button>
            <Button href="/?help=demo#get-trackstar" variant="secondary">
              {c.cta.secondary}
            </Button>
          </div>
        </div>
        <HeroVisual />
      </div>
    </section>
  );
}

/** Abstract UI shapes from brand tokens. No real-looking data. */
function HeroVisual() {
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-md">
      <div className="rounded-2xl border border-border bg-white p-5 shadow-card">
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-border" />
          <span className="size-3 rounded-full bg-border" />
          <span className="size-3 rounded-full bg-border" />
          <span className="ml-auto h-3 w-24 rounded-full bg-neutral-bg" />
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          <span className="h-16 rounded-xl bg-navy" />
          <span className="h-16 rounded-xl bg-green" />
          <span className="h-16 rounded-xl bg-neutral-bg" />
        </div>
        <div className="mt-5 grid gap-3">
          <span className="h-3 w-full rounded-full bg-neutral-bg" />
          <span className="h-3 w-4/5 rounded-full bg-neutral-bg" />
          <span className="h-3 w-3/5 rounded-full bg-neutral-bg" />
        </div>
        <div className="mt-5 flex gap-3">
          <span className="h-10 w-28 rounded-lg bg-green-text" />
          <span className="h-10 w-20 rounded-lg border-2 border-navy" />
        </div>
      </div>
      <div className="absolute -bottom-6 -left-4 w-40 rounded-xl border border-border bg-white p-3 shadow-card sm:-left-8">
        <span className="block h-3 w-16 rounded-full bg-navy" />
        <span className="mt-2 block h-3 w-24 rounded-full bg-neutral-bg" />
        <span className="mt-2 block h-3 w-12 rounded-full bg-green" />
      </div>
    </div>
  );
}

function NoSolution({ facts }: { facts: Facts }) {
  return (
    <Section id="no-ticketing" labelledBy="no-solution-title">
      <div className="mx-auto max-w-3xl text-center">
        <H2 id="no-solution-title" className="text-navy">
          {c.noSolution.headline}
        </H2>
        <p className="mt-3 font-heading text-xl font-bold text-green-text sm:text-2xl">{c.noSolution.second}</p>
        <p className="mt-6 text-lg text-ink">{c.noSolution.copy}</p>
      </div>
      <ul className="mt-10 flex flex-wrap justify-center gap-3">
        {noSolutionChips(facts).map((chip) => {
          const IconCmp = chipIcons[chip] ?? BadgeCheck;
          return (
            <li
              key={chip}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-navy shadow-card"
            >
              <IconCmp aria-hidden="true" className="size-4 text-green-text" />
              {chip}
            </li>
          );
        })}
      </ul>
      <div className="mt-10 flex justify-center">
        <Button href="/?help=need#get-trackstar">{c.cta.primary}</Button>
      </div>
    </Section>
  );
}

function YourBrand({ facts }: { facts: Facts }) {
  return (
    <Section id="your-brand" tone="navy" labelledBy="your-brand-title">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <H2 id="your-brand-title">{c.yourBrand.headline}</H2>
          <p className="mt-5 text-lg text-white">{c.yourBrand.copy}</p>
        </div>
        <ul className="grid gap-4">
          {yourBrandPoints(facts).map((point) => (
            <li key={point} className="flex items-start gap-3 rounded-xl border border-white/20 bg-white/5 p-4">
              <BadgeCheck aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-green" />
              <span className="text-base font-semibold text-white">{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

function Platform({ facts }: { facts: Facts }) {
  return (
    <Section id="platform" tone="light" labelledBy="platform-title">
      <H2 id="platform-title" className="max-w-3xl text-navy">
        {c.platform.headline}
      </H2>
      <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {platformCards(facts).map((card) => {
          const IconCmp = cardIcons[card.key] ?? ShieldCheck;
          return (
            <li key={card.key} className="rounded-2xl border border-border bg-white p-6 shadow-card">
              <IconCmp aria-hidden="true" className="size-7 text-green-text" />
              <h3 className="mt-4 text-lg text-navy">{card.title}</h3>
              <p className="mt-2 text-base text-ink">{card.line}</p>
            </li>
          );
        })}
      </ul>
      <div className="mt-10 flex items-center gap-4">
        <Logo variant="symbol" height={64} decorative />
        <p className="font-heading text-xl font-extrabold text-navy sm:text-2xl">{c.platform.closing}</p>
      </div>
    </Section>
  );
}

function Journey() {
  return (
    <Section id="journey" labelledBy="journey-title">
      <H2 id="journey-title" className="text-navy">
        {c.journey.headline}
      </H2>
      <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {c.journey.steps.map((step, i) => (
          <li key={step.title} className="flex gap-4 rounded-2xl border border-border bg-white p-6 shadow-card">
            <span
              aria-hidden="true"
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-navy font-heading text-base font-bold text-white"
            >
              {i + 1}
            </span>
            <div>
              <h3 className="text-lg text-navy">{step.title}</h3>
              <p className="mt-1 text-base text-ink">{step.line}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

function Audience() {
  return (
    <Section id="who-for" tone="light" labelledBy="audience-title">
      <H2 id="audience-title" className="text-navy">
        {c.audience.headline}
      </H2>
      <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {c.audience.cards.map((card) => (
          <li key={card.title} className="rounded-2xl border border-border bg-white p-6 shadow-card">
            <h3 className="text-lg text-navy">{card.title}</h3>
            <p className="mt-2 text-base text-ink">{card.line}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function FlowBox({ children, tone = "navy" }: { children: string; tone?: "navy" | "green" | "light" }) {
  const tones = {
    navy: "bg-navy text-white",
    green: "bg-green-text text-white",
    light: "border border-border bg-white text-navy",
  };
  return (
    <div
      className={`flex min-h-14 items-center justify-center rounded-xl px-3 py-2 text-center font-heading text-xs font-bold tracking-wide sm:text-sm ${tones[tone]}`}
    >
      {children}
    </div>
  );
}

function InstaTickets() {
  const f = c.instaTickets.flow;
  return (
    <Section id="instatickets" labelledBy="instatickets-title">
      <H2 id="instatickets-title" className="max-w-4xl text-navy">
        {c.instaTickets.headline}
      </H2>
      <p className="mt-6 max-w-3xl text-lg text-ink">{c.instaTickets.copy}</p>

      <div role="group" aria-label={`How ${c.productName} and InstaTickets fit together`} className="mt-10 rounded-2xl bg-neutral-bg p-5 sm:p-8">
        <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
          <FlowBox tone="light">{f.business}</FlowBox>
          <ArrowRight aria-hidden="true" className="mx-auto hidden size-5 text-navy sm:block" />
          <ArrowDown aria-hidden="true" className="mx-auto size-5 text-navy sm:hidden" />
          <FlowBox>{f.product}</FlowBox>
          <ArrowRight aria-hidden="true" className="mx-auto hidden size-5 text-navy sm:block" />
          <ArrowDown aria-hidden="true" className="mx-auto size-5 text-navy sm:hidden" />
          <FlowBox tone="green">{f.channels}</FlowBox>
        </div>
        <div className="mx-auto mt-4 max-w-2xl">
          <ArrowDown aria-hidden="true" className="mx-auto mb-3 size-5 text-navy" />
          <div className="rounded-xl border-2 border-dashed border-navy/40 p-3">
            <p className="mb-3 text-center text-sm font-bold uppercase tracking-wide text-muted">{f.optional}</p>
            <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
              <FlowBox>{f.instatickets}</FlowBox>
              <ArrowRight aria-hidden="true" className="mx-auto hidden size-5 text-navy sm:block" />
              <ArrowDown aria-hidden="true" className="mx-auto size-5 text-navy sm:hidden" />
              <FlowBox tone="light">{f.passengers}</FlowBox>
            </div>
          </div>
        </div>
      </div>

      <ul className="mt-10 grid gap-4 lg:grid-cols-3">
        {c.instaTickets.points.map((point) => (
          <li key={point} className="flex items-start gap-3 rounded-xl border border-border bg-white p-5 shadow-card">
            <BadgeCheck aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-green-text" />
            <span className="text-base text-ink">{point}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button href="/?help=need#get-trackstar">{c.cta.primary}</Button>
        <Button href={c.INSTATICKETS_URL} variant="secondary">
          {c.instaTickets.explore}
        </Button>
      </div>

      <div className="mt-10 rounded-2xl border border-border bg-neutral-bg p-6 sm:p-8">
        <h3 className="text-xl text-navy">{c.instaTickets.existing.title}</h3>
        <p className="mt-2 max-w-2xl text-base text-ink">{c.instaTickets.existing.copy}</p>
        <a
          href={c.INSTATICKETS_BUSINESS_URL}
          className="mt-4 inline-flex min-h-11 items-center gap-2 font-heading text-sm font-bold tracking-wide text-green-text underline underline-offset-4 hover:text-navy"
        >
          {c.instaTickets.existing.link}
          <ArrowRight aria-hidden="true" className="size-4" />
        </a>
      </div>
    </Section>
  );
}

function Passengers({ status }: { status: InstaTicketsStatus }) {
  const p = c.passengers[status];
  return (
    <Section id="passengers" tone="light" labelledBy="passengers-title">
      <div className="mx-auto max-w-3xl text-center">
        <H2 id="passengers-title" className="text-navy">
          {c.passengers.headline}
        </H2>
        <p className="mt-5 text-lg text-ink">{p.copy}</p>
        <div className="mt-8 flex justify-center">
          <Button href={c.INSTATICKETS_URL} variant="secondary">
            {p.button}
          </Button>
        </div>
      </div>
    </Section>
  );
}

function Faq({ status }: { status: InstaTicketsStatus }) {
  const items = [...c.faq.items, { q: c.faq.ticketQuestion, a: c.passengers[status].copy }];
  return (
    <Section id="faq" labelledBy="faq-title">
      <H2 id="faq-title" className="text-navy">
        {c.faq.headline}
      </H2>
      <div className="mt-10 grid max-w-3xl gap-3">
        {items.map((item) => (
          <details key={item.q} className="group rounded-xl border border-border bg-white shadow-card">
            <summary className="flex min-h-14 cursor-pointer items-center justify-between gap-4 px-5 py-3 font-heading text-base font-bold text-navy">
              {item.q}
              <ChevronDown aria-hidden="true" className="faq-chevron size-5 shrink-0 transition-transform duration-150" />
            </summary>
            <p className="px-5 pb-5 text-base text-ink">{item.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}

function GetTrackStar() {
  return (
    <Section id="get-trackstar" tone="light" labelledBy="get-title">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <H2 id="get-title" className="text-navy">
            {c.getTrackStar.headline}
          </H2>
          <p className="mt-5 text-lg text-ink">{c.getTrackStar.copy}</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5 shadow-card sm:p-8">
          <EnquiryForm />
        </div>
      </div>
    </Section>
  );
}
