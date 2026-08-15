import json
import os
import time
import urllib.request

base = os.getenv("SIMULATOR_URL", "http://localhost:3000")
payload = json.dumps({
    "to": "+224612345678",
    "body": "Python integration test",
    "sender_id": "DEMO",
    "simulation": {"final_status": "delivered"},
}).encode()

request = urllib.request.Request(
    f"{base}/api/v1/messages",
    data=payload,
    headers={"Content-Type": "application/json"},
    method="POST",
)
with urllib.request.urlopen(request) as response:
    message = json.load(response)
print("accepted", message)

time.sleep(3)
with urllib.request.urlopen(f"{base}{message['links']['self']}") as response:
    print("final", json.load(response))
