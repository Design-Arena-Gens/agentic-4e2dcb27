import { NextResponse } from 'next/server';
import { clearMessages, getMessages } from '@/lib/messageStore';

export async function GET() {
  const messages = await getMessages();
  return NextResponse.json({ messages });
}

export async function DELETE() {
  await clearMessages();
  return NextResponse.json({ ok: true });
}
