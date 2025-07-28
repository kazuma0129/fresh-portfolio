import { SectionHeading } from "./SectionHeading.tsx";
import { languages } from "../constants/about.ts";

export function Languages() {
  return (
    <section aria-labelledby="languages-heading">
      <SectionHeading id="languages-heading">
        Languages
      </SectionHeading>
      <div className="space-y-2" role="list">
        {languages.map((item, index) => (
          <div
            key={index}
            className="flex justify-between items-center"
            role="listitem"
          >
            <span className="font-medium text-sm text-foreground">
              {item.name}
            </span>
            <span className="text-sm text-muted-foreground">
              {item.level}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
