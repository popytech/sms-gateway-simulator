import { z } from "zod";
import { errorResponse, json, phoneSchema, requireApiKey } from "@/lib/api";
import { maskPhone, webhookSignature } from "@/lib/simulator";

const schema = z.object({
  from: phoneSchema,
  to: z.string().min(1).max(20).default("DEMO"),
  body: z.string().min(1).max(1000),
  provider: z.enum(["generic", "orange", "mtn", "moov"]).default("generic"),
  metadata: z.record(z.string(), z.string()).optional(),
});

export async function POST(request: Request) {
  const denied = requireApiKey(request);
  if (denied) return denied;

  try {
    const input = schema.parse(await request.json());
    const event = {
      id: `in_${crypto.randomUUID()}`,
      type: "message.received",
      from: maskPhone(input.from),
      to: input.to,
      body: input.body,
      provider: input.provider,
      metadata: input.metadata ?? {},
      received_at: new Date().toISOString(),
    };

    return json({
      event,
      signature: webhookSignature(event),
      signature_header: "x-simulator-signature",
    }, 202);
  } catch (error) {
    return errorResponse(error);
  }
}
