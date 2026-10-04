import { HomeView } from "@/components/home/HomeView";
import { getInstaTicketsStatus } from "@/lib/status";
import { helpPresetFor } from "@/content/site";

export default async function Home({ searchParams }: { searchParams: Promise<{ help?: string }> }) {
  const [status, { help }] = await Promise.all([getInstaTicketsStatus(), searchParams]);
  return <HomeView status={status} helpPreset={helpPresetFor(help)} />;
}
