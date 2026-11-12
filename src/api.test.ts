import { afterEach, expect, setSystemTime, test } from "bun:test";
import type { DurableObjectState } from "@cloudflare/workers-types";
import { handleApi, type Env } from "./api.ts";
import { ApiQuota } from "./quota.ts";

afterEach(() => setSystemTime());

test("API dependency failures return retryable problem documents for GET and bodyless HEAD", async () => {
  const quota = { idFromName() { throw new Error("dependency failed"); } };
  const env = { API_QUOTA: quota } as unknown as Env;
  for (const method of ["GET", "HEAD"]) {
    const response = await handleApi(new Request("https://example.test/api/v1/portfolio", { method }), env);
    expect(response.status).toBe(503);
    expect(response.headers.get("Retry-After")).toBe("60");
    expect(response.headers.get("Content-Type")).toStartWith("application/problem+json");
    if (method === "GET") expect(await response.json()).toMatchObject({ status: 503, code: "temporarily_unavailable", hint: expect.any(String) });
    else expect(await response.text()).toBe("");
  }
});

test("a sandbox quota resets at the window boundary and a delayed alarm preserves the new window", async () => {
  const values = new Map();
  let alarmTime = 0;
  const tx = {
    get: (key: string) => structuredClone(values.get(key)),
    put: (key: string, value: unknown) => values.set(key, structuredClone(value)),
    delete: (key: string) => values.delete(key),
    setAlarm: (time: number) => { alarmTime = time; },
  };
  const state = { storage: { transaction: (fn: (store: typeof tx) => unknown) => fn(tx) } };
  const object = new ApiQuota(state as unknown as DurableObjectState);
  const request = new Request("https://quota.internal/sandbox");
  const next = async () => (await object.fetch(request)).json();
  setSystemTime(10000);
  for (let remaining = 4; remaining >= 0; remaining--) expect(await next()).toEqual({ allowed: true, remaining, reset: 50 });
  expect(await next()).toEqual({ allowed: false, remaining: 0, reset: 50 });
  expect(alarmTime).toBe(60000);
  setSystemTime(60001);
  expect(await next()).toEqual({ allowed: true, remaining: 4, reset: 60 });
  await object.alarm();
  expect(await next()).toMatchObject({ remaining: 3 });
  setSystemTime(120000);
  await object.alarm();
  expect(values.size).toBe(0);
});
