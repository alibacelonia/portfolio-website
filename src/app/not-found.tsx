import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Links";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

/** Framed like every other page: a first band with the shared title, then the way back. */
export default function NotFound() {
  return (
    <Section id="not-found" first headingLevel={1} label="404" title="Page not found">
      <div className="flex min-h-[32svh] flex-col items-center justify-center text-center">
        <p className="max-w-[48ch] type-lead">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <ButtonLink href="/" className="mt-8">
          Back to the portfolio
        </ButtonLink>
      </div>
    </Section>
  );
}
