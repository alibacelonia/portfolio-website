import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { site, siteHost } from "@/lib/site";
import { DEFAULT_THEME, themeBootstrapScript } from "@/lib/theme";
import { buildPersonJsonLd } from "@/lib/structured-data";
import { Providers } from "@/components/layout/Providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RevealObserver } from "@/components/ui/RevealObserver";
import "./globals.css";

const title = `${site.name} — Full-Stack, DevOps & AI Engineer`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: title, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: siteHost,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  keywords: [
    "Mohammed Ali B. Abdullah",
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
    siteName: siteHost,
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
  themeColor: "#090c10",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      data-theme={DEFAULT_THEME}
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body>
        <a
          href="#main"
          className="fixed top-2 left-2 z-[60] -translate-y-16 rounded-lg bg-fg px-4 py-2.5 text-sm font-medium text-bg transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>
        <Providers>
          <Header />
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <Footer />
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
