'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';
import clsx from 'classnames';
import { ChatMessage } from '@/types/message';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function formatTimestamp(timestamp: number) {
  return new Date(timestamp).toLocaleString();
}

export function ChatWindow() {
  const { data, error, isLoading, mutate } = useSWR<{ messages: ChatMessage[] }>(
    '/api/messages',
    fetcher,
    { refreshInterval: 4000 },
  );
  const messages = useMemo(() => data?.messages ?? [], [data?.messages]);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [composerText, setComposerText] = useState('');
  const [sending, setSending] = useState(false);
  const [composerError, setComposerError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const contacts = useMemo(() => {
    const unique = new Set<string>();
    messages
      .slice()
      .sort((a, b) => b.timestamp - a.timestamp)
      .forEach((message) => {
        if (message.phone) {
          unique.add(message.phone);
        }
      });
    return Array.from(unique);
  }, [messages]);

  useEffect(() => {
    if (!selectedPhone && contacts.length > 0) {
      setSelectedPhone(contacts[0]);
    }
  }, [contacts, selectedPhone]);

  const visibleMessages = useMemo(() => {
    if (!selectedPhone) return messages;
    return messages.filter((message) => message.phone === selectedPhone);
  }, [messages, selectedPhone]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleMessages]);

  const handleSend = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!composerText.trim() || !selectedPhone) return;
      setSending(true);
      setComposerError(null);
      try {
        const response = await fetch('/api/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: selectedPhone, body: composerText }),
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error ?? 'Failed to send message');
        }
        setComposerText('');
        await mutate();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setComposerError(message);
      } finally {
        setSending(false);
      }
    },
    [composerText, mutate, selectedPhone],
  );

  const handleCreateConversation = useCallback(() => {
    const phone = prompt('Enter the full WhatsApp phone number (e.g., 15551234567)');
    if (phone) {
      setSelectedPhone(phone.trim());
    }
  }, []);

  return (
    <div className="flex h-full min-h-[500px] gap-4">
      <aside className="flex w-64 flex-shrink-0 flex-col rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
          <h2 className="text-lg font-semibold text-zinc-800">Conversations</h2>
          <button
            type="button"
            onClick={handleCreateConversation}
            className="rounded-full bg-emerald-500 px-3 py-1 text-sm font-medium text-white transition hover:bg-emerald-600"
          >
            New
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {contacts.length === 0 && (
            <p className="px-4 py-6 text-sm text-zinc-500">
              No conversations yet. Click &ldquo;New&rdquo; to start one.
            </p>
          )}
          <ul>
            {contacts.map((phone) => (
              <li key={phone}>
                <button
                  type="button"
                  onClick={() => setSelectedPhone(phone)}
                  className={clsx(
                    'flex w-full flex-col items-start gap-1 px-4 py-3 text-left transition',
                    selectedPhone === phone
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'hover:bg-zinc-100 text-zinc-700',
                  )}
                >
                  <span className="text-sm font-medium">{phone}</span>
                  <span className="line-clamp-1 text-xs text-zinc-500">
                    {messages
                      .filter((message) => message.phone === phone)
                      .sort((a, b) => b.timestamp - a.timestamp)[0]?.text ?? ''}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>
      <section className="flex flex-1 flex-col rounded-xl border border-zinc-200 bg-white shadow-sm">
        <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold text-zinc-800">
              {selectedPhone ?? 'Select a conversation'}
            </h1>
            <p className="text-sm text-zinc-500">
              {selectedPhone
                ? 'Messages will sync as soon as webhooks arrive.'
                : 'Choose a contact to get started.'}
            </p>
          </div>
          <div className="text-xs text-zinc-400">
            {isLoading ? 'Loading…' : error ? 'Failed to load messages' : null}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-zinc-50 px-6 py-4">
          <div className="space-y-3">
            {visibleMessages.map((message) => (
              <div
                key={message.id}
                className={clsx('flex w-full', {
                  'justify-end': message.direction === 'outgoing',
                  'justify-start': message.direction === 'incoming',
                })}
              >
                <div
                  className={clsx(
                    'max-w-[70%] rounded-2xl px-4 py-3 shadow-sm',
                    message.direction === 'outgoing'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white text-zinc-800',
                  )}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.text}</p>
                  <div
                    className={clsx('mt-2 text-right text-[11px]', {
                      'text-white/70': message.direction === 'outgoing',
                      'text-zinc-400': message.direction === 'incoming',
                    })}
                  >
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </main>
        <footer className="border-t border-zinc-200 bg-white px-6 py-4">
          <form className="flex flex-col gap-3" onSubmit={handleSend}>
            {composerError && <p className="text-sm text-red-500">{composerError}</p>}
            <textarea
              className="min-h-[100px] resize-none rounded-xl border border-zinc-300 px-4 py-3 text-sm text-zinc-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder={
                selectedPhone
                  ? 'Type your reply…'
                  : 'Select or create a conversation before sending a message.'
              }
              value={composerText}
              disabled={!selectedPhone || sending}
              onChange={(event) => setComposerText(event.target.value)}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">
                Messages are sent via the WhatsApp Business Cloud API.
              </span>
              <button
                type="submit"
                disabled={!selectedPhone || !composerText.trim() || sending}
                className={clsx(
                  'rounded-full px-6 py-2 text-sm font-medium transition',
                  !selectedPhone || !composerText.trim() || sending
                    ? 'bg-zinc-200 text-zinc-500'
                    : 'bg-emerald-500 text-white hover:bg-emerald-600',
                )}
              >
                {sending ? 'Sending…' : 'Send'}
              </button>
            </div>
          </form>
        </footer>
      </section>
    </div>
  );
}
