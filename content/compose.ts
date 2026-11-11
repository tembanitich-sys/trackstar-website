import type { Facts } from "./facts";
import * as c from "./site";
import { paymentGroups } from "./partners";
import type { PaymentGroup } from "./partners";

export type InstaTicketsStatus = "prelaunch" | "live";

function joinList(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

export function yourBrandPoints(f: Facts): string[] {
  const p = c.yourBrand.points;
  const out = [p.website, f.whatsappBooking ? p.bookingWithWhatsapp : p.bookingMobileOnly, p.tickets];
  if (f.operatorOwnsData) out.push(p.data);
  return out;
}

export type PlatformCard = { key: string; title: string; line: string };

export function platformCards(f: Facts): PlatformCard[] {
  const p = c.platform;
  const channels = [p.sell.website, f.nativeCustomerApp ? p.sell.customerApp : p.sell.mobileBooking];
  if (f.whatsappBooking) channels.push(p.sell.whatsapp);
  if (f.agentApp) channels.push(p.sell.agents);

  const cards: PlatformCard[] = [
    { key: "sell", title: p.sell.title, line: `${p.sell.lead} ${joinList(channels)}.` },
    {
      key: "get-paid",
      title: p.getPaid.title,
      line: f.directToOperatorAccount ? `${p.getPaid.line} ${p.getPaid.direct}` : p.getPaid.line,
    },
    {
      key: "run",
      title: p.run.title,
      line: f.manifests ? `${p.run.line} ${p.run.manifests}` : p.run.line,
    },
    { key: "control", title: p.control.title, line: p.control.line },
    { key: "know", title: p.know.title, line: p.know.line },
    {
      key: "board",
      title: p.board.title,
      line: f.ticketAuthenticator ? `${p.board.line} ${p.board.authenticator}` : p.board.line,
    },
  ];
  if (f.parcels) cards.push({ key: "parcels", title: p.parcels.title, line: p.parcels.line });
  return cards;
}

/* ---- Ecosystem diagram, journey and operator section: every line tied to a fact switch is composed here ---- */


export type EcosystemIcon = "globe" | "phone" | "whatsapp" | "agent" | "dashboard";
export type EcosystemItem = { key: string; title: string; line: string; icon: EcosystemIcon; badge?: string };
export type MoneyRow = { key: PaymentGroup["key"]; title: string; icon: PaymentGroup["icon"]; marks: PaymentGroup["marks"] };

export function ecosystemGroups(f: Facts): { passengers: EcosystemItem[]; team: EcosystemItem[]; money: MoneyRow[] } {
  const e = c.ecosystem;
  const passengers: EcosystemItem[] = [{ key: "website", icon: "globe", ...e.passengers.website }];
  if (f.nativeCustomerApp) passengers.push({ key: "customer-app", icon: "phone", ...e.passengers.customerApp });
  if (f.whatsappBooking) passengers.push({ key: "whatsapp", icon: "whatsapp", ...e.passengers.whatsapp });

  const team: EcosystemItem[] = [];
  if (f.agentApp) {
    const { badge, line, lineVerify, title } = e.team.agentApp;
    // "verify tickets at boarding" is the Ticket Authenticator: only with that switch
    team.push({ key: "agent-app", icon: "agent", title, line: f.ticketAuthenticator ? lineVerify : line, ...(f.worksOffline ? { badge } : {}) });
  }
  team.push({ key: "back-office", icon: "dashboard", title: e.team.backOffice.title, line: f.realtimeView ? e.team.backOffice.lineLive : e.team.backOffice.line });

  const money: MoneyRow[] = paymentGroups
    .filter((g) => g.key !== "bank" || f.bankPayments)
    .map((g) => ({ key: g.key, icon: g.icon, title: e.money.titles[g.key], marks: f.showPaymentMarks ? g.marks : [] }));
  return { passengers, team, money };
}

export function journeySteps(f: Facts): { title: string; line: string }[] {
  const j = c.journey;
  const board = f.ticketAuthenticator ? `${j.boarding.verified}${f.worksOffline ? j.boarding.offline : ""}.` : j.boarding.line;
  return [...j.steps, { title: j.boarding.title, line: board }];
}

export function operatorBenefits(f: Facts): string[] {
  const b = c.operators.benefits;
  const out = [b.channels, `${b.paid}${f.instantSettlement ? ` ${b.paidInstantly}` : ""} ${f.bankPayments ? b.paidWithBank : b.paidWith}`];
  if (f.realtimeView) out.push(b.realtime);
  if (f.lessCashHandling) out.push(b.lessCash);
  out.push(b.grow, b.nothingToBuild);
  return out;
}
