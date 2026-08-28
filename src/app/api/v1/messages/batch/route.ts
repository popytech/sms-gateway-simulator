import { z } from "zod";
import { errorResponse, json, requireApiKey } from "@/lib/api";
import { buildMessage, messageSchema } from "../route";

const batchSchema = z.object({
  messages: z.array(messageSchema).min(1).max(100),
});

export async function POST(request: Request) {
  const denied = requireApiKey(request);
  if (denied) return denied;

  try {
    const input = batchSchema.parse(await request.json());
    const items = input.messages.map((message, index) => {
      const result = buildMessage(message);
      if (result.rateLimited) {
        return {
          index,
          accepted: false,
          error: "rate_limited",
          retry_after_seconds: result.retryAfterSeconds,
        };
      }
      return { index, accepted: true, ...result.response };
    });

    return json({
      total: items.length,
      accepted: items.filter((item) => item.accepted).length,
      rejected: items.filter((item) => !item.accepted).length,
      items,
    }, 207);
  } catch (error) {
    return errorResponse(error);
  }
}
