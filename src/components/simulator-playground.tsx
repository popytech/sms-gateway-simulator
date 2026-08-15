"use client";

import { useEffect, useState } from "react";

type MessageResult = { id: string; status: string; to: string; sender_id: string; simulation?: { final_status: string } };
type OtpResult = { id: string; status: string; to: string; debug?: { code: string } };

export function SimulatorPlayground() {
  const [phone, setPhone] = useState("+224612345678");
  const [body, setBody] = useState("Your verification code is 482901");
  const [message, setMessage] = useState<MessageResult | null>(null);
  const [otp, setOtp] = useState<OtpResult | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [verifyStatus, setVerifyStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function sendSms(force?: "delivered" | "failed") {
    setBusy(true);
    const res = await fetch("/api/v1/messages", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ to: phone, body, sender_id: "DEMO", simulation: { latency_ms: 700, delivery_delay_ms: 1800, failure_rate: 0.08, final_status: force } }) });
    setMessage(await res.json());
    setBusy(false);
  }

  useEffect(() => {
    if (!message?.id || ["delivered", "failed"].includes(message.status)) return;
    const timer = setInterval(async () => {
      const res = await fetch(`/api/v1/messages/${encodeURIComponent(message.id)}`, { cache: "no-store" });
      if (res.ok) setMessage(await res.json());
    }, 700);
    return () => clearInterval(timer);
  }, [message]);

  async function sendOtp() {
    setVerifyStatus("");
    const res = await fetch("/api/v1/otp/send", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ to: phone, ttl_seconds: 300, length: 6 }) });
    const data = await res.json();
    setOtp(data);
    if (data.debug?.code) setOtpCode(data.debug.code);
  }

  async function verifyOtp() {
    if (!otp?.id) return;
    const res = await fetch("/api/v1/otp/verify", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: otp.id, code: otpCode }) });
    const data = await res.json();
    setVerifyStatus(data.verified ? "Verified ✓" : data.status ?? "Invalid");
  }

  return (
    <div className="playground">
      <div className="panel">
        <div className="eyebrow">SMS lifecycle</div>
        <label>Destination</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        <label>Message</label>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} />
        <div className="actions">
          <button onClick={() => sendSms()} disabled={busy}>Simulate SMS</button>
          <button className="secondary" onClick={() => sendSms("failed")} disabled={busy}>Force failure</button>
        </div>
        {message && <div className="result"><span className={`status ${message.status}`}>{message.status}</span><code>{message.id.slice(0, 48)}…</code><small>Polling the stateless status endpoint automatically.</small></div>}
      </div>
      <div className="panel">
        <div className="eyebrow">OTP verification</div>
        <p>Generate an OTP, then verify it against an encrypted, self-contained simulator token.</p>
        <button onClick={sendOtp}>Generate OTP</button>
        {otp && <div className="result"><div>Demo code: <strong>{otp.debug?.code ?? "hidden"}</strong></div><input value={otpCode} onChange={(e) => setOtpCode(e.target.value)} placeholder="OTP code" /><button className="secondary" onClick={verifyOtp}>Verify OTP</button>{verifyStatus && <strong>{verifyStatus}</strong>}</div>}
      </div>
    </div>
  );
}
