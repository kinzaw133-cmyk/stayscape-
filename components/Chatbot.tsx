"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, MessageCircle, Send, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const GREETING = "Hello, I am the StayScape concierge. Ask me about prices, amenities, or where to stay.";
const CHIPS = ["Show budget stays", "Which hotels have a spa?", "How does the map work?"];

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      setMessages([...next, { role: "assistant", content: data.reply ?? data.error ?? "Something went wrong. Please try again." }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "I could not reach the server. Check your connection and try again." }]);
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close concierge chat" : "Open concierge chat"}
        aria-expanded={open}
        className="btn-accent fixed bottom-5 right-5 z-50 h-14 w-14 !rounded-full !p-0 shadow-xl"
      >
        {open ? <X /> : <MessageCircle />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.section
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.25 }}
            aria-label="StayScape concierge"
            className="glass fixed inset-x-3 bottom-24 z-50 flex max-h-[70vh] flex-col overflow-hidden rounded-3xl sm:inset-x-auto sm:right-5 sm:w-96"
          >
            <header className="border-b border-fg/10 px-5 py-4 font-display text-xl text-fg">Concierge</header>
            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4 text-sm">
              {messages.length === 0 && <p className="rounded-2xl bg-fg/10 p-3 text-fg">{GREETING}</p>}
              {messages.map((m, i) => (
                <p key={i} className={`max-w-[85%] rounded-2xl px-3 py-2 ${m.role === "user" ? "ml-auto bg-accent text-accent-fg" : "bg-fg/10 text-fg"}`}>
                  {m.content}
                </p>
              ))}
              {busy && <p className="flex items-center gap-2 text-muted"><Loader2 className="h-4 w-4 animate-spin" /> Thinking</p>}
              <div ref={endRef} />
            </div>
            {messages.length === 0 && (
              <div className="flex flex-wrap gap-2 px-5 pb-2">
                {CHIPS.map((c) => (
                  <button key={c} onClick={() => send(c)} className="rounded-full border border-fg/20 px-3 py-1 text-xs text-fg hover:border-accent">
                    {c}
                  </button>
                ))}
              </div>
            )}
            <form onSubmit={onSubmit} className="flex gap-2 border-t border-fg/10 p-3">
              <input value={input} onChange={(e) => setInput(e.target.value)} maxLength={1000} placeholder="Ask about a stay" aria-label="Message" className="field" />
              <button type="submit" disabled={busy || !input.trim()} aria-label="Send message" className="btn-accent h-10 w-10 shrink-0 !p-0">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
