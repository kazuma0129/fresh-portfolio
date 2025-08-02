import { SectionHeading } from "./SectionHeading.tsx";
import { skills } from "../constants/about.ts";
import { cn } from "../utils/cn.ts";

export function TechnicalSkills() {
  return (
    <section aria-labelledby="skills-heading">
      <SectionHeading id="skills-heading">
        Technical Skills
      </SectionHeading>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3" role="list">
        {skills.map((skillGroup, index) => (
          <div key={index} className="space-y-2" role="listitem">
            <h3 className="font-medium text-sm text-foreground">
              {skillGroup.category}
            </h3>
            <div className="flex flex-wrap gap-2" role="list">
              {skillGroup.items.map((skill, skillIndex) => (
                <span
                  key={skillIndex}
                  className={cn(
                    "px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full",
                    "transition-colors duration-200 hover:bg-muted/80",
                    "border border-transparent hover:border-border/50"
                  )}
                  role="listitem"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
