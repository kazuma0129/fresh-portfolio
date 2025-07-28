import { ExternalLink } from "./ExternalLink.tsx";
import { SectionHeading } from "./SectionHeading.tsx";
import { openSourceContributions } from "../constants/about.ts";

export function OpenSourceContributions() {
  return (
    <section aria-labelledby="opensource-heading">
      <SectionHeading id="opensource-heading">
        Open Source Contributions
      </SectionHeading>
      <div className="space-y-2" role="list">
        {openSourceContributions.map((item, index) => (
          <article key={index} className="space-y-1" role="listitem">
            <div className="space-y-1">
              <ExternalLink
                url={item.url}
                title={item.title}
                className="font-medium text-sm"
              />
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
              <span className="inline-block text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                {item.type}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
