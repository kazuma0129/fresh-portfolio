import { ExternalLink } from "./ExternalLink.tsx";
import { SectionHeading } from "./SectionHeading.tsx";
import { certifications } from "../constants/about.ts";

export function Certifications() {
  return (
    <section aria-labelledby="certifications-heading">
      <SectionHeading id="certifications-heading">
        Certifications
      </SectionHeading>
      <div className="space-y-2" role="list">
        {certifications.map((item, index) => (
          <article
            key={index}
            className="flex justify-between items-start gap-4"
            role="listitem"
          >
            <div className="flex-1">
              <ExternalLink
                url={item.url}
                title={item.name}
                className="font-medium text-sm"
              />
              <p className="text-sm text-muted-foreground mt-1">
                {item.issuer}
              </p>
              {"credentialId" in item && item.credentialId && (
                <p className="text-xs text-muted-foreground">
                  ID: {item.credentialId}
                </p>
              )}
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
