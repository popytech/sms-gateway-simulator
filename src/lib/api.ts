import { NextResponse } from "next/server";
import { z } from "zod";

export const phoneSchema = z.string().regex(/^\+[1-9]\d{7,14}$/, "Use E.164 format, e.g. +224612345678");

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "cache-control": "no-store",
      "x-simulator": "sms-gateway-simulator",
    },
  });
}

export function errorResponse(error: unknown) {
  if (error instanceof z.ZodError) {
    return json({ error: "validation_error", details: z.flattenError(error) }, 400);
  }
  const message = error instanceof Error ? error.message : "Unknown error";
  if (message.toLowerCase().includes("invalid token") || message.toLowerCase().includes("unable to authenticate")) {
    return json({ error: "invalid_id", message: "The simulator ID is invalid or was created with another secret." }, 404);
  }
  return json({ error: "simulator_error", message }, 500);
}

export function requireApiKey(request: Request) {
  const expected = process.env.SIMULATOR_API_KEY;
  if (!expected) return null;
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${expected}`) return json({ error: "unauthorized" }, 401);
  return null;
}
