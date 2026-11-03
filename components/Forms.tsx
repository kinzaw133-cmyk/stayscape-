"use client";
import { useRouter } from "next/navigation";
import { Loader2, Mail, MapPin, Search } from "lucide-react";
import { useState, type FormEvent } from "react";

export function HeroSearch() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [guests, setGuests] = useState("2");

  function submit(e: FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams({ q: destination, checkin, checkout, guests });
    router.push(`/explore?${p.toString()}`);
  }

  return (
    <form onSubmit={submit} className="glass grid gap-3 rounded-3xl p-4 md:grid-cols-[2fr_1fr_1fr_0.7fr_auto] md:items-end">
      <label className="space-y-1.5 text-xs text-muted">
        Destination or hotel
        <span className="relative block">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input className="field pl-9" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Where to?" />
        </span>
      </label>
      <label className="space-y-1.5 text-xs text-muted">
        Check-in
        <input type="date" className="field" value={checkin} onChange={(e) => setCheckin(e.target.value)} />
      </label>
      <label className="space-y-1.5 text-xs text-muted">
        Check-out
        <input type="date" className="field" value={checkout} onChange={(e) => setCheckout(e.target.value)} />
      </label>
      <label className="space-y-1.5 text-xs text-muted">
        Guests
        <select className="field" value={guests} onChange={(e) => setGuests(e.target.value)}>
          {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>
      <button type="submit" className="btn-accent">
        <Search className="h-4 w-4" /> Search
      </button>
    </form>
  );
}

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setStatus(res.ok ? { ok: true, text: data.message } : { ok: false, text: data.error });
      if (res.ok) setEmail("");
    } catch {
      setStatus({ ok: false, text: "Network error. Check your connection and try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" aria-label="Email address" className="field sm:flex-1" />
      <button type="submit" disabled={busy} className="btn-accent">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />} Subscribe
      </button>
      {status && (
        <p role="status" className={`text-sm sm:basis-full ${status.ok ? "text-accent" : "text-red-400"}`}>{status.text}</p>
      )}
    </form>
  );
}
