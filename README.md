<div align="center">
<img src="./docs/cover.svg" width="100%" alt="SMS Gateway Simulator" />

# SMS Gateway Simulator

### Test SMS, OTP and webhook integrations without a telecom provider.

**Stateless API · Delivery lifecycle · OTP · Provider failures · Inbound SMS · SMPP fixtures · HMAC webhooks · Docker · CI**

[![CI](https://github.com/popytech/sms-gateway-simulator/actions/workflows/ci.yml/badge.svg)](https://github.com/popytech/sms-gateway-simulator/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-111111?style=for-the-badge)](./LICENSE)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fpopytech%2Fsms-gateway-simulator&env=SIMULATOR_SECRET,SIMULATOR_EXPOSE_OTP&project-name=sms-gateway-simulator&repository-name=sms-gateway-simulator)
</div>

---

## Why this exists

Teams integrating SMS often need provider credentials, live credits and real phone numbers just to test basic application behavior. **SMS Gateway Simulator** provides a safe local/public sandbox for those development flows.

It does **not** send real SMS and contains no operator credentials. Provider names and error codes are simulator profiles only; they are not official operator specifications.

## What it simulates

- SMS acceptance (`queued`)
- provider handoff (`sent`)
- final delivery (`delivered` / `failed`)
- configurable latency and failure rate
- forced delivery/failure scenarios for tests
- simulated provider profiles (`generic`, `orange`, `mtn`, `moov`)
- simulated HTTP `429` rate limits and retry hints
- batch sending for up to 100 messages
- inbound SMS events with HMAC signatures
- OTP generation, expiry and verification
- signed lifecycle/webhook events
- SMPP-like JSON fixtures for integration tests
- optional Bearer API key protection
- E.164 destination validation

## Stateless architecture

The simulator does not require a database. SMS and OTP state is encrypted into opaque IDs with **AES-256-GCM**. Status endpoints decrypt the ID and derive lifecycle state from elapsed time.

This makes the simulator resilient to serverless cold starts and ideal for Vercel, Docker and local CI.

See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).

## Quick start

```bash
git clone https://github.com/popytech/sms-gateway-simulator.git
cd sms-gateway-simulator
npm ci
cp .env.example .env.local
npm run dev
```

Set a local secret:

```env
SIMULATOR_SECRET=a-long-random-development-secret
SIMULATOR_EXPOSE_OTP=true
```

Open `http://localhost:3000`.

## Send an SMS

```bash
curl -X POST http://localhost:3000/api/v1/messages \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+224612345678",
    "body": "Your verification code is 482901",
    "sender_id": "DEMO",
    "provider": "generic"
  }'
```

Then poll:

```bash
curl http://localhost:3000/api/v1/messages/<message_id>
```

The status moves from `queued` → `sent` → `delivered` or `failed` based on the simulation parameters encoded in that ID.

## Force a failure

```json
{
  "to": "+224612345678",
  "body": "Testing failure handling",
  "provider": "mtn",
  "simulation": {
    "latency_ms": 500,
    "delivery_delay_ms": 1000,
    "final_status": "failed"
  }
}
```

## Simulate a rate limit

```json
{
  "to": "+224612345678",
  "body": "Testing retry logic",
  "simulation": {
    "rate_limited": true,
    "retry_after_seconds": 30
  }
}
```

The API responds with HTTP `429` and a simulator retry hint.

## Batch messaging

`POST /api/v1/messages/batch` accepts between 1 and 100 message objects and returns per-message acceptance results.

## Inbound SMS

`POST /api/v1/inbound` creates a simulated `message.received` event and returns its HMAC signature so webhook consumers can be tested without a live operator connection.

## OTP

`POST /api/v1/otp/send`

```json
{
  "to": "+224612345678",
  "ttl_seconds": 300,
  "length": 6
}
```

Then verify with `POST /api/v1/otp/verify` using the returned `id` and code.

## Webhook signatures

Lifecycle events returned by `/api/v1/messages/{id}/events` include an HMAC-SHA256 signature. The signing endpoint is also available at `/api/v1/webhooks/sign`.

## Provider profiles and SMPP fixtures

`GET /api/v1/providers` exposes the simulator-only provider failure catalogs.

`GET /api/v1/smpp/fixtures` returns SMPP-like JSON examples for `submit_sm`, `submit_sm_resp` and delivery receipts. These fixtures model common concepts for application tests; they are not raw binary PDUs.

## API reference

- `GET /api/health`
- `POST /api/v1/messages`
- `POST /api/v1/messages/batch`
- `GET /api/v1/messages/{id}`
- `GET /api/v1/messages/{id}/events`
- `POST /api/v1/inbound`
- `GET /api/v1/providers`
- `GET /api/v1/smpp/fixtures`
- `POST /api/v1/otp/send`
- `POST /api/v1/otp/verify`
- `POST /api/v1/webhooks/sign`
- `GET /api/openapi`

A human-readable docs page is available at `/docs`.

Ready-to-run integration examples are included in [`examples/`](./examples) for Node.js, Python and PHP. A Postman collection is available in [`postman/`](./postman).

## Quality

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

The same pipeline runs with GitHub Actions.

## Deploy

Use the **Deploy with Vercel** button above or import this repository into any Node.js-compatible platform.

Required hosted variable:

```env
SIMULATOR_SECRET=<32+ random characters>
```

Optional demo settings:

```env
SIMULATOR_EXPOSE_OTP=true
SIMULATOR_API_KEY=
SIMULATOR_WEBHOOK_SECRET=
```

For a public playground, leave `SIMULATOR_API_KEY` unset. For a protected sandbox, set it and send `Authorization: Bearer <key>`.

## Docker

```bash
docker compose up --build
```

The Docker build uses Next.js standalone output. Vercel uses the native Next.js output.

## Security

Read [`SECURITY.md`](./SECURITY.md). This is a development simulator, not a production SMS gateway.

## MVP status

- [x] SMS lifecycle simulator
- [x] OTP simulator
- [x] signed webhook events
- [x] provider-specific simulator error catalogs
- [x] rate-limit simulation
- [x] batch messaging endpoint
- [x] inbound SMS simulator
- [x] SMPP-like fixture mode
- [x] SDK examples (Node/Python/PHP)
- [x] Postman collection
- [x] Docker + reproducible CI

## Next iterations

- [ ] raw SMPP PDU codec fixtures
- [ ] configurable persistent event history
- [ ] provider scenario presets UI
- [ ] webhook delivery/retry executor
- [ ] load-test scenarios

## License

MIT.

---

<div align="center">
Built by <strong>Popy Traoré</strong> · Guinea 🇬🇳 → Africa 🌍
</div>
