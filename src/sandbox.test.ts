import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import { parseHTML } from "linkedom";
import { renderPage } from "./pages.ts";

test("the developer sandbox submits the selected filter and renders the response as text", async () => {
  const { document } = parseHTML(renderPage("/developers"));
  const form = document.querySelector("form")!;
  const input = document.querySelector("input")!;
  const button = document.querySelector("button")!;
  const result = document.querySelector("#sandbox-result")!;
  const origin = "https://kazuma0129.work";
  Object.defineProperty(form, "action", { value: new URL(form.getAttribute("action")!, origin).href });
  let submit!: (event: { preventDefault(): void }) => Promise<void>;
  form.addEventListener = (_type: string, handler: any) => { submit = handler; };
  const urls: string[] = [];
  const source = await readFile(new URL("../static/sandbox.js", import.meta.url), "utf8");
  runInNewContext(source, {
    document, URL, FormData: class { get() { return input.value; } },
    fetch: async (url: URL) => {
      urls.push(url.href);
      if (urls.length === 3) throw new Error("offline");
      return Response.json({ example: "<b>text</b>" }, { status: 429, headers: { RateLimit: '"sandbox";r=0;t=4', "Retry-After": "4" } });
    },
  });
  await submit({ preventDefault() {} });
  expect(urls[0]).toBe(origin + "/api/sandbox/v1/portfolio?section=experience-heading");
  expect(result.textContent).toContain("HTTP 429");
  expect(result.textContent).toContain("Retry-After: 4");
  expect(result.querySelector("b")).toBeNull();
  input.value = "";
  await submit({ preventDefault() {} });
  expect(urls[1]).toBe(origin + "/api/sandbox/v1/portfolio");
  await submit({ preventDefault() {} });
  expect(result.textContent).toContain("Could not read");
  expect(button.disabled).toBe(false);
});
