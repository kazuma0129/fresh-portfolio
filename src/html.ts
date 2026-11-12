import {
  achievements,
  certifications,
  education,
  experience,
  languages,
  links,
  openSourceContributions,
  personalInfo,
  skills,
} from "./profile.ts";

import { absolute, homepageModified } from "./site.ts";
const siteUrl = absolute("/");
const title = "Kazuma Ohashi | Software Engineering Portfolio and API";
const description =
  "Explore Kazuma Ohashi’s software engineering portfolio, including his work on the LIFF SDK, open-source contributions, and a public API for citing his CV.";

const questions = [
  { question: "Where can I find Kazuma Ohashi’s open-source work?",
    answer: "The Open Source Contributions section links to the Vue Trusted Types RFC discussion and the merged ESLint plugin change. Follow the repository links to read the proposals and code.", href: "/#opensource-heading", label: "Open Source Contributions" },
  { question: "How can I cite a specific part of the CV?",
    answer: "Get the section index from /api/v1/portfolio. Each entry contains a title and a permanent link to that section of the CV.", href: "/docs", label: "API documentation" },
  { question: "Do I need an API key to use the portfolio MCP server?",
    answer: "The public MCP server works without an account or API key. Connect to /mcp using Streamable HTTP and call list_portfolio_sections with an empty object.", href: "/docs/mcp", label: "MCP connection guide" },
];

function structuredData(value: object) {
  return `<script type="application/ld+json">${JSON.stringify(value).replaceAll("<", "\\u003c")}</script>`;
}

const themeScript = `
(() => {
  const storageKey = "theme";
  const root = document.documentElement;
  const getSystemTheme = () => window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  const getSavedTheme = () => {
    try {
      const savedTheme = localStorage.getItem("theme");
      return savedTheme === "dark" || savedTheme === "light" ? savedTheme : null;
    } catch {
      return null;
    }
  };
  const saveTheme = (theme) => {
    try {
      localStorage.setItem(storageKey, theme);
    } catch {
      // Ignore storage failures so the control still works for this page view.
    }
  };
  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    const toggle = document.querySelector("[data-theme-toggle]");

    if (!toggle) {
      return;
    }

    const nextTheme = theme === "dark" ? "light" : "dark";
    toggle.dataset.themeToggle = nextTheme;
    toggle.setAttribute("aria-label", \`Switch to \${nextTheme} theme\`);
    toggle.setAttribute("title", \`Switch to \${nextTheme} theme\`);
    toggle.querySelector("[data-theme-label]").textContent = nextTheme === "dark" ? "Dark" : "Light";
  };

  applyTheme(getSavedTheme() || getSystemTheme());

  document.addEventListener("DOMContentLoaded", () => {
    applyTheme(getSavedTheme() || getSystemTheme());
    document.querySelector("[data-theme-toggle]")?.addEventListener("click", () => {
      const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
      saveTheme(nextTheme);
      applyTheme(nextTheme);
    });
  });
})();
`.trim();

export function escapeHtml(value: unknown): string {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function attr(value: unknown): string {
  return escapeHtml(value);
}

function externalLink(url: string, label: string, className = ""): string {
  const safeUrl = attr(url);
  const safeLabel = escapeHtml(label);
  const classAttr = className ? ` class="${attr(className)}"` : "";
  const isExternal = /^https?:\/\//.test(url);
  const targetAttrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : "";
  const aria = isExternal ? ` aria-label="${attr(`${label} (opens in new tab)`)}"` : "";
  const sr = isExternal ? '<span class="sr-only"> (opens in new tab)</span>' : "";

  return `<a href="${safeUrl}"${targetAttrs}${classAttr}${aria}>${safeLabel}${sr}</a>`;
}

function sectionHeading(id: string, text: string): string {
  return `<h2 id="${attr(id)}">${escapeHtml(text)}</h2>`;
}

function renderProfileHeader(): string {
  return `
    <header class="profile-header">
      <div>
        <h1>${escapeHtml(personalInfo.name)}</h1>
        <p class="subtitle" role="doc-subtitle">Software Engineer</p>
        <address>
          <p>${escapeHtml(personalInfo.location)}</p>
          <div class="contact-row">
            ${externalLink(`mailto:${personalInfo.email}`, personalInfo.email)}
            <span>${escapeHtml(personalInfo.phone)}</span>
          </div>
          <nav aria-label="Social media links" class="social-links">
            ${links.map((item) => externalLink(item.url, item.name)).join("")}
          </nav>
        </address>
      </div>
      <div class="profile-actions">
        <button class="theme-toggle" type="button" data-theme-toggle="dark" aria-label="Switch to dark theme" title="Switch to dark theme">
          <span class="theme-toggle__icon" aria-hidden="true"></span>
          <span data-theme-label>Dark</span>
        </button>
        <img class="profile-mark" src="favicon.svg" width="96" height="96" alt="" />
      </div>
    </header>
  `;
}

function renderSummary(): string {
  return `
    <section aria-labelledby="summary-heading">
      ${sectionHeading("summary-heading", "Professional Summary")}
      <p>${escapeHtml(personalInfo.summary)}</p>
    </section>
  `;
}

function renderExperience(): string {
  return `
    <section aria-labelledby="experience-heading">
      ${sectionHeading("experience-heading", "Work Experience")}
      <div class="stack-lg" role="list">
        ${experience
          .map((item) => `
            <article role="listitem">
              <div class="split">
                <div>
                  <h3>${escapeHtml(item.position)}</h3>
                  ${externalLink(item.url, item.company, "muted-link")}
                  <p>${escapeHtml(item.location)}</p>
                </div>
                <time>${escapeHtml(item.date)}</time>
              </div>
              <p>${escapeHtml(item.description)}</p>
              ${item.highlights ? `<ul class="compact-list">${item.highlights.map((highlight) => `<li>${escapeHtml(highlight)}</li>`).join("")}</ul>` : ""}
              ${item.links ? `
                <div class="related-links">
                  <h4>Links</h4>
                  <ul>
                    ${item.links.map((link) => `
                      <li>
                        ${externalLink(link.url, link.title)}
                        ${link.description ? `<span> - ${escapeHtml(link.description)}</span>` : ""}
                      </li>
                    `).join("")}
                  </ul>
                </div>
              ` : ""}
            </article>
          `)
          .join("")}
      </div>
    </section>
  `;
}

function renderEducation(): string {
  return `
    <section aria-labelledby="education-heading">
      ${sectionHeading("education-heading", "Education")}
      <div role="list">
        ${education.map((item) => `
          <article class="split" role="listitem">
            <div>
              <h3>${escapeHtml(item.degree)}</h3>
              ${externalLink(item.url, item.institution, "muted-link")}
              <p>${escapeHtml(item.location)}</p>
            </div>
            <time>${escapeHtml(item.date)}</time>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderCertifications(): string {
  return `
    <section aria-labelledby="certifications-heading">
      ${sectionHeading("certifications-heading", "Certifications")}
      <div class="stack-sm" role="list">
        ${certifications.map((item) => `
          <article class="split" role="listitem">
            <div>
              ${externalLink(item.url, item.name)}
              <p>${escapeHtml(item.issuer)}</p>
              ${item.credentialId ? `<p class="small">ID: ${escapeHtml(item.credentialId)}</p>` : ""}
            </div>
            <time>${escapeHtml(item.date)}</time>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderSkills(): string {
  return `
    <section aria-labelledby="skills-heading">
      ${sectionHeading("skills-heading", "Technical Skills")}
      <div class="skills-grid" role="list">
        ${skills.map((group) => `
          <div role="listitem">
            <h3>${escapeHtml(group.category)}</h3>
            <ul class="pill-list">
              ${group.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
            </ul>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function renderOpenSource(): string {
  return `
    <section aria-labelledby="opensource-heading">
      ${sectionHeading("opensource-heading", "Open Source Contributions")}
      <div class="stack-sm" role="list">
        ${openSourceContributions.map((item) => `
          <article role="listitem">
            <cite>${externalLink(item.url, item.title)}</cite>
            <p>${escapeHtml(item.description)}</p>
            <span class="tag">${escapeHtml(item.type)}</span>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderAchievements(): string {
  return `
    <section aria-labelledby="achievements-heading">
      ${sectionHeading("achievements-heading", "Achievements & Speaking")}
      <div class="stack-md" role="list">
        ${achievements.map((item) => `
          <article class="split" role="listitem">
            <div>
              ${externalLink(item.url, item.title)}
              <p>${escapeHtml(item.description)}</p>
            </div>
            <time>${escapeHtml(item.date)}</time>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderLanguages(): string {
  return `
    <section aria-labelledby="languages-heading">
      ${sectionHeading("languages-heading", "Languages")}
      <dl class="language-list">
        ${languages.map((item) => `
          <div>
            <dt>${escapeHtml(item.name)}</dt>
            <dd>${escapeHtml(item.level)}</dd>
          </div>
        `).join("")}
      </dl>
    </section>
  `;
}

export function renderDocument(): string {
  const person = {
    "@context": "https://schema.org", "@type": "Person", "@id": siteUrl + "#person",
    name: personalInfo.name, url: siteUrl, description: personalInfo.summary, jobTitle: "Software Engineer",
    knowsAbout: ["Software engineering", "JavaScript", "TypeScript", "Node.js"],
    sameAs: links.map(link => link.url),
    contactPoint: { "@type": "ContactPoint", contactType: "Professional inquiries", email: personalInfo.email, url: absolute("/contact") },
    address: { "@type": "PostalAddress", addressLocality: "Tokyo", addressCountry: "JP" },
  };
  const author = { "@type": "Person", "@id": person["@id"], name: personalInfo.name, url: absolute("/about") };
  const profilePage = {
    "@context": "https://schema.org", "@type": "ProfilePage", "@id": siteUrl + "#profile",
    url: siteUrl, name: title, description, mainEntity: { "@id": person["@id"] }, author,
    citation: openSourceContributions.map(item => item.url), dateModified: homepageModified,
  };
  const faq = {
    "@context": "https://schema.org", "@type": "FAQPage", "@id": siteUrl + "#portfolio-faq",
    mainEntity: questions.map(({ question, answer }) => ({
      "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${attr(description)}" />
    <meta name="author" content="${attr(personalInfo.name)}" />
    <meta name="keywords" content="Software Engineering Portfolio, Portfolio API, Software engineering" />
    ${structuredData(person)}
    ${structuredData(profilePage)}
    ${structuredData(faq)}
    <link rel="canonical" href="${attr(siteUrl)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${attr(siteUrl)}" />
    <meta property="og:title" content="${attr(title)}" />
    <meta property="og:description" content="${attr(description)}" />
    <meta property="og:image" content="favicon.svg" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${attr(title)}" />
    <meta name="twitter:description" content="${attr(description)}" />
    <meta name="twitter:image" content="favicon.svg" />
    <link rel="icon" type="image/svg+xml" href="favicon.svg" />
    <link rel="manifest" href="manifest.json" />
    <script>${themeScript}</script>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body class="a11y-inversion">
    <a class="skip-link" href="#main">Skip to main content</a>
    <p id="a11y-inversion-statement" class="sr-only">
      This portfolio is intentionally rendered as a blank white canvas for sighted visitors while preserving semantic structure, landmarks, headings, links, and controls for screen reader navigation.
    </p>
    <div class="page">
      ${renderProfileHeader()}
      <main id="main" aria-describedby="a11y-inversion-statement">
        ${renderSummary()}
        ${renderExperience()}
        ${renderEducation()}
        ${renderCertifications()}
        ${renderSkills()}
        ${renderOpenSource()}
        ${renderAchievements()}
        ${renderLanguages()}
        <section aria-labelledby="portfolio-faq">
          ${sectionHeading("portfolio-faq", "Frequently asked questions")}
          ${questions.map(({ question, answer, href, label }) => `<details><summary>${escapeHtml(question)}</summary><p>${escapeHtml(answer)} <a href="${attr(href)}">${escapeHtml(label)}</a></p></details>`).join("\n")}
        </section>
      </main>
      <footer>
        <nav aria-label="Portfolio resources">
          <h2>Software Engineering Portfolio API</h2>
          <a href="/docs">API documentation</a> · <a href="/developers">Developer portal</a> ·
          <a href="/docs/mcp">Portfolio MCP server</a> · <a href="/about">About</a> ·
          <a href="/contact">Contact</a> · <a href="/privacy">Privacy</a>
        </nav>
        <p class="byline">By <a rel="author" href="/about">${escapeHtml(personalInfo.name)}</a>.
          Last updated <time datetime="${homepageModified}">${homepageModified}</time>.</p>
      </footer>
    </div>
  </body>
</html>
`;
}
