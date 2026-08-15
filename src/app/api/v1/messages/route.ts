import { z } from "zod";
import { errorResponse, json, phoneSchema, requireApiKey } from "@/lib/api";
import { chooseFinalStatus, currentSmsStatus, maskPhone, seal, type SmsPayload } from "@/lib/simulator";

const schema = z.object({
  to: phoneSchema,
  body: z.string().min(1).max(1000),
  sender_id: z.string().min(1).max(20).default("DEMO"),
  metadata: z.record(z.string(), z.string()).optional(),
  simulation: z.object({
    latency_ms: z.number().int().min(0).max(30_000).default(700),
    delivery_delay_ms: z.number().int().min(0).max(60_000).default(1800),
    failure_rate: z.number().min(0).max(1).default(0.08),
    final_status: z.enum(["delivered", "failed"]).optional(),
  }).optional(),
});

export async function POST(request: Request) {
  const denied = requireApiKey(request);
  if (denied) return denied;
  try {
    const input = schema.parse(await request.json());
    const simulation = input.simulation ?? { latency_ms: 700, delivery_delay_ms: 1800, failure_rate: 0.08 };
    const finalStatus = chooseFinalStatus(simulation.failure_rate, simulation.final_status);
    const payload: SmsPayload = {
      v: 1,
      type: "sms",
      createdAt: Date.now(),
      to: input.to,
      body: input.body,
      senderId: input.sender_id,
      latencyMs: simulation.latency_ms,
      deliveryDelayMs: simulation.delivery_delay_ms,
      finalStatus,
      failureCode: finalStatus === "failed" ? "SIMULATED_PROVIDER_FAILURE" : undefined,
      metadata: input.metadata,
    };
    const id = seal(payload, "sms");
    return json({
      id,
      status: currentSmsStatus(payload),
      to: maskPhone(payload.to),
      sender_id: payload.senderId,
      created_at: new Date(payload.createdAt).toISOString(),
      simulation: {
        latency_ms: payload.latencyMs,
        delivery_delay_ms: payload.deliveryDelayMs,
        final_status: payload.finalStatus,
      },
      links: { self: `/api/v1/messages/${id}`, events: `/api/v1/messages/${id}/events` },
    }, 202);
  } catch (error) {
    return errorResponse(error);
  }
}
