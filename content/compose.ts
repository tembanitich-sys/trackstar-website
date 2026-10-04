import type { Facts } from "./facts";
import * as c from "./site";

export type InstaTicketsStatus = "prelaunch" | "live";

function joinList(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

export function noSolutionChips(f: Facts): string[] {
  const chips = c.noSolution.chips;
  const out: string[] = [chips.website, f.nativeCustomerApp ? chips.customerApp : chips.mobileBooking];
  if (f.agentApp) out.push(chips.agentApp);
  if (f.whatsappBooking) out.push(chips.whatsapp);
  out.push(chips.payments, chips.tickets, chips.backOffice);
  return out;
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
