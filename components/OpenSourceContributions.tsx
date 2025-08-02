import { ExternalLink } from "./ExternalLink.tsx";
import { SectionHeading } from "./SectionHeading.tsx";
import { openSourceContributions } from "../constants/about.ts";
import { cn } from "../utils/cn.ts";

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
              <span className={cn(
                "inline-block text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full",
                "transition-colors duration-200 hover:bg-muted/80"
              )}>
                {item.type}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
