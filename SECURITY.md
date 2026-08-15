# Security

This repository is a simulator, not a real telecom gateway.

## Production demo requirements

- Set a unique `SIMULATOR_SECRET` with at least 32 random characters.
- Optionally set `SIMULATOR_API_KEY` to protect public API access.
- Set `SIMULATOR_EXPOSE_OTP=false` if the hosted instance should not reveal generated OTP codes.
- Rotate `SIMULATOR_SECRET` to invalidate all previously issued simulator IDs.
- Never reuse this simulator secret as a production telecom, payment, JWT or application secret.

## Design

Message and OTP state is encrypted into opaque IDs using AES-256-GCM. No telecom credentials or real provider integrations are included. Webhook signatures use HMAC-SHA256.

Report vulnerabilities privately to the repository owner rather than opening a public issue with exploit details.
