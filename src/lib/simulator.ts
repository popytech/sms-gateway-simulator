import crypto from "node:crypto";

export type SmsFinalStatus = "delivered" | "failed";
export type SmsStatus = "queued" | "sent" | SmsFinalStatus;

export interface SmsPayload {
  v: 1;
  type: "sms";
  createdAt: number;
  to: string;
  body: string;
  senderId: string;
  latencyMs: number;
  deliveryDelayMs: number;
  finalStatus: SmsFinalStatus;
  failureCode?: string;
  metadata?: Record<string, string>;
}

export interface OtpPayload {
  v: 1;
  type: "otp";
  createdAt: number;
  to: string;
  code: string;
  expiresAt: number;
}

function getSecret() {
  const configured = process.env.SIMULATOR_SECRET;
  if (configured && configured.length >= 16) return configured;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SIMULATOR_SECRET must be configured in production");
  }
  return "dev-only-sms-gateway-simulator-secret";
}

function key() {
  return crypto.createHash("sha256").update(getSecret()).digest();
}

export function seal<T extends object>(payload: T, prefix: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key(), iv);
  const plain = Buffer.from(JSON.stringify(payload), "utf8");
  const encrypted = Buffer.concat([cipher.update(plain), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${prefix}_${Buffer.concat([iv, tag, encrypted]).toString("base64url")}`;
}

export function unseal<T>(token: string, prefix: string): T {
  if (!token.startsWith(`${prefix}_`)) throw new Error("Invalid token prefix");
  const data = Buffer.from(token.slice(prefix.length + 1), "base64url");
  if (data.length < 29) throw new Error("Invalid token");
  const iv = data.subarray(0, 12);
  const tag = data.subarray(12, 28);
  const encrypted = data.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key(), iv);
  decipher.setAuthTag(tag);
  const plain = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return JSON.parse(plain.toString("utf8")) as T;
}

export function currentSmsStatus(payload: SmsPayload, now = Date.now()): SmsStatus {
  const elapsed = Math.max(0, now - payload.createdAt);
  if (elapsed < payload.latencyMs) return "queued";
  if (elapsed < payload.latencyMs + payload.deliveryDelayMs) return "sent";
  return payload.finalStatus;
}

export function smsEvents(payload: SmsPayload, now = Date.now()) {
  const events = [
    { type: "message.queued", status: "queued", at: new Date(payload.createdAt).toISOString() },
  ];
  if (now >= payload.createdAt + payload.latencyMs) {
    events.push({
      type: "message.sent",
      status: "sent",
      at: new Date(payload.createdAt + payload.latencyMs).toISOString(),
    });
  }
  if (now >= payload.createdAt + payload.latencyMs + payload.deliveryDelayMs) {
    events.push({
      type: payload.finalStatus === "delivered" ? "message.delivered" : "message.failed",
      status: payload.finalStatus,
      at: new Date(payload.createdAt + payload.latencyMs + payload.deliveryDelayMs).toISOString(),
    });
  }
  return events;
}

export function chooseFinalStatus(failureRate: number, forced?: SmsFinalStatus): SmsFinalStatus {
  if (forced) return forced;
  return crypto.randomInt(0, 10_000) < Math.round(failureRate * 10_000) ? "failed" : "delivered";
}

export function generateOtp(length = 6) {
  const min = 10 ** (length - 1);
  const max = 10 ** length;
  return String(crypto.randomInt(min, max));
}

export function webhookSignature(payload: unknown) {
  const secret = process.env.SIMULATOR_WEBHOOK_SECRET || getSecret();
  return `sha256=${crypto.createHmac("sha256", secret).update(JSON.stringify(payload)).digest("hex")}`;
}

export function maskPhone(phone: string) {
  return phone.length <= 6 ? phone : `${phone.slice(0, 4)}•••${phone.slice(-3)}`;
}
