import { drizzle } from "drizzle-orm/postgres-js";
import { describe, expect, it } from "vitest";
import { productionClients } from "@/db";

describe("production database clients", () => {
  it("the transaction pool serialises JSON exactly like the main pool Drizzle configured", () => {
    const { client, txClient } = productionClients("postgres://user:pass@127.0.0.1:1/db");
    drizzle({ client });
    // Drizzle sends JSON as text; postgres.js must not encode it a second time.
    expect(typeof client.options.serializers["3802"]).toBe("function");
    expect(txClient.options.serializers["3802"]).toBe(client.options.serializers["3802"]);
    expect(txClient.options.serializers["114"]).toBe(client.options.serializers["114"]);
    expect(txClient.options.parsers).toBe(client.options.parsers);
    const encoded = client.options.serializers["3802"]('{"a":1}');
    expect(txClient.options.serializers["3802"]('{"a":1}')).toBe(encoded);
    expect(encoded).toBe('{"a":1}');
  });
});

describe("repair of double-encoded JSON (migration 0016)", () => {
  it("decodes JSON stored as a JSON string once, and leaves correct rows alone", async () => {
    const { makeDb, onboard, signUp } = await import("./helpers");
    const { readFileSync } = await import("node:fs");
    const { sql } = await import("drizzle-orm");
    const db = await makeDb();
    const ctx = await signUp(db, "owner@example.com");
    await onboard(db, ctx, "Sharma Plumbing");
    // Simulate what the broken transaction pool wrote: the JSON text as a JSON string.
    await db.execute(sql`update businesses set services = to_jsonb('[{"name":"Leak repair"}]'::text), hours = to_jsonb('[]'::text)`);
    const before = await db.execute(sql`select jsonb_typeof(services) as t from businesses`);
    expect((before.rows as { t: string }[])[0].t).toBe("string");

    await db.execute(sql.raw(readFileSync("drizzle/0016_repair_double_encoded_json.sql", "utf8")));
    const after = await db.execute(sql`select jsonb_typeof(services) as s, jsonb_typeof(hours) as h, services #>> '{0,name}' as first from businesses`);
    expect((after.rows as { s: string; h: string; first: string }[])[0]).toEqual({ s: "array", h: "array", first: "Leak repair" });
    // Running it again changes nothing.
    await db.execute(sql.raw(readFileSync("drizzle/0016_repair_double_encoded_json.sql", "utf8")));
    const again = await db.execute(sql`select services #>> '{0,name}' as first from businesses`);
    expect((again.rows as { first: string }[])[0].first).toBe("Leak repair");
  });
});
