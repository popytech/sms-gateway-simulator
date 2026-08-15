import { z } from "zod";
import { errorResponse, json, phoneSchema, requireApiKey } from "@/lib/api";
import { generateOtp, maskPhone, seal, type OtpPayload } from "@/lib/simulator";

const schema = z.object({
  to: phoneSchema,
  ttl_seconds: z.number().int().min(30).max(900).default(300),
  length: z.number().int().min(4).max(8).default(6),
});

export async function POST(request: Request) {
  const denied = requireApiKey(request);
  if (denied) return denied;
  try {
    const input = schema.parse(await request.json());
    const createdAt = Date.now();
    const code = generateOtp(input.length);
    const payload: OtpPayload = {
      v: 1,
      type: "otp",
      createdAt,
      to: input.to,
      code,
      expiresAt: createdAt + input.ttl_seconds * 1000,
    };
    const id = seal(payload, "otp");
    return json({
      id,
      status: "pending",
      to: maskPhone(input.to),
      expires_at: new Date(payload.expiresAt).toISOString(),
      debug: process.env.SIMULATOR_EXPOSE_OTP === "false" ? undefined : { code },
    }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
