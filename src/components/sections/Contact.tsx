import { site } from "@/lib/site";
import { ExternalLink } from "@/components/ui/Links";
import { SectionFrame } from "@/components/ui/SectionFrame";
import { ContactForm } from "./ContactForm";

const channels = [
  { label: "Email", value: site.email, href: `mailto:${site.email}`, external: false },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/alibacelonia",
    href: site.linkedin,
    external: true,
  },
  { label: "GitHub", value: "github.com/alibacelonia", href: site.github, external: true },
];

export function Contact() {
  return (
    <SectionFrame
      id="contact"
      aria-labelledby="contact-title"
      className="bg-bg py-16 sm:py-20 lg:py-24"
    >
      <div className="container-fluid grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
        <div data-reveal className="section-panel p-5 sm:p-7 lg:col-span-5">
          <p className="mb-3 type-eyebrow">
            <span aria-hidden="true">06 / </span>Contact
          </p>
          <h2 id="contact-title" className="type-section-title">
            Let&apos;s Work Together
          </h2>
          <p className="mt-3 measure type-lead">
            Have an opportunity, interesting project, or idea? I&apos;d love to hear about it.
          </p>

          <dl className="mt-8 divide-y divide-border border-y border-border type-body">
            {channels.map((channel) => (
              <div
                key={channel.label}
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3"
              >
                <dt className="type-label text-muted">{channel.label}</dt>
                <dd className="min-w-0">
                  {channel.external ? (
                    <ExternalLink
                      href={channel.href}
                      className="min-h-8 break-all text-fg-soft hover:text-fg"
                    >
                      {channel.value}
                    </ExternalLink>
                  ) : (
                    <a
                      href={channel.href}
                      className="inline-flex min-h-8 items-center break-all text-fg-soft hover:text-fg"
                    >
                      {channel.value}
                    </a>
                  )}
                </dd>
              </div>
            ))}
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3">
              <dt className="type-label text-muted">Based in</dt>
              <dd className="text-fg-soft">{site.location}</dd>
            </div>
          </dl>
        </div>

        <div data-reveal className="section-panel p-5 sm:p-7 lg:col-span-7">
          <ContactForm />
        </div>
      </div>
    </SectionFrame>
  );
}
