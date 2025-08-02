import { cn } from "../utils/cn.ts";

interface ExternalLinkProps {
  url: string;
  title: string;
  className?: string;
}

export const ExternalLink = ({ url, title, className = "" }: ExternalLinkProps) => {
  const isExternal = url.startsWith('http') && !url.includes('fresh-portfolio.deno.dev');
  
  return (
    <a 
      href={url} 
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className={cn(
        "text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      aria-label={isExternal ? `${title} (opens in new tab)` : title}
    >
      {title}
      {isExternal && (
        <span className="sr-only"> (opens in new tab)</span>
      )}
    </a>
  );
};
