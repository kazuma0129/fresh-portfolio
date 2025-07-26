import { VNode } from "preact";
import { ExternalLink } from "./ExternalLink.tsx";

interface FlexRowProps {
  children: VNode | VNode[];
}

interface FlexLinkAndDateRowProps {
  date: string;
  url: string;
  title: string;
}

export const FlexRow = ({ children }: FlexRowProps) => {
  return (
    <div>
      <div>{children}</div>
    </div>
  );
};

export const FlexLinkAndDateRow = (
  { date, url, title }: FlexLinkAndDateRowProps,
) => {
  return (
    <FlexRow>
      <div>{date}</div>
      <ExternalLink url={url} title={title} />
    </FlexRow>
  );
};
