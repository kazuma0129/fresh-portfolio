/** @jsx h */
import { h } from 'preact';
import { tw } from '@twind';
import { useEffect, useState } from 'preact/hooks';
import { ExternalLink } from '../components/ExternalLink.tsx';

interface LatestCommit {
  htmlUrl: string;
  date: string;
}

export default function LastUpdated() {
  const [latestCommit, setLatestCommit] = useState<LatestCommit>({ htmlUrl: '', date: '' });

  useEffect(() => {
    (async () => {
      const res = await fetch(
        'https://api.github.com/repos/kazuma0129/fresh-portfolio/commits?per_page=1'
      );
      const j = await res.json();
      console.log(j);
      setLatestCommit({
        htmlUrl: j[0].html_url,
        date: j[0].commit.committer.date,
      });
    })();
  }, []);
  return (
    <div class={tw`text-sm`}>
      Last Updated: <ExternalLink url={latestCommit.htmlUrl} title={latestCommit.date} />
    </div>
  );
}
