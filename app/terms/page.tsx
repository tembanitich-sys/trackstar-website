import type { Metadata } from "next";
import { comingSoon } from "@/content/site";

export const metadata: Metadata = { title: comingSoon.terms.title, robots: { index: false } };

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
      <h1 className="text-4xl text-navy sm:text-5xl">{comingSoon.terms.title}</h1>
      <p className="mt-6 font-heading text-2xl font-bold text-green-text">{comingSoon.terms.body}</p>
    </div>
  );
}
