import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Links";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section className="container-fluid flex min-h-[70dvh] flex-col items-start justify-center pt-[var(--nav-offset)]">
      <p className="type-eyebrow">404</p>
      <h1 className="mt-3 type-page-title">Page not found</h1>
      <p className="mt-2 max-w-[48ch] type-lead">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <ButtonLink href="/" className="mt-8">
        Back to the portfolio
      </ButtonLink>
    </section>
  );
}
