/** @jsx h */
import { h, VNode } from 'preact';
import { tw } from '@twind';

interface ExternalLinkProps {
  url: string;
  title: string;
}

export const ExternalLink = ({ url, title }: ExternalLinkProps) => {
  return (
    <a href={url} target='_blank'>
      {title}
    </a>
  );
};
