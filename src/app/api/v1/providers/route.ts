import { json, requireApiKey } from "@/lib/api";
import { providerCatalog } from "@/lib/providers";

export async function GET(request: Request) {
  const denied = requireApiKey(request);
  if (denied) return denied;

  return json({
    providers: providerCatalog(),
    note: "These are simulator-only error codes and are not official operator specifications.",
  });
}
