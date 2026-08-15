import Link from "next/link";

const endpoints = [
  ["POST", "/api/v1/messages", "Create a simulated SMS"],
  ["GET", "/api/v1/messages/{id}", "Read current lifecycle status"],
  ["GET", "/api/v1/messages/{id}/events", "Read signed lifecycle events"],
  ["POST", "/api/v1/otp/send", "Create a simulated OTP"],
  ["POST", "/api/v1/otp/verify", "Verify a simulated OTP"],
  ["POST", "/api/v1/webhooks/sign", "Generate an HMAC signature"],
];

export default function Docs() {
  return <main className="docs"><Link href="/">← Simulator</Link><div className="eyebrow">DOCUMENTATION</div><h1>API Reference</h1><p>The hosted demo is intentionally stateless. Message IDs are encrypted tokens carrying simulation state, so GET requests work across serverless instances without a database.</p><h2>Endpoints</h2><div className="endpointList">{endpoints.map(([method,path,desc]) => <div className="endpoint" key={path}><code>{method}</code><strong>{path}</strong><span>{desc}</span></div>)}</div><h2>Send an SMS</h2><pre>{`POST /api/v1/messages
Content-Type: application/json

{
  "to": "+224612345678",
  "body": "Your code is 482901",
  "sender_id": "DEMO",
  "simulation": {
    "latency_ms": 700,
    "delivery_delay_ms": 1800,
    "failure_rate": 0.08
  }
}`}</pre><h2>Security model</h2><p>Simulator IDs are encrypted with AES-256-GCM. Webhook signatures use HMAC-SHA256. Set <code>SIMULATOR_SECRET</code> in production and optionally <code>SIMULATOR_API_KEY</code> to protect the API.</p><h2>OpenAPI</h2><p><a href="/api/openapi">Download the live OpenAPI document →</a></p></main>;
}
