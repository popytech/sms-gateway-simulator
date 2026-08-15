import { errorResponse, json, requireApiKey } from "@/lib/api";
import { webhookSignature } from "@/lib/simulator";

export async function POST(request: Request) {
  const denied = requireApiKey(request);
  if (denied) return denied;
  try {
    const payload = await request.json();
    return json({ algorithm: "HMAC-SHA256", signature: webhookSignature(payload), payload });
  } catch (error) {
    return errorResponse(error);
  }
}
