import { HomeView } from "@/components/home/HomeView";
import type { Metadata } from "next";
import { instaTicketsStatus } from "@/content/facts";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = { alternates: canonical("/") };

export default function Home() {
  return <HomeView status={instaTicketsStatus} />;
}
