import Image from "next/image";
import { certifications } from "@/data/certifications";
import { Section } from "@/components/ui/Section";
import { ExternalLink } from "@/components/ui/Links";

/**
 * One panel split into equal cells (the same language as the hero overview strip), each led by
 * the official badge. Badges are decorative here because the name sits right beside them.
 */
export function Certifications() {
  return (
    <Section
      id="certifications"
      index="05"
      title="Certifications"
      lead="Three AWS certifications covering solution architecture, cloud fundamentals and AI on AWS. Each one can be verified on Credly."
    >
      <ul
        data-reveal
        className="grid grid-cols-1 divide-y divide-border overflow-hidden card-shell lg:grid-cols-3 lg:divide-x lg:divide-y-0"
      >
        {certifications.map((cert) => (
          <li
            key={cert.id}
            className="grid grid-cols-[5rem_minmax(0,1fr)] items-start gap-x-5 p-5 sm:grid-cols-[6rem_minmax(0,1fr)] sm:gap-x-6 sm:p-6 lg:flex lg:flex-col lg:items-center lg:p-8 lg:text-center"
          >
            {cert.badge ? (
              <Image
                src={cert.badge.src}
                alt=""
                width={320}
                height={320}
                className="size-20 select-none sm:size-24 lg:size-32"
                draggable={false}
              />
            ) : (
              <span aria-hidden="true" />
            )}

            <div className="flex min-w-0 flex-col lg:mt-6 lg:flex-1 lg:items-center">
              {/* Reserve two lines in the three-column layout so codes, issuers and links align. */}
              <h3 className="type-card-title text-balance lg:min-h-[2lh]">{cert.name}</h3>
              <p className="mt-2 flex flex-wrap items-center gap-2 lg:justify-center">
                <span className="rounded-md border border-border bg-surface-2 px-2 py-0.5 type-label text-fg-soft">
                  {cert.code}
                </span>
                <span className="type-label text-muted">{cert.level}</span>
              </p>
              <p className="mt-2 type-body text-muted">{cert.issuer}</p>

              <div className="mt-4 lg:mt-auto lg:pt-6">
                {cert.credentialUrl ? (
                  <ExternalLink
                    href={cert.credentialUrl}
                    className="min-h-10 type-action text-fg hover:underline"
                    aria-label={`Verify on Credly: ${cert.name} (opens in a new tab)`}
                  >
                    Verify on Credly
                  </ExternalLink>
                ) : (
                  <p className="type-small text-muted">Credential link pending verification</p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
