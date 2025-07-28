import { SectionHeading } from "./SectionHeading.tsx";
import { personalInfo } from "../constants/about.ts";

export function ProfessionalSummary() {
  return (
    <section aria-labelledby="summary-heading">
      <SectionHeading id="summary-heading">
        Professional Summary
      </SectionHeading>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {personalInfo.summary}
      </p>
    </section>
  );
}
