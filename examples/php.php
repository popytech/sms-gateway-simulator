<?php
$base = getenv('SIMULATOR_URL') ?: 'http://localhost:3000';
$payload = json_encode([
  'to' => '+224612345678',
  'body' => 'PHP integration test',
  'sender_id' => 'DEMO',
  'simulation' => ['final_status' => 'delivered'],
]);

$context = stream_context_create(['http' => [
  'method' => 'POST',
  'header' => "Content-Type: application/json\r\n",
  'content' => $payload,
]]);
$result = file_get_contents($base . '/api/v1/messages', false, $context);
$message = json_decode($result, true);
print_r($message);
