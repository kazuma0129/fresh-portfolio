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
} from "./profile";

const siteUrl = "https://kazuma0129.work/";
const title = "Kazuma Ohashi - Software Engineer | CV";
const description =
  "Kazuma Ohashi - Software Engineer with 4+ years of experience in frontend and backend development, specializing in JavaScript, TypeScript, and Node.js. Currently at LINE Corporation, Tokyo, Japan.";

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
      <img class="profile-mark" src="favicon.svg" width="96" height="96" alt="" />
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
            ${externalLink(item.url, item.title)}
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
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${attr(description)}" />
    <meta name="author" content="${attr(personalInfo.name)}" />
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
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to main content</a>
    <div class="page">
      ${renderProfileHeader()}
      <main id="main">
        ${renderSummary()}
        ${renderExperience()}
        ${renderEducation()}
        ${renderCertifications()}
        ${renderSkills()}
        ${renderOpenSource()}
        ${renderAchievements()}
        ${renderLanguages()}
      </main>
      <footer>
        <p>Last updated at build time.</p>
      </footer>
    </div>
  </body>
</html>
`;
}
