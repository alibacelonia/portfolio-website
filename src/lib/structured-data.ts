import { site } from "@/lib/site";
import { certifications } from "@/data/certifications";
import { experience } from "@/data/experience";

/** schema.org ProfilePage + Person, serialized safely for an inline <script>. */
export function buildPersonJsonLd(): string {
  const current = experience.find((role) => role.end === null);
  const data = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: `${site.url}/`,
    mainEntity: {
      "@type": "Person",
      "@id": `${site.url}/#person`,
      name: site.name,
      alternateName: site.brand,
      url: `${site.url}/`,
      email: `mailto:${site.email}`,
      jobTitle: site.roles.join(", "),
      description: site.description,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Baguio City",
        addressCountry: "PH",
      },
      sameAs: [site.github, site.linkedin],
      ...(current
        ? { worksFor: { "@type": "Organization", name: current.organization.split(" · ")[0] } }
        : {}),
      knowsAbout: [
        "Full-stack development",
        "DevOps",
        "Amazon Web Services",
        "Terraform",
        "CI/CD",
        "AI engineering",
      ],
      hasCredential: certifications.map((cert) => ({
        "@type": "EducationalOccupationalCredential",
        name: cert.name,
        credentialCategory: "certification",
        recognizedBy: { "@type": "Organization", name: cert.issuer },
        ...(cert.credentialUrl ? { url: cert.credentialUrl } : {}),
      })),
    },
  };
  // Escape "<" so the JSON can never close the surrounding script element.
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
