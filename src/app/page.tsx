import type { Metadata } from "next";

import { LandingPage } from "@/features/landing/components/landing-page";

export const metadata: Metadata = {
  title: "FlexoWhats — WhatsApp automation for teams",
  description:
    "Connect devices, run bulk campaigns, auto-replies, chatbots, live chat, and billing in one modern workspace.",
  openGraph: {
    title: "FlexoWhats — WhatsApp automation for teams",
    description:
      "Connect devices, run bulk campaigns, auto-replies, chatbots, live chat, and billing in one modern workspace.",
    type: "website",
  },
};

export default function Home() {
  return <LandingPage />;
}
