import { json } from "@/lib/api";

export async function GET() {
  return json({ status: "ok", service: "sms-gateway-simulator", version: "1.0.0", stateless: true, timestamp: new Date().toISOString() });
}
