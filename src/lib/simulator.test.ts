import { describe, expect, it } from "vitest";
import { currentSmsStatus, generateOtp, seal, smsEvents, unseal, type SmsPayload } from "./simulator";

describe("simulator", () => {
  it("seals and unseals payloads", () => {
    const token = seal({ hello: "world" }, "test");
    expect(unseal<{ hello: string }>(token, "test")).toEqual({ hello: "world" });
  });

  it("derives message lifecycle from time", () => {
    const payload: SmsPayload = { v: 1, type: "sms", createdAt: 1000, to: "+224612345678", body: "hello", senderId: "DEMO", latencyMs: 500, deliveryDelayMs: 1000, finalStatus: "delivered" };
    expect(currentSmsStatus(payload, 1200)).toBe("queued");
    expect(currentSmsStatus(payload, 1600)).toBe("sent");
    expect(currentSmsStatus(payload, 2600)).toBe("delivered");
    expect(smsEvents(payload, 2600)).toHaveLength(3);
  });

  it("generates numeric OTPs", () => {
    expect(generateOtp(6)).toMatch(/^\d{6}$/);
  });
});
