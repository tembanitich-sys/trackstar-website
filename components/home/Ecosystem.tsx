import Image from "next/image";
import { CreditCard, Globe, LayoutDashboard, Landmark, Smartphone, Wallet } from "lucide-react";
import type { ReactNode } from "react";
import { clearSpace, Logo } from "@/components/Logo";
import type { EcosystemIcon, EcosystemItem, MoneyRow } from "@/content/compose";
import type { PartnerMark } from "@/content/partners";
import { whatsappGlyph } from "@/content/partners";
import { ecosystem } from "@/content/site";

/**
 * The ecosystem diagram under "Don't worry". Plain HTML and CSS: the dotted green connectors are small inline
 * SVGs that sit in their own grid cells (nothing is measured with script), the groups are lists, and the
 * connectors are hidden from screen readers. Wide screens: passengers | BusRep | team on top, money below.
 * Phones: the BusRep card, then the three groups, joined by one dotted line down the left.
 */

const CENTRE_LOGO_HEIGHT = 48;

/** A phone with a small person: the agent app. Generic icon in the same line style as the others. */
function AgentAppIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="2.5" width="10.5" height="19" rx="2.2" />
      <circle cx="18" cy="9.5" r="2.3" />
      <path d="M14.8 17.5c0-2.2 1.4-3.6 3.2-3.6s3.2 1.4 3.2 3.6" />
    </svg>
  );
}

const itemIcons: Record<EcosystemIcon, () => ReactNode> = {
  globe: () => <Globe aria-hidden="true" className="size-5" />,
  phone: () => <Smartphone aria-hidden="true" className="size-5" />,
  whatsapp: () => (
    // WhatsApp's own glyph, unmodified, in the same neutral tile (decorative: the text next to it names it)
    <Image src={whatsappGlyph.file} width={whatsappGlyph.size} height={whatsappGlyph.size} alt="" aria-hidden="true" unoptimized className="size-6" />
  ),
  agent: () => <AgentAppIcon />,
  dashboard: () => <LayoutDashboard aria-hidden="true" className="size-5" />,
};

const moneyIcons = {
  wallet: () => <Wallet aria-hidden="true" className="size-5" />,
  card: () => <CreditCard aria-hidden="true" className="size-5" />,
  bank: () => <Landmark aria-hidden="true" className="size-5" />,
};

function Tile({ children }: { children: ReactNode }) {
  return (
    <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-neutral-bg text-navy">
      {children}
    </span>
  );
}

function GroupCard({ label, className = "", children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <section aria-label={label} className={`relative rounded-3xl border border-border bg-white p-5 sm:p-6 ${className}`}>
      <h3 aria-hidden="true" className="flex items-center gap-2 font-heading text-xs font-extrabold tracking-[0.14em] text-green-text">
        <span className="size-2 rounded-full bg-green" />
        {label}
      </h3>
      {children}
    </section>
  );
}

function ItemList({ items }: { items: EcosystemItem[] }) {
  return (
    <ul className="mt-4 grid gap-4">
      {items.map((item) => (
        <li key={item.key} className="flex items-center gap-3">
          <Tile>{itemIcons[item.icon]()}</Tile>
          <div>
            <p className="font-heading text-base font-bold leading-snug text-navy">
              {item.title}
              {item.badge ? (
                <span className="ml-2 whitespace-nowrap rounded-full bg-green-text/[0.06] px-2.5 py-0.5 align-middle text-xs font-bold text-green-text">{item.badge}</span>
              ) : null}
            </p>
            <p className="text-sm leading-snug text-muted">{item.line}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function Chip({ mark }: { mark: PartnerMark }) {
  const h = mark.displayHeight ?? 20;
  const chip = mark.chip === "navy" ? "border-navy bg-navy" : "border-border bg-white";
  return (
    <span data-partner={mark.name} className={`inline-flex h-9 items-center rounded-lg border px-3 ${chip}`}>
      <Image
        src={mark.file}
        width={Math.round(mark.width)}
        height={Math.round(mark.height)}
        alt={mark.name}
        unoptimized
        style={{ height: h, width: "auto", display: "block" }}
      />
    </span>
  );
}

function MoneyList({ rows }: { rows: MoneyRow[] }) {
  return (
    <ul className="mt-4 grid gap-5 sm:grid-cols-3">
      {rows.map((row) => (
        <li key={row.key} className="flex gap-3">
          <Tile>{moneyIcons[row.icon]()}</Tile>
          <div className="min-w-0">
            <p className="font-heading text-base font-bold leading-snug text-navy">{row.title}</p>
            {row.marks.length ? (
              <ul className="mt-2 flex flex-wrap gap-2">
                {row.marks.map((mark) => (
                  <li key={mark.name}>
                    <Chip mark={mark} />
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Dotted green line with a dot at each end, as an inline SVG that fills its box. */
function Dotted({ axis, className = "", endDot = true }: { axis: "x" | "y"; className?: string; endDot?: boolean }) {
  const props = axis === "y" ? { x1: 4, y1: 4, x2: 4, y2: "calc(100% - 4px)" } : { x1: 4, y1: 4, x2: "calc(100% - 4px)", y2: 4 };
  return (
    <svg aria-hidden="true" focusable="false" className={`text-green ${className}`} width={axis === "y" ? 8 : "100%"} height={axis === "y" ? "100%" : 8}>
      <line {...props} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="0.1 6" />
      <circle cx="4" cy="4" r="4" fill="currentColor" />
      {endDot ? axis === "y" ? <circle cx="4" cy="calc(100% - 4px)" r="4" fill="currentColor" /> : <circle cx="calc(100% - 4px)" cy="4" r="4" fill="currentColor" /> : null}
    </svg>
  );
}

/** The curve between a side card and the BusRep card (wide screens). Cell height = the row's, so the ends are percentages. */
function Curve({ side }: { side: "left" | "right" }) {
  // y of the end that touches the side card, and of the end that touches the BusRep card (percent of the row's height)
  const [sideY, centreY] = side === "left" ? [63, 82] : [54, 82];
  const [x0, y0, x1, y1] = side === "left" ? [0, sideY, 100, centreY] : [0, centreY, 100, sideY];
  return (
    <div aria-hidden="true" className={`relative hidden self-stretch text-green lg:block ${side === "left" ? "lg:col-start-2" : "lg:col-start-4"} lg:row-start-1`}>
      <svg aria-hidden="true" focusable="false" className="absolute inset-0 size-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none">
        <path d={`M${x0},${y0} C50,${y0} 50,${y1} ${x1},${y1}`} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="0.1 6" vectorEffect="non-scaling-stroke" />
      </svg>
      <span className="absolute left-0 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green" style={{ top: `${y0}%` }} />
      <span className="absolute right-0 size-2.5 translate-x-1/2 -translate-y-1/2 rounded-full bg-green" style={{ top: `${y1}%` }} />
    </div>
  );
}

export function Ecosystem({ passengers, team, money }: { passengers: EcosystemItem[]; team: EcosystemItem[]; money: MoneyRow[] }) {
  const pad = clearSpace("horizontal", CENTRE_LOGO_HEIGHT); // BRAND.md clear space around the logo
  return (
    <div className="mt-12 lg:mt-16">
      <div className="relative grid gap-5 lg:grid-cols-[1fr_80px_minmax(300px,0.8fr)_80px_1fr] lg:gap-0 xl:-mx-12">
        <div
          className="flex flex-col items-center rounded-3xl border-2 border-navy bg-white text-center lg:col-start-3 lg:row-start-1 lg:translate-y-8 lg:self-end"
          style={{ padding: `${Math.round(pad * 0.8)}px ${pad}px ${Math.round(pad * 0.6)}px` }}
        >
          <Logo variant="horizontal" height={CENTRE_LOGO_HEIGHT} />
          <p className="mt-3 font-heading text-sm font-bold text-navy">{ecosystem.centreLine}</p>
        </div>

        {/* Phones: the groups sit to the right of one dotted line (drawn here); wide screens place them in the grid */}
        <div className="relative grid gap-5 pl-[26px] lg:contents">
          <span aria-hidden="true" className="absolute -top-5 bottom-10 left-[2px] w-2 lg:hidden">
            <Dotted axis="y" className="size-full" />
          </span>
          <GroupCard label={ecosystem.passengers.label} className="lg:col-start-1 lg:row-start-1 lg:self-start">
            <Stub />
            <ItemList items={passengers} />
          </GroupCard>
          <GroupCard label={ecosystem.team.label} className="lg:col-start-5 lg:row-start-1 lg:self-start">
            <Stub />
            <ItemList items={team} />
          </GroupCard>
          <GroupCard label={ecosystem.money.label} className="lg:col-span-5 lg:row-start-3 lg:mx-auto lg:w-full lg:max-w-3xl">
            <Stub />
            <MoneyList rows={money} />
            <p className="mt-5 border-t border-border pt-4 text-sm text-muted">{ecosystem.moreLine}</p>
          </GroupCard>
        </div>

        <Curve side="left" />
        <Curve side="right" />
        <div aria-hidden="true" className="hidden h-32 justify-center text-green lg:col-start-3 lg:row-start-2 lg:flex lg:pt-8">
          <Dotted axis="y" className="h-full" />
        </div>
      </div>
    </div>
  );
}

/** Phones only: the short dotted stub from the left line to a group card. */
function Stub() {
  return (
    <span aria-hidden="true" className="absolute -left-[24px] top-[26px] h-2 w-[24px] lg:hidden">
      <Dotted axis="x" className="w-full" endDot={false} />
    </span>
  );
}
