import { ExternalLink } from "./ExternalLink.tsx";
import { SectionHeading } from "./SectionHeading.tsx";
import { education } from "../constants/about.ts";

export function Education() {
  return (
    <section aria-labelledby="education-heading">
      <SectionHeading id="education-heading">
        Education
      </SectionHeading>
      <div className="space-y-2" role="list">
        {education.map((item, index) => (
          <article
            key={index}
            className="flex justify-between items-start gap-4"
            role="listitem"
          >
            <div className="flex-1">
              <h3 className="font-medium text-sm text-foreground">
                {item.degree}
              </h3>
              <ExternalLink
                url={item.url}
                title={item.institution}
                className="text-sm text-muted-foreground mt-1"
              />
              <p className="text-sm text-muted-foreground">
                {item.location}
              </p>
            </div>
            <time className="text-sm text-muted-foreground font-light min-w-fit">
              {item.date}
            </time>
          </article>
        ))}
      </div>
    </section>
  );
}
