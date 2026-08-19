"use client";
import { useEffect, useState } from "react";
import { useSiteStore } from "@/lib/stores/siteStore";
import type { ContactSubmission } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Mail, MailOpen, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MessagesPage() {
  const { currentSite, loaded } = useSiteStore(); 
  const [messages, setMessages] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactSubmission | null>(null);

  useEffect(() => {
    if (!loaded || !currentSite) { setLoading(false); return; }
    fetch(`/api/admin/messages?siteId=${currentSite.id}`)
      .then((r) => r.json())
      .then(setMessages)
      .finally(() => setLoading(false));
  }, [loaded, currentSite]);

  async function markRead(id: string) {
    await fetch(`/api/admin/messages/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isRead: true }) });
    setMessages((ms) => ms.map((m) => m.id === id ? { ...m, isRead: true } : m));
  }

  async function deleteMsg(id: string) {
    if (!confirm("Bericht verwijderen?")) return;
    await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
    setMessages((ms) => ms.filter((m) => m.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  function open(msg: ContactSubmission) {
    setSelected(msg);
    if (!msg.isRead) markRead(msg.id);
  }

  if (!loaded) return <div className="text-stone-400 text-sm p-6 animate-pulse">Laden...</div>;
  if (!currentSite) return <p className="text-stone-500">Kies eerst een site.</p>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Berichten</h1>
      <div className="flex gap-4">
        <div className="w-72 shrink-0 space-y-1">
          {loading ? <p className="text-stone-400 text-sm">Laden...</p> : messages.length === 0 ? (
            <div className="text-center py-8 text-stone-400 bg-white rounded-xl border border-stone-200">Geen berichten</div>
          ) : messages.map((msg) => (
            <button
              key={msg.id}
              onClick={() => open(msg)}
              className={cn(
                "w-full text-left px-3 py-2.5 rounded-xl border transition-colors",
                selected?.id === msg.id ? "border-amber-400 bg-amber-50" : "border-stone-200 bg-white hover:bg-stone-50",
                !msg.isRead && "border-amber-300"
              )}
            >
              <div className="flex items-center gap-2">
                {msg.isRead ? <MailOpen size={13} className="text-stone-400" /> : <Mail size={13} className="text-amber-500" />}
                <span className={cn("text-sm truncate", !msg.isRead && "font-semibold text-stone-800", msg.isRead && "text-stone-600")}>
                  {msg.name}
                </span>
              </div>
              <p className="text-xs text-stone-400 truncate mt-0.5">{msg.subject ?? msg.message.slice(0, 50)}</p>
              <p className="text-xs text-stone-300 mt-0.5">{formatDate(msg.createdAt)}</p>
            </button>
          ))}
        </div>

        <div className="flex-1 bg-white border border-stone-200 rounded-xl p-5 min-h-[300px]">
          {selected ? (
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-bold text-stone-800">{selected.subject ?? "Geen onderwerp"}</h2>
                  <p className="text-sm text-stone-500">{selected.name} · <a href={`mailto:${selected.email}`} className="text-amber-700 underline">{selected.email}</a></p>
                  <p className="text-xs text-stone-400">{formatDate(selected.createdAt)}</p>
                </div>
                <button onClick={() => deleteMsg(selected.id)} className="text-stone-400 hover:text-red-500 p-1.5 rounded hover:bg-red-50">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="text-stone-700 whitespace-pre-wrap text-sm leading-relaxed bg-stone-50 rounded-lg p-4">
                {selected.message}
              </div>
              <div className="mt-4">
                <a
                  href={`mailto:${selected.email}?subject=Re: ${selected.subject ?? "Uw bericht"}`}
                  className="inline-block px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-lg font-medium"
                >
                  Beantwoorden in e-mail
                </a>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-stone-400 text-sm">
              Klik op een bericht om het te lezen
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
