import { renderToStaticMarkup } from "react-dom/server";
import { HomeView } from "@/components/home/HomeView";
import type { InstaTicketsStatus } from "@/content/compose";
import { facts as defaultFacts } from "@/content/facts";
import type { Facts } from "@/content/facts";

export const allOff: Facts = Object.fromEntries(Object.keys(defaultFacts).map((k) => [k, false])) as Facts;
export const allOn: Facts = Object.fromEntries(Object.keys(defaultFacts).map((k) => [k, true])) as Facts;

export function renderHome(opts: { facts?: Facts; status?: InstaTicketsStatus } = {}) {
  return renderToStaticMarkup(
    <HomeView facts={opts.facts ?? defaultFacts} status={opts.status ?? "prelaunch"} />,
  );
}

/** Page text as a reader gets it: tags removed, and each logo image replaced by its alt text (the name it announces). */
export function withAlts(html: string): string {
  return html.replace(/<img[^>]*?alt="([^"]*)"[^>]*>/g, "$1").replace(/<[^>]+>/g, "");
}
