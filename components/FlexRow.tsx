/** @jsx h */
import { h, VNode } from 'preact';
import { tw } from '@twind';
import { ExternalLink } from './ExternalLink.tsx';

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
    <div class={tw`align-start`}>
      <div class={tw`flex flex-row`}>{children}</div>
    </div>
  );
};

export const FlexLinkAndDateRow = ({ date, url, title }: FlexLinkAndDateRowProps) => {
  return (
    <FlexRow>
      <div class={tw`mr-3`}>{date}</div>
      <ExternalLink url={url} title={title} />
    </FlexRow>
  );
};
