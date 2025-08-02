import { cn } from "../utils/cn.ts";

interface SectionHeadingProps {
  id: string;
  children: string;
  className?: string;
}

export function SectionHeading({ id, children, className }: SectionHeadingProps) {
  return (
    <h2
      id={id}
      className={cn(
        "text-lg font-bold mb-3 pb-2 border-b border-border text-foreground",
        className
      )}
    >
      {children}
    </h2>
  );
}
