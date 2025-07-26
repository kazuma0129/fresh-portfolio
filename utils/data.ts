import pageMap from "../data/page_map.json" with { type: "json" };

export type POST_PATHS = keyof typeof pageMap["posts"];

export const DATA_BASE_PATH = "data";

export type POST_DATA = {
  path: string;
  href: string;
  title: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

const genPostObj = <T>(path: T, title: string): POST_DATA => ({
  path: `${DATA_BASE_PATH}/${path}.md`,
  href: `posts/${path}`,
  title,
});

export const POST_MAP = new Map<string, POST_DATA>();

for (const kv of Object.entries(pageMap.posts)) {
  POST_MAP.set(kv[0], genPostObj(...kv));
}
