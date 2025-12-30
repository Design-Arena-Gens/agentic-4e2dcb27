import { NextResponse } from 'next/server';
import { appendMessage } from '@/lib/messageStore';
import { sendWhatsAppTextMessage } from '@/lib/whatsapp';

export async function POST(request: Request) {
  try {
    const { to, body, previewUrl } = await request.json();
    if (!to || !body) {
      return NextResponse.json(
        { error: 'Missing recipient phone number or body' },
        { status: 400 },
      );
    }

    const apiResponse = await sendWhatsAppTextMessage({ to, body, previewUrl });
    const message = await appendMessage({
      direction: 'outgoing',
      phone: to,
      text: body,
      timestamp: Date.now(),
      metadata: { apiResponse },
    });

    return NextResponse.json({ message });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send message';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
