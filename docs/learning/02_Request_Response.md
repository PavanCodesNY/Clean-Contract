# 02 - Requests and Responses

Request = what the client sends
- Method: GET or POST.
- Body: JSON for POST.

Response = what the server sends back
- Usually JSON.
- Has a status code (200, 400, 500).

Example: Chat
- Request JSON:
  - `message` (string)
  - `conversation_id` (optional string)
- Response JSON:
  - `response` (string)
  - `conversation_id` (string)

Where to look
- Request/response models: `backend/main.py`.
- Proxy route: `app/api/chat/route.ts`.
- UI caller: `app/(app)/see-chat/page.tsx`.
