import type { DurableObjectNamespace, DurableObjectState } from "@cloudflare/workers-types";

export const windowSeconds = 60;
export const limits = { public: 120, sandbox: 5 } as const;
export type Policy = keyof typeof limits;
interface Window { used: number; end: number }
interface Budget { allowed: boolean; remaining: number; reset: number }

// Cloudflare routes all simultaneous requests for the same bucket to one object.
// Only the counter and the end of the window are stored. Its alarm clears both.
export class ApiQuota {
  constructor(private readonly state: DurableObjectState) {}

  async fetch(request: Request): Promise<Response> {
    const policy = new URL(request.url).pathname === "/sandbox" ? "sandbox" : "public";
    const capacity = limits[policy];
    const budget = await this.state.storage.transaction(async tx => {
      const now = Date.now();
      let window = await tx.get<Window>("window");
      if (!window || window.end <= now) {
        window = { used: 0, end: (Math.floor(now / (windowSeconds * 1000)) + 1) * windowSeconds * 1000 };
        await tx.setAlarm(window.end);
      }
      const allowed = window.used < capacity;
      if (allowed) {
        window.used++;
        await tx.put("window", window);
      }
      return { allowed, remaining: capacity - window.used, reset: Math.ceil((window.end - now) / 1000) };
    });
    return Response.json(budget);
  }

  async alarm() {
    await this.state.storage.transaction(async tx => {
      const window = await tx.get<Window>("window");
      if (window && window.end <= Date.now()) await tx.delete("window");
    });
  }
}

export async function consume(namespace: DurableObjectNamespace, request: Request, policy: Policy) {
  // CF-Connecting-IP is set by the edge. Local previews share a single bucket.
  const client = request.headers.get("cf-connecting-ip") || "local";
  const id = namespace.idFromName(policy + "/" + client);
  const result = await namespace.get(id).fetch("https://quota.internal/" + policy);
  if (!result.ok) throw new Error("API quota unavailable");
  const budget: Budget = await result.json();
  const headers = new Headers({
    "RateLimit-Policy": `"${policy}";q=${limits[policy]};w=${windowSeconds}`,
    RateLimit: `"${policy}";r=${budget.remaining};t=${budget.reset}`,
    "Cache-Control": "no-store",
  });
  return { ...budget, headers };
}
