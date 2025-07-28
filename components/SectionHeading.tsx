interface SectionHeadingProps {
  id: string;
  children: string;
}

export function SectionHeading({ id, children }: SectionHeadingProps) {
  return (
    <h2
      id={id}
      className="text-lg font-bold mb-3 pb-2 border-b border-border text-foreground"
    >
      {children}
    </h2>
  );
}
