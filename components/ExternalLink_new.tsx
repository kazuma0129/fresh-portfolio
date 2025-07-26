interface ExternalLinkProps {
  url: string;
  title: string;
}

export const ExternalLink = ({ url, title }: ExternalLinkProps) => {
  return (
    <a href={url} target="_blank" rel="noreferrer">
      {title}
    </a>
  );
};
