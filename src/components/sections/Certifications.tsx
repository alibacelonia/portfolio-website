import { certifications } from "@/data/certifications";
import { Section } from "@/components/ui/Section";
import { ExternalLink } from "@/components/ui/Links";
import { disciplineDot } from "@/lib/disciplines";

export function Certifications() {
  return (
    <Section
      id="certifications"
      index="05"
      title="Certifications"
      lead="Three AWS certifications covering solution architecture, cloud fundamentals and AI on AWS. Each links to its verifiable Credly record."
    >
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-5">
        {certifications.map((cert) => (
          <li
            key={cert.id}
            data-reveal
            className="flex flex-col rounded-xl border border-border bg-surface p-5 shadow-card sm:p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-md border border-border bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-fg-soft">
                {cert.code}
              </span>
              <span
                aria-hidden="true"
                className={`size-2 rounded-full ${disciplineDot[cert.discipline]}`}
              />
            </div>
            {cert.badge ? (
              // Only authorized badge assets are configured in data.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cert.badge.src}
                alt={cert.badge.alt}
                width={64}
                height={64}
                className="mt-4"
              />
            ) : null}
            <h3 className="mt-4 text-[15px] leading-snug font-semibold tracking-tight text-fg">
              {cert.name}
            </h3>
            <p className="mt-1 text-[13px] text-muted">{cert.issuer}</p>
            <div className="mt-auto pt-5">
              {cert.credentialUrl ? (
                <ExternalLink
                  href={cert.credentialUrl}
                  className="min-h-8 text-[13px] font-medium text-blue-fg hover:underline"
                  aria-label={`View credential: ${cert.name} on Credly (opens in a new tab)`}
                >
                  View credential
                </ExternalLink>
              ) : (
                <p className="text-[13px] text-muted">Credential link pending verification</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
