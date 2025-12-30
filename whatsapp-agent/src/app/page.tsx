import { ChatWindow } from '@/components/ChatWindow';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-white pb-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 pt-16 lg:px-8">
        <section className="rounded-3xl border border-emerald-100 bg-white px-10 py-12 shadow-xl shadow-emerald-100/40">
          <div className="max-w-3xl space-y-6">
            <p className="inline-flex items-center rounded-full bg-emerald-100 px-4 py-1 text-sm font-medium text-emerald-700">
              WhatsApp Automation Control Center
            </p>
            <h1 className="text-5xl font-semibold leading-tight text-zinc-900">
              Manage every WhatsApp conversation from a single AI-powered agent.
            </h1>
            <p className="text-lg text-zinc-600">
              Send proactive outreach, monitor live chats, and capture incoming leads effortlessly.
              Connect your WhatsApp Business account, drop in your automation workflows, and we&apos;ll
              take care of the rest.
            </p>
            <dl className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                  Real-time Sync
                </dt>
                <dd className="mt-2 text-sm text-emerald-800">
                  Webhooks capture inbound messages and delivery statuses the moment they arrive, so
                  your team stays in lockstep.
                </dd>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-white px-5 py-4 shadow-sm">
                <dt className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                  Smart Routing
                </dt>
                <dd className="mt-2 text-sm text-zinc-600">
                  Blend automation with human hand-offs. Reply instantly while highlighting
                  conversations that need a personal touch.
                </dd>
              </div>
            </dl>
          </div>
        </section>
        <section className="rounded-3xl border border-zinc-100 bg-gradient-to-br from-white via-white to-emerald-50/60 p-6 shadow-xl shadow-zinc-200/40">
          <ChatWindow />
        </section>
      </div>
    </main>
  );
}
