export const openapi = {
  openapi: "3.1.0",
  info: {
    title: "SMS Gateway Simulator API",
    version: "1.0.0",
    description: "A stateless simulator for SMS delivery lifecycles, OTP verification and webhook signatures.",
  },
  servers: [{ url: "/", description: "Current host" }],
  paths: {
    "/api/health": { get: { summary: "Health check", responses: { "200": { description: "Healthy" } } } },
    "/api/v1/messages": {
      post: {
        summary: "Simulate sending an SMS",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["to", "body"], properties: { to: { type: "string", example: "+224612345678" }, body: { type: "string", example: "Your code is 123456" }, sender_id: { type: "string", example: "GNAKRY" }, simulation: { type: "object", properties: { latency_ms: { type: "integer" }, delivery_delay_ms: { type: "integer" }, failure_rate: { type: "number" }, final_status: { enum: ["delivered", "failed"] } } } } } } } },
        responses: { "202": { description: "Simulation accepted" } },
      },
    },
    "/api/v1/messages/{id}": { get: { summary: "Get simulated message status", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Message status" } } } },
    "/api/v1/messages/{id}/events": { get: { summary: "Get signed lifecycle events", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Lifecycle events" } } } },
    "/api/v1/otp/send": { post: { summary: "Create a simulated OTP", responses: { "201": { description: "OTP created" } } } },
    "/api/v1/otp/verify": { post: { summary: "Verify a simulated OTP", responses: { "200": { description: "OTP verified" } } } },
    "/api/v1/webhooks/sign": { post: { summary: "Generate a simulator webhook signature", responses: { "200": { description: "HMAC signature" } } } },
  },
} as const;
