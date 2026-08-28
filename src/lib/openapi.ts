export const openapi = {
  openapi: "3.1.0",
  info: {
    title: "SMS Gateway Simulator API",
    version: "1.1.0",
    description: "A stateless simulator for SMS delivery lifecycles, OTP verification, inbound events and webhook signatures.",
  },
  servers: [{ url: "/", description: "Current host" }],
  paths: {
    "/api/health": { get: { summary: "Health check", responses: { "200": { description: "Healthy" } } } },
    "/api/v1/messages": { post: { summary: "Simulate sending an SMS", responses: { "202": { description: "Simulation accepted" }, "429": { description: "Simulated rate limit" } } } },
    "/api/v1/messages/batch": { post: { summary: "Simulate a batch of SMS messages", responses: { "207": { description: "Per-message results" } } } },
    "/api/v1/messages/{id}": { get: { summary: "Get simulated message status", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Message status" } } } },
    "/api/v1/messages/{id}/events": { get: { summary: "Get signed lifecycle events", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Lifecycle events" } } } },
    "/api/v1/inbound": { post: { summary: "Simulate an inbound SMS event", responses: { "202": { description: "Inbound event created" } } } },
    "/api/v1/providers": { get: { summary: "List simulator provider profiles", responses: { "200": { description: "Provider profiles" } } } },
    "/api/v1/smpp/fixtures": { get: { summary: "Get SMPP-like JSON fixtures", responses: { "200": { description: "Fixture catalog" } } } },
    "/api/v1/otp/send": { post: { summary: "Create a simulated OTP", responses: { "201": { description: "OTP created" } } } },
    "/api/v1/otp/verify": { post: { summary: "Verify a simulated OTP", responses: { "200": { description: "OTP verified" } } } },
    "/api/v1/webhooks/sign": { post: { summary: "Generate a simulator webhook signature", responses: { "200": { description: "HMAC signature" } } } },
  },
} as const;
