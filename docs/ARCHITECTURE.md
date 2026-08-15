# Architecture

The simulator is intentionally stateless so it behaves predictably on local Node.js, Docker and serverless platforms.

## Core idea

Instead of persisting every fake SMS or OTP in a database, the API encrypts simulation state into the returned ID using AES-256-GCM.

For SMS, the encrypted payload contains:

- creation timestamp;
- destination and body;
- sender ID;
- queued-to-sent latency;
- sent-to-final-status delay;
- preselected final outcome.

`GET /api/v1/messages/{id}` decrypts the ID and derives the current status from wall-clock time. No background worker or timer is required.

OTP IDs use the same model with the generated code and expiry timestamp encrypted inside the token.

## Why this is useful

- no database is required;
- no background queue is required;
- serverless cold starts do not lose simulation state;
- a single secret rotation invalidates previous simulator IDs;
- tests can force deterministic final states.

This pattern is suitable for a simulator. It should not be copied blindly into real SMS infrastructure where auditable persistence and provider receipts are required.
