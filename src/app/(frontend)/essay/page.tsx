import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { EssayPageClient } from "./_components/EssayPageClient";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "即刻短文",
    description: "随时随地，分享生活。",
    path: "/essay",
  });
}

export default function EssayPage() {
  return <EssayPageClient />;
}
