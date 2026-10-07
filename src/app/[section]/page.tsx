import { notFound } from "next/navigation";
import SitePage from "@/components/SitePage";

const SECTIONS = ["home", "about", "gallery", "writeups", "contact"] as const;

export function generateStaticParams() {
  return SECTIONS.map((section) => ({ section }));
}

export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!SECTIONS.includes(section as (typeof SECTIONS)[number])) notFound();

  return <SitePage />;
}
