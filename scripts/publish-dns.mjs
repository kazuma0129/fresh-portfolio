import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const record = JSON.parse(await readFile(new URL("../dns/index.svcb.json", import.meta.url), "utf8"));
const zone = "kazuma0129.work";
assert.equal(record.name, "_index._agents." + zone);
assert.equal(record.type, "SVCB");
assert.equal(record.data.target, zone + ".");
const token = process.env.CLOUDFLARE_DNS_API_TOKEN;
assert.ok(token, "A Cloudflare token with Zone:Read and DNS:Edit on the portfolio zone is required.");
const signal = () => AbortSignal.timeout(15000);
const catalog = await fetch("https://" + zone + "/.well-known/ai-catalog.json", {signal: signal()});
assert.ok(catalog.ok && (await catalog.json()).entries?.length, "Publish the catalog first.");
const doh = await fetch("https://cloudflare-dns.com/dns-query?name=" + zone + "&type=SOA&do=true", { headers: { accept: "application/dns-json" }, signal: signal() });
const answer = await doh.json();
assert.ok(doh.ok && answer.AD && answer.Status === 0 && answer.Answer?.some(rr => rr.type === 6), "DNSSEC validation failed");
async function api(path, method = "GET", body) {
  const res = await fetch("https://api.cloudflare.com/client/v4" + path, { method,
    headers: { authorization: "Bearer " + token, "content-type": "application/json" },
    body: body && JSON.stringify(body), signal: signal() });
  const result = await res.json();
  if (!res.ok || !result.success) throw new Error("Cloudflare " + method + ": " + res.status + " " + JSON.stringify(result.errors));
  return result.result;
}
const zones = await api("/zones?name=" + zone + "&status=active");
assert.equal(zones.length, 1, "Expected exactly one accessible active portfolio zone");
const endpoint = "/zones/" + zones[0].id + "/dns_records";
const current = await api(endpoint + "?name=" + record.name);
if (current.length) {
  const normalize = v => v.replaceAll('"', "").split(/\s+/).sort().join(" ");
  assert.ok(current.length === 1 && current[0].type === record.type &&
    current[0].data.priority === 1 && current[0].data.target.replace(/\.$/, "") === zone &&
    normalize(current[0].data.value) === normalize(record.data.value), "Existing record differs; left untouched.");
  console.log("DNS-AID index already configured.");
} else {
  await api(endpoint, "POST", record);
  console.log("Created the portfolio DNS-AID index.");
}
