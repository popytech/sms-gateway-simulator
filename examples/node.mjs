const baseUrl = process.env.SIMULATOR_URL || "http://localhost:3000";

const response = await fetch(`${baseUrl}/api/v1/messages`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    to: "+224612345678",
    body: "Node.js integration test",
    sender_id: "DEMO",
    simulation: { final_status: "delivered" }
  }),
});

const message = await response.json();
console.log("accepted", message);

await new Promise((resolve) => setTimeout(resolve, 3000));
const status = await fetch(`${baseUrl}${message.links.self}`).then((r) => r.json());
console.log("final", status);
