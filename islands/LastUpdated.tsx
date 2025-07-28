import { useEffect, useState } from "preact/hooks";
import { ExternalLink } from "../components/ExternalLink.tsx";

interface LatestCommit {
  htmlUrl: string;
  date: string;
}

export default () => {
  const [latestCommit, setLatestCommit] = useState<LatestCommit>({
    htmlUrl: "",
    date: "",
  });

  useEffect(() => {
    (async () => {
      const res = await fetch(
        "https://api.github.com/repos/kazuma0129/fresh-portfolio/commits?per_page=1",
      );
      const j = await res.json();
      setLatestCommit({
        htmlUrl: j[0].html_url,
        date: j[0].commit.committer.date,
      });
    })();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="text-center text-sm text-muted-foreground">
      Last Updated:{" "}
      <ExternalLink 
        url={latestCommit.htmlUrl} 
        title={formatDate(latestCommit.date)}
        className="text-muted-foreground hover:text-foreground"
      />
    </div>
  );
};
