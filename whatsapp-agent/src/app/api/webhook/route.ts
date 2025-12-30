import { NextResponse } from 'next/server';
import { appendMessage } from '@/lib/messageStore';

function millisecondsFromTimestamp(timestamp?: string) {
  if (!timestamp) return Date.now();
  const asNumber = Number(timestamp) * 1000;
  return Number.isFinite(asNumber) ? asNumber : Date.now();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === 'subscribe' && token && token === verifyToken) {
    return new Response(challenge ?? '', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const entries: any[] = payload?.entry ?? [];

    for (const entry of entries) {
      const changes: any[] = entry?.changes ?? [];
      for (const change of changes) {
        const value = change?.value;
        if (!value) continue;

        const messages: any[] = value.messages ?? [];
        for (const message of messages) {
          const phone = message.from ?? value.metadata?.display_phone_number ?? 'unknown';
          const timestamp = millisecondsFromTimestamp(message.timestamp);
          const text =
            message.type === 'text'
              ? message.text?.body ?? ''
              : `Received ${message.type} message`;

          await appendMessage({
            direction: 'incoming',
            phone,
            text,
            timestamp,
            metadata: { raw: message },
          });
        }

        const statuses: any[] = value.statuses ?? [];
        for (const status of statuses) {
          const timestamp = millisecondsFromTimestamp(status.timestamp);
          await appendMessage({
            direction: 'incoming',
            phone: status.recipient_id ?? 'unknown',
            text: `Message status: ${status.status}`,
            timestamp,
            metadata: { raw: status, type: 'status' },
          });
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
