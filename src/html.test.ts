import { describe, expect, test } from "bun:test";
import { escapeHtml, renderDocument } from "./html";

describe("HTML generation", () => {
  test("escapes generated text", () => {
    const sample = `<${"script"}>"x" & 'y'</${"script"}>`;
    expect(escapeHtml(sample)).toBe(
      `&lt;${"script"}&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/${"script"}&gt;`,
    );
  });

  test("contains expected landmarks and resume sections", () => {
    const html = renderDocument();

    expect(html).toContain("<main id=\"main\">");
    expect(html).toContain("<footer>");
    expect(html).toContain("<address>");
    expect(html).toContain("Professional Summary");
    expect(html).toContain("Work Experience");
    expect(html).toContain("Education");
    expect(html).toContain("Certifications");
    expect(html).toContain("Technical Skills");
    expect(html).toContain("Open Source Contributions");
    expect(html).toContain("Achievements &amp; Speaking");
    expect(html).toContain("Languages");
  });

  test("has no external CDN script or stylesheet references", () => {
    const html = renderDocument();

    expect(html).not.toMatch(/cdn/i);
    expect(html.toLowerCase()).not.toContain(`<${"script"}`);
    expect(html).not.toMatch(/<link[^>]+href=["']https?:\/\//i);
  });

  test("includes local stylesheet and metadata references", () => {
    const html = renderDocument();

    expect(html).toContain('<link rel="stylesheet" href="styles.css" />');
    expect(html).toContain('<link rel="icon" type="image/svg+xml" href="favicon.svg" />');
    expect(html).toContain('<link rel="manifest" href="manifest.json" />');
    expect(html).toContain('<meta name="description"');
    expect(html).toContain('<meta property="og:title"');
    expect(html).toContain('<meta name="twitter:card"');
  });
});
