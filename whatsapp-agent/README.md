## Agentic WhatsApp Control

This project delivers a full-stack control center for WhatsApp Business automation. It ingests Meta webhooks, centralises message history, and lets you drive outbound outreach from a single dashboard.

### Features

- **Conversation hub** – monitor and reply to every customer thread with a streamlined chat UI.
- **Webhook capture** – verify and ingest WhatsApp Cloud API callbacks for realtime syncing.
- **Outbound sending** – trigger proactive messages through the official Graph API.
- **Persistent archive** – store conversations locally (`data/messages.json`) in a portable JSON log.

### Prerequisites

Create a WhatsApp Business App inside Meta Developers and collect:

| Variable | Description |
| --- | --- |
| `WHATSAPP_ACCESS_TOKEN` | Permanent access token with `whatsapp_business_messaging` scope. |
| `WHATSAPP_PHONE_NUMBER_ID` | The phone number ID tied to your WhatsApp Business account. |
| `WHATSAPP_VERIFY_TOKEN` | Arbitrary string you provide to verify the webhook handshake. |
| `WHATSAPP_API_VERSION` _(optional)_ | Defaults to `v21.0`. Override if you need a different version. |

Copy `.env.example` to `.env.local`, then populate these values.

```bash
cp .env.example .env.local
```

### Local development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to access the dashboard.

To receive inbound messages locally, use a tunnelling tool (e.g. `npx vercel dev`, `ngrok`, `cloudflared`) and point the Meta webhook to `https://<tunnel-domain>/api/webhook`.

### Production deployment

The app is optimised for Vercel:

1. Set the environment variables in the Vercel project dashboard.
2. Deploy with `vercel deploy --prod`.
3. In Meta, set your callback URL to `https://agentic-4e2dcb27.vercel.app/api/webhook` and reuse the verify token.

### API overview

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/messages` | `GET` | Returns all persisted messages. |
| `/api/messages` | `DELETE` | Clears the message archive. |
| `/api/send` | `POST` | Sends a message via WhatsApp Cloud API. Payload: `{ "to": "<phone>", "body": "<text>" }`. |
| `/api/webhook` | `GET` | Meta verification handshake. |
| `/api/webhook` | `POST` | Receives WhatsApp webhook notifications and persists them. |

Message events are stored in `data/messages.json`, with a rolling cap of 500 records. Adjust this in `src/lib/messageStore.ts` if you need more.

### Architecture

- **Next.js App Router** (React Server Components) for UI and APIs.
- **Tailwind CSS** for styling.
- **SWR** for client-side polling of message state.
- **File-based store** for persistence; swap with a database by replacing the functions in `messageStore.ts`.

Feel free to extend with automation logic, AI hand-offs, or CRM integrations depending on your business workflows.
