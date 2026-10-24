import { site } from "@/lib/site";
import { OverviewStrip, type OverviewCell } from "@/components/ui/OverviewStrip";

const cells: OverviewCell[] = [
  { label: "Building", value: "Full-stack applications", accent: "bg-blue" },
  { label: "Experience", value: `${site.experienceYears} years`, accent: "bg-sage" },
  { label: "Certified", value: "AWS 3×", accent: "bg-lavender", href: "#certifications" },
  { label: "Reach out", value: "Start a conversation", href: "#contact" },
];

/** The hero's closing strip; the last two cells are full-tile links. */
export function HeroOverview() {
  return <OverviewStrip cells={cells} label="At a glance" />;
}
