import { Handlers } from '$fresh/server.ts';
import { gfm } from '../utils/markdown.ts';

const CSS = `${gfm.CSS}
* {
  font-size: 14px;
}

ol.nested {
	counter-reset: item;
}

ol.nested li {
	display: block;
}

ol.nested li:before {
	font-feature-settings: "kern" 1, "tnum" 1;
	-webkit-font-feature-settings: "kern" 1, "tnum" 1;
	-ms-font-feature-settings: "kern" 1, "tnum" 1;
	-moz-font-feature-settings: "kern" 1, "tnum" 1;
	content: counters(item, ".") ". ";
	counter-increment: item;
}

.markdown-body ul {
  list-style: disc;
}

.markdown-body ol {
  list-style: numeric;
}
`;

export const handler: Handlers = {
  GET: () => {
    return new Response(CSS, {
      headers: {
        'content-type': 'text/css',
        'cache-control': 'public, max-age=31536000, immutable',
      },
    });
  },
};
