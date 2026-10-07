import { Rich } from "@/components/Rich";
import { INSTATICKETS_URL, topStrip } from "@/content/site";
import type { InstaTicketsStatus } from "@/content/compose";

export function TopStrip({ status }: { status: InstaTicketsStatus }) {
  const s = topStrip[status];
  return (
    <div className="bg-navy text-white">
      <p className="mx-auto max-w-6xl px-4 py-2 text-center text-[15px] leading-6 sm:px-6 lg:px-8">
        <Rich on="navy" textPx={15}>
          {s.text}
        </Rich>{" "}
        <a href={INSTATICKETS_URL} className="font-bold underline underline-offset-2 hover:no-underline">
          <Rich on="navy" textPx={15}>
            {s.link}
          </Rich>
        </a>
      </p>
    </div>
  );
}
