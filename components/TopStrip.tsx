import { INSTATICKETS_URL, topStrip } from "@/content/site";
import type { InstaTicketsStatus } from "@/content/compose";

export function TopStrip({ status }: { status: InstaTicketsStatus }) {
  const s = topStrip[status];
  return (
    <div className="bg-navy text-white">
      <p className="mx-auto max-w-6xl px-4 py-2 text-center text-sm sm:px-6 lg:px-8">
        {s.text}{" "}
        <a href={INSTATICKETS_URL} className="font-bold underline underline-offset-2 hover:no-underline">
          {s.link}
        </a>
      </p>
    </div>
  );
}
