import { z } from "zod";
import { errorResponse, json, requireApiKey } from "@/lib/api";
import { unseal, type OtpPayload } from "@/lib/simulator";

const schema = z.object({ id: z.string().min(20), code: z.string().min(4).max(8) });

export async function POST(request: Request) {
  const denied = requireApiKey(request);
  if (denied) return denied;
  try {
    const input = schema.parse(await request.json());
    const payload = unseal<OtpPayload>(input.id, "otp");
    if (Date.now() > payload.expiresAt) return json({ id: input.id, status: "expired", verified: false }, 410);
    const verified = input.code === payload.code;
    return json({ id: input.id, status: verified ? "verified" : "invalid", verified }, verified ? 200 : 400);
  } catch (error) {
    return errorResponse(error);
  }
}
