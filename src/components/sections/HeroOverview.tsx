import { site } from "@/lib/site";
import { experience } from "@/data/experience";
import { OverviewStrip, type OverviewCell } from "@/components/ui/OverviewStrip";

// The hero already lists the three roles; this cell says where I work now instead.
const current = experience.find((role) => !role.end)!;
const product = current.organization.split(" · ").at(-1);

const cells: OverviewCell[] = [
  { label: "Currently", value: `${current.title}, ${product}`, accent: "bg-blue" },
  { label: "Experience", value: `${site.experienceYears} years`, accent: "bg-sage" },
  { label: "Certified", value: "AWS 3×", accent: "bg-lavender", href: "#certifications" },
  { label: "Reach out", value: "Start a conversation", href: "#connect" },
];

/** The hero's closing strip; the last two cells are full-tile links. */
export function HeroOverview() {
  return <OverviewStrip cells={cells} label="At a glance" />;
}
