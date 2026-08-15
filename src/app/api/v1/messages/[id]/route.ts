import { errorResponse, json, requireApiKey } from "@/lib/api";
import { currentSmsStatus, maskPhone, unseal, type SmsPayload } from "@/lib/simulator";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireApiKey(request);
  if (denied) return denied;
  try {
    const { id } = await params;
    const payload = unseal<SmsPayload>(id, "sms");
    const status = currentSmsStatus(payload);
    return json({
      id,
      status,
      to: maskPhone(payload.to),
      body: payload.body,
      sender_id: payload.senderId,
      failure_code: status === "failed" ? payload.failureCode : null,
      metadata: payload.metadata ?? {},
      created_at: new Date(payload.createdAt).toISOString(),
      updated_at: new Date(Math.min(Date.now(), payload.createdAt + payload.latencyMs + payload.deliveryDelayMs)).toISOString(),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
