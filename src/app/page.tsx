import Link from "next/link";
import { SimulatorPlayground } from "@/components/simulator-playground";

export default function Home() {
  return (
    <main>
      <nav><div className="brand"><span className="dot" /> SMS Gateway Simulator</div><div className="navlinks"><Link href="/docs">Docs</Link><a href="/api/openapi">OpenAPI</a><a href="https://github.com/popytech/sms-gateway-simulator">GitHub</a></div></nav>
      <section className="hero">
        <div className="badge">OPEN SOURCE · STATELESS · SERVERLESS FRIENDLY</div>
        <h1>Test SMS and OTP flows<br />without a telecom provider.</h1>
        <p>Simulate queued → sent → delivered/failed lifecycles, OTP verification and signed webhook events from one deterministic API.</p>
        <div className="heroActions"><a className="button" href="#playground">Try the simulator</a><Link className="button secondary" href="/docs">Read API docs</Link></div>
        <div className="metrics"><span><strong>0</strong> external telecom calls</span><span><strong>AES-256-GCM</strong> stateless IDs</span><span><strong>HMAC-SHA256</strong> webhook signatures</span></div>
      </section>
      <section className="features">
        <article><div>01</div><h3>SMS lifecycle</h3><p>Control latency, delivery delay, failure rate or force a final status.</p></article>
        <article><div>02</div><h3>OTP flows</h3><p>Generate and verify expiring OTPs without storing server-side state.</p></article>
        <article><div>03</div><h3>Webhook events</h3><p>Inspect lifecycle events with realistic HMAC signatures for local integration tests.</p></article>
        <article><div>04</div><h3>Serverless-safe</h3><p>Encrypted self-contained IDs eliminate database and background-timer requirements.</p></article>
      </section>
      <section id="playground" className="section"><div className="sectionHead"><div className="eyebrow">LIVE PLAYGROUND</div><h2>Run the flow in your browser.</h2></div><SimulatorPlayground /></section>
      <section className="section codeSection"><div><div className="eyebrow">API FIRST</div><h2>Drop it into your integration tests.</h2><p>Compatible with curl, Postman, CI pipelines and local application development.</p></div><pre>{`curl -X POST /api/v1/messages \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "+224612345678",
    "body": "Your code is 482901",
    "sender_id": "DEMO"
  }'`}</pre></section>
      <footer>Built by Popy Traoré · Open source under MIT</footer>
    </main>
  );
}
