import { describe, expect, it } from "vitest";
import { decryptSecret, encryptSecret } from "@/server/crypto";

describe("secret encryption", () => {
  it("round-trips and detects tampering", () => {
    const c = encryptSecret("abcd efgh");
    expect(decryptSecret(c)).toBe("abcd efgh");
    const [iv, tag, enc] = c.split(".");
    expect(() => decryptSecret([iv, tag, Buffer.from("x").toString("base64") + enc].join("."))).toThrow();
  });
});
