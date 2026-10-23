import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { site } from "@/lib/site";
import { themeBootstrapScript } from "@/lib/theme";
import { buildPersonJsonLd } from "@/lib/structured-data";
import { Providers } from "@/components/layout/Providers";
import { Header } from "@/components/layout/Header";
import { Dock } from "@/components/layout/Dock";
import { Footer } from "@/components/layout/Footer";
import { RevealObserver } from "@/components/ui/RevealObserver";
import "./globals.css";

const title = `${site.name} — Full-Stack, DevOps & AI Engineer`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: title, template: `%s · ${site.brand}` },
  description: site.description,
  applicationName: site.brand,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  keywords: [
    "Mohammed Ali B. Abdullah",
    "MABA",
    "DevOps Engineer",
    "Full-Stack Developer",
    "AI Engineer",
    "AWS",
    "Terraform",
    "Baguio City",
    "Philippines",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    url: "/",
    siteName: site.brand,
    title,
    description: site.description,
    locale: "en_US",
    firstName: "Mohammed Ali",
    lastName: "Abdullah",
    username: "alibacelonia",
  },
  twitter: { card: "summary_large_image", title, description: site.description },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafbfc" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1117" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body>
        <a
          href="#main"
          className="fixed top-2 left-2 z-50 -translate-y-16 rounded-lg bg-fg px-4 py-2.5 text-sm font-medium text-bg transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>
        <Providers>
          <Header />
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <Footer />
          <Dock />
        </Providers>
        <RevealObserver />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: buildPersonJsonLd() }}
        />
      </body>
    </html>
  );
}
