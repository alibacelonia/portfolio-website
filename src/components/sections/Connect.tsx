import { Section } from "@/components/ui/Section";
import { ActionStrip } from "@/components/ui/ActionStrip";
import { ConnectPanel } from "./ConnectPanel";

/** Home Connect band: who I am, why you're here and direct channels; the form lives on /connect/. */
export function Connect() {
  return (
    <Section
      id="connect"
      index="06"
      eyebrow={
        <>
          <span aria-hidden="true">06 / </span>Connect
        </>
      }
      title="Tell me what you're building"
      lead="An opportunity, a project or an idea: pick what brings you here, or reach me directly."
      footer={<ActionStrip href="/connect/">Send a message</ActionStrip>}
    >
      <ConnectPanel />
    </Section>
  );
}
