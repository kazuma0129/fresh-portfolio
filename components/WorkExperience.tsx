import { ExternalLink } from "./ExternalLink.tsx";
import { SectionHeading } from "./SectionHeading.tsx";
import { experience } from "../constants/about.ts";

export function WorkExperience() {
  return (
    <section aria-labelledby="experience-heading">
      <SectionHeading id="experience-heading">
        Work Experience
      </SectionHeading>
      <div className="space-y-4" role="list">
        {experience.map((item, index) => (
          <article key={index} className="space-y-2" role="listitem">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <h3 className="font-medium text-sm text-foreground">
                  {item.position}
                </h3>
                {item.url ? (
                  <ExternalLink
                    url={item.url}
                    title={item.company}
                    className="text-sm text-muted-foreground mt-1"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.company}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  {item.location}
                </p>
              </div>
              <time className="text-sm text-muted-foreground font-light min-w-fit">
                {item.date}
              </time>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {item.description}
            </p>
            {item.highlights && (
              <ul
                className="text-xs text-muted-foreground space-y-1 pl-4"
                role="list"
              >
                {item.highlights.map((highlight, hIndex) => (
                  <li
                    key={hIndex}
                    className="relative before:content-['•'] before:absolute before:-left-3"
                  >
                    {highlight}
                  </li>
                ))}
              </ul>
            )}
            {item.links && (
              <div className="mt-3">
                <h4 className="text-sm font-medium text-foreground mb-2">
                  Links
                </h4>
                <ul className="space-y-1" role="list">
                  {item.links.map((link, linkIndex) => (
                    <li key={linkIndex} className="text-xs">
                      <ExternalLink
                        url={link.url}
                        title={link.title}
                        className="text-primary text-xs"
                      />
                      {link.description && (
                        <span className="text-muted-foreground ml-1">
                          - {link.description}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
