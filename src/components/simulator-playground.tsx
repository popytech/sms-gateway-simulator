"use client";

import { useEffect, useState } from "react";

type MessageResult = { id?: string; status?: string; to?: string; sender_id?: string; simulation?: { final_status?: string }; error?: string; message?: string };
type OtpResult = { id?: string; status?: string; to?: string; debug?: { code?: string }; error?: string };
type ProviderResult = { providers?: Array<{ id?: string; name?: string; failure_codes?: Array<{ code?: string; message?: string }> }>; note?: string; error?: string };
type BatchResult = { total?: number; accepted?: number; rejected?: number; items?: Array<Record<string, unknown>>; error?: string };
type InboundResult = { event?: Record<string, unknown>; signature?: string; signature_header?: string; error?: string };
type EventsResult = { events?: Array<Record<string, unknown>>; signature?: string; error?: string };

async function readJson<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}

export function SimulatorPlayground() {
  const [phone, setPhone] = useState("+224612345678");
  const [body, setBody] = useState("Your verification code is 482901");
  const [provider, setProvider] = useState("generic");
  const [message, setMessage] = useState<MessageResult | null>(null);
  const [events, setEvents] = useState<EventsResult | null>(null);
  const [otp, setOtp] = useState<OtpResult | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [verifyStatus, setVerifyStatus] = useState("");
  const [providers, setProviders] = useState<ProviderResult | null>(null);
  const [batch, setBatch] = useState<BatchResult | null>(null);
  const [inbound, setInbound] = useState<InboundResult | null>(null);
  const [busy, setBusy] = useState(false);

  async function sendSms(force?: "delivered" | "failed", rateLimit = false) {
    setBusy(true);
    setEvents(null);
    const response = await fetch("/api/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        to: phone,
        body,
        sender_id: "DEMO",
        provider,
        simulation: {
          latency_ms: 700,
          delivery_delay_ms: 1800,
          failure_rate: 0.08,
          final_status: force,
          rate_limit: rateLimit,
        },
      }),
    });
    setMessage(await readJson<MessageResult>(response));
    setBusy(false);
  }

  useEffect(() => {
    if (!message?.id || ["delivered", "failed"].includes(message.status ?? "")) return;
    const timer = setInterval(async () => {
      const response = await fetch(`/api/v1/messages/${encodeURIComponent(message.id ?? "")}`, { cache: "no-store" });
      if (response.ok) setMessage(await readJson<MessageResult>(response));
    }, 700);
    return () => clearInterval(timer);
  }, [message]);

  async function inspectEvents() {
    if (!message?.id) return;
    const response = await fetch(`/api/v1/messages/${encodeURIComponent(message.id)}/events`, { cache: "no-store" });
    setEvents(await readJson<EventsResult>(response));
  }

  async function sendOtp() {
    setVerifyStatus("");
    const response = await fetch("/api/v1/otp/send", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ to: phone, ttl_seconds: 300, length: 6 }),
    });
    const data = await readJson<OtpResult>(response);
    setOtp(data);
    if (data.debug?.code) setOtpCode(data.debug.code);
  }

  async function verifyOtp() {
    if (!otp?.id) return;
    const response = await fetch("/api/v1/otp/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: otp.id, code: otpCode }),
    });
    const data = await readJson<{ verified?: boolean; status?: string }>(response);
    setVerifyStatus(data.verified ? "Verified ✓" : data.status ?? "Invalid");
  }

  async function loadProviders() {
    const response = await fetch("/api/v1/providers", { cache: "no-store" });
    setProviders(await readJson<ProviderResult>(response));
  }

  async function sendBatch() {
    const response = await fetch("/api/v1/messages/batch", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        messages: [
          { to: phone, body: "Batch message A", sender_id: "DEMO", provider },
          { to: phone, body: "Batch message B", sender_id: "DEMO", provider, simulation: { final_status: "failed" } },
          { to: phone, body: "Batch message C", sender_id: "DEMO", provider },
        ],
      }),
    });
    setBatch(await readJson<BatchResult>(response));
  }

  async function simulateInbound() {
    const response = await fetch("/api/v1/inbound", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ from: phone, to: "DEMO", body: "Reply YES to continue", provider }),
    });
    setInbound(await readJson<InboundResult>(response));
  }

  return (
    <div className="playgroundStack">
      <div className="playground">
        <div className="panel">
          <div className="eyebrow">SMS lifecycle</div>
          <label>Destination</label>
          <input value={phone} onChange={(event) => setPhone(event.target.value)} />
          <label>Provider profile</label>
          <select value={provider} onChange={(event) => setProvider(event.target.value)}>
            <option value="generic">Generic</option>
            <option value="orange">Orange-style</option>
            <option value="mtn">MTN-style</option>
            <option value="moov">Moov-style</option>
          </select>
          <label>Message</label>
          <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={4} />
          <div className="actions">
            <button onClick={() => sendSms()} disabled={busy}>Simulate SMS</button>
            <button className="secondary" onClick={() => sendSms("failed")} disabled={busy}>Force failure</button>
            <button className="secondary" onClick={() => sendSms(undefined, true)} disabled={busy}>Simulate 429</button>
          </div>
          {message && (
            <div className="result">
              <span className={`status ${message.status ?? ""}`}>{message.status ?? message.error ?? "response"}</span>
              {message.id ? <code>{message.id.slice(0, 56)}…</code> : null}
              {message.message ? <small>{message.message}</small> : null}
              {message.id ? <button className="secondary" onClick={inspectEvents}>Inspect signed events</button> : null}
              {events ? <pre>{JSON.stringify(events, null, 2)}</pre> : null}
            </div>
          )}
        </div>

        <div className="panel">
          <div className="eyebrow">OTP verification</div>
          <p>Generate an OTP, then verify it against an encrypted, self-contained simulator token.</p>
          <button onClick={sendOtp}>Generate OTP</button>
          {otp && (
            <div className="result">
              <div>Demo code: <strong>{otp.debug?.code ?? "hidden"}</strong></div>
              <input value={otpCode} onChange={(event) => setOtpCode(event.target.value)} placeholder="OTP code" />
              <button className="secondary" onClick={verifyOtp}>Verify OTP</button>
              {verifyStatus ? <strong>{verifyStatus}</strong> : null}
            </div>
          )}
        </div>
      </div>

      <div className="playground gridThree">
        <div className="panel">
          <div className="eyebrow">Provider catalog</div>
          <p>Inspect simulator-only provider profiles and failure codes.</p>
          <button onClick={loadProviders}>Load profiles</button>
          {providers ? <pre>{JSON.stringify(providers, null, 2)}</pre> : null}
        </div>

        <div className="panel">
          <div className="eyebrow">Batch messaging</div>
          <p>Submit three messages at once and inspect accepted/rejected outcomes.</p>
          <button onClick={sendBatch}>Run batch simulation</button>
          {batch ? <pre>{JSON.stringify(batch, null, 2)}</pre> : null}
        </div>

        <div className="panel">
          <div className="eyebrow">Inbound SMS</div>
          <p>Generate a signed inbound message event for webhook testing.</p>
          <button onClick={simulateInbound}>Simulate inbound SMS</button>
          {inbound ? <pre>{JSON.stringify(inbound, null, 2)}</pre> : null}
        </div>
      </div>
    </div>
  );
}
