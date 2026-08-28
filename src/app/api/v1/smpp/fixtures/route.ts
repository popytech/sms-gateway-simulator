import { json, requireApiKey } from "@/lib/api";

const fixtures = {
  submit_sm: {
    command: "submit_sm",
    source_addr: "DEMO",
    destination_addr: "+224612345678",
    short_message: "Your code is 482901",
    registered_delivery: 1,
  },
  submit_sm_resp: {
    command: "submit_sm_resp",
    command_status: 0,
    message_id: "simulated-smpp-message-id",
  },
  deliver_sm_receipt: {
    command: "deliver_sm",
    receipted_message_id: "simulated-smpp-message-id",
    message_state: "DELIVERED",
    short_message: "id:simulated-smpp-message-id stat:DELIVRD err:000",
  },
  deliver_sm_failure: {
    command: "deliver_sm",
    receipted_message_id: "simulated-smpp-message-id",
    message_state: "UNDELIVERABLE",
    short_message: "id:simulated-smpp-message-id stat:UNDELIV err:SIM",
  },
};

export async function GET(request: Request) {
  const denied = requireApiKey(request);
  if (denied) return denied;

  return json({
    mode: "fixture",
    protocol: "SMPP-like JSON fixtures",
    disclaimer: "These fixtures model common SMPP concepts for application tests; they are not raw binary PDUs or operator specifications.",
    fixtures,
  });
}
