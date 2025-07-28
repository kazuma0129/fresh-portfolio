import { ExternalLink } from "./ExternalLink.tsx";
import { SectionHeading } from "./SectionHeading.tsx";
import { achievements } from "../constants/about.ts";

export function Achievements() {
  return (
    <section aria-labelledby="achievements-heading">
      <SectionHeading id="achievements-heading">
        Achievements & Speaking
      </SectionHeading>
      <div className="space-y-3" role="list">
        {achievements.map((item, index) => (
          <article key={index} className="space-y-1" role="listitem">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <ExternalLink
                  url={item.url}
                  title={item.title}
                  className="font-medium text-sm"
                />
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>
              <time className="text-sm text-muted-foreground font-light min-w-fit">
                {item.date}
              </time>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
