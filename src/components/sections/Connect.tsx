import { Section } from "@/components/ui/Section";
import { ActionStrip } from "@/components/ui/ActionStrip";
import { ConnectPanel } from "./ConnectPanel";

/** Home Connect band: who I am, why you're here and direct channels; the form lives on /connect/. */
export function Connect() {
  return (
    <Section
      id="connect"
      label="Connect"
      title="Tell me what you're building"
      footer={
        <ActionStrip href="/connect/" prominent>
          Send a message
        </ActionStrip>
      }
    >
      <ConnectPanel />
    </Section>
  );
}
