/** @jsx h */
import { h, VNode } from 'preact';
import { tw } from '@twind';

interface ExternalLinkProps {
  url: string;
  title: string;
  class?: string;
}

export const ExternalLink = ({ url, title, class: c }: ExternalLinkProps) => {
  return (
    <a href={url} target='_blank' class={c}>
      {title}
    </a>
  );
};
