import { ExternalLink } from "./ExternalLink.tsx";
import { personalInfo, links } from "../constants/about.ts";

export function ProfileHeader() {
  return (
    <header className="mb-6 flex justify-between" role="banner">
      <div>
        <h1 className="text-3xl font-bold mb-2 tracking-tight text-foreground">
          {personalInfo.name}
        </h1>
        <p
          className="text-lg text-muted-foreground mb-3 font-light"
          role="doc-subtitle"
        >
          Software Engineer
        </p>
        <address className="space-y-2 text-sm text-muted-foreground not-italic">
          <p>{personalInfo.location}</p>
          <div className="flex flex-wrap gap-3 items-center">
            <ExternalLink
              url={`mailto:${personalInfo.email}`}
              title={personalInfo.email}
            />
            <span>{personalInfo.phone}</span>
          </div>
          <nav
            className="flex flex-wrap gap-3 pt-1"
            aria-label="Social media links"
          >
            {links.map((item, index) => (
              <ExternalLink
                key={index}
                url={item.url}
                title={item.name}
                className="text-xs text-muted-foreground hover:text-foreground underline decoration-1 underline-offset-2"
              />
            ))}
          </nav>
        </address>
      </div>
      <div className="relative flex shrink-0 overflow-hidden rounded-xl size-28">
        <img
          className="aspect-square h-full w-full"
          src="https://avatars.githubusercontent.com/u/38906043?v=4"
          alt=""
        />
      </div>
    </header>
  );
}
