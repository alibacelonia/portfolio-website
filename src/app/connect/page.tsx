import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { ConnectPanel } from "@/components/sections/ConnectPanel";
import { site, siteHost } from "@/lib/site";

const title = "Connect";
const description =
  "Get in touch with Mohammed Ali B. Abdullah about a project, a role or just to say hello.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/connect/" },
  openGraph: {
    type: "website",
    url: "/connect/",
    siteName: siteHost,
    title,
    description,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: site.name }],
  },
  twitter: { card: "summary_large_image", title, description },
};

export default function ConnectPage() {
  return (
    <Section
      id="connect"
      first
      headingLevel={1}
      eyebrow="Get in touch"
      title="Tell me what you're building"
      lead="Pick what brings you here and send a message, or reach me directly."
    >
      <ConnectPanel withForm />
    </Section>
  );
}
