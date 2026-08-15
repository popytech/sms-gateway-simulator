import { errorResponse, json, requireApiKey } from "@/lib/api";
import { smsEvents, unseal, webhookSignature, type SmsPayload } from "@/lib/simulator";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireApiKey(request);
  if (denied) return denied;
  try {
    const { id } = await params;
    const payload = unseal<SmsPayload>(id, "sms");
    const events = smsEvents(payload).map((event) => {
      const body = { id, ...event };
      return { ...body, signature: webhookSignature(body) };
    });
    return json({ id, events });
  } catch (error) {
    return errorResponse(error);
  }
}
