const form = document.querySelector("#sandbox-form");
const result = document.querySelector("#sandbox-result");

form.addEventListener("submit", async event => {
  event.preventDefault();
  const url = new URL(form.action);
  const section = new FormData(form).get("section").trim();
  if (section) url.searchParams.set("section", section);
  result.textContent = "Loading…";
  const button = form.querySelector("button");
  button.disabled = true;
  try {
    const response = await fetch(url);
    const rate = response.headers.get("ratelimit");
    const retry = response.headers.get("retry-after");
    result.textContent = [
      "HTTP " + response.status,
      rate && "RateLimit: " + rate,
      retry && "Retry-After: " + retry,
      JSON.stringify(await response.json(), null, 2),
    ].filter(Boolean).join("\n");
  } catch {
    result.textContent = "Could not read the API response. Try again.";
  } finally {
    button.disabled = false;
  }
});
