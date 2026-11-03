"use client";
import { useEffect, useState } from "react";
import { LayoutGrid, MapPin, Search } from "lucide-react";
import HotelCard from "@/components/HotelCard";
import MapView from "@/components/MapView";
import { AMENITIES, money, type Hotel, type Sort } from "@/lib/types";

type Result = { items: Hotel[]; total: number; page: number; totalPages: number };

export default function ExplorePage() {
  const [q, setQ] = useState("");
  const [stay, setStay] = useState("");
  const [maxPrice, setMaxPrice] = useState(1000);
  const [minRating, setMinRating] = useState(0);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [sort, setSort] = useState<Sort>("rating");
  const [page, setPage] = useState(1);
  const [view, setView] = useState<"grid" | "map">("grid");
  const [data, setData] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Read the hero search values from the URL once on the client.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("q")) setQ(p.get("q") ?? "");
    const parts = [
      p.get("checkin") && `Check-in ${p.get("checkin")}`,
      p.get("checkout") && `Check-out ${p.get("checkout")}`,
      p.get("guests") && `${p.get("guests")} guests`,
    ].filter(Boolean);
    setStay(parts.join(" · "));
  }, []);

  useEffect(() => {
    const ctl = new AbortController();
    const params = new URLSearchParams({
      q,
      maxPrice: String(maxPrice >= 1000 ? 100000 : maxPrice),
      minRating: String(minRating),
      amenities: amenities.join(","),
      sort,
      page: String(page),
      pageSize: view === "map" ? "100" : "6",
    });
    setLoading(true);
    setError("");
    fetch(`/api/hotels?${params}`, { signal: ctl.signal })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        return d as Result;
      })
      .then(setData)
      .catch((e: Error) => {
        if (e.name !== "AbortError") setError(e.message);
      })
      .finally(() => {
        if (!ctl.signal.aborted) setLoading(false);
      });
    return () => ctl.abort();
  }, [q, maxPrice, minRating, amenities, sort, page, view]);

  const filter = <T,>(setter: (v: T) => void) => (v: T) => { setter(v); setPage(1); };
  const toggle = (a: string) => {
    setAmenities((cur) => (cur.includes(a) ? cur.filter((x) => x !== a) : [...cur, a]));
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 pb-20 pt-14">
      <header className="space-y-3">
        <h1 className="font-display text-5xl">Find your stay</h1>
        <p className="text-muted">{stay || "Compare hotels, room prices and locations."}</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[17rem_1fr]">
        <aside className="glass h-fit space-y-6 rounded-3xl p-6 lg:sticky lg:top-28">
          <label className="block space-y-2 text-sm">
            <span className="flex items-center gap-2"><Search className="h-4 w-4" /> Destination or name</span>
            <input className="field" value={q} onChange={(e) => filter(setQ)(e.target.value)} placeholder="Try Maldives" />
          </label>
          <label className="block space-y-2 text-sm">
            {maxPrice >= 1000 ? "Any price" : `Up to ${money(maxPrice)} per night`}
            <input type="range" min={50} max={1000} step={10} value={maxPrice} onChange={(e) => filter(setMaxPrice)(Number(e.target.value))} className="w-full accent-accent" />
          </label>
          <label className="block space-y-2 text-sm">
            Minimum rating
            <select className="field" value={minRating} onChange={(e) => filter(setMinRating)(Number(e.target.value))}>
              <option value={0}>Any rating</option>
              <option value={4}>4.0 and up</option>
              <option value={4.5}>4.5 and up</option>
            </select>
          </label>
          <fieldset className="space-y-2 text-sm">
            <legend className="mb-2 font-medium">Amenities</legend>
            {AMENITIES.map((a) => (
              <label key={a} className="flex items-center gap-2">
                <input type="checkbox" className="accent-accent" checked={amenities.includes(a)} onChange={() => toggle(a)} />
                {a}
              </label>
            ))}
          </fieldset>
        </aside>

        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted" aria-live="polite">{data ? `${data.total} stays found` : " "}</p>
            <div className="flex items-center gap-2">
              <select className="field w-auto" value={sort} onChange={(e) => filter(setSort)(e.target.value as Sort)} aria-label="Sort hotels">
                <option value="rating">Top rated</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
              <div className="glass flex rounded-full p-1">
                <button onClick={() => setView("grid")} aria-pressed={view === "grid"} aria-label="Grid view" className={`rounded-full px-3 py-1.5 ${view === "grid" ? "bg-accent text-accent-fg" : "text-fg"}`}>
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button onClick={() => setView("map")} aria-pressed={view === "map"} aria-label="Map view" className={`rounded-full px-3 py-1.5 ${view === "map" ? "bg-accent text-accent-fg" : "text-fg"}`}>
                  <MapPin className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {error && <p role="alert" className="glass rounded-2xl p-5 text-sm">Hotels could not be loaded. {error}</p>}

          {loading && !data && (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => <div key={i} className="aspect-[4/5] animate-pulse rounded-3xl bg-surface" />)}
            </div>
          )}

          {data && data.total === 0 && (
            <p className="glass rounded-2xl p-8 text-center text-muted">No stays match these filters. Raise the price or remove an amenity.</p>
          )}

          {data && data.items.length > 0 && (
            <div className={`transition ${loading ? "opacity-60" : ""}`}>
              {view === "map" ? (
                <MapView hotels={data.items} height={600} />
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {data.items.map((h) => <HotelCard key={h.id} h={h} />)}
                </div>
              )}
            </div>
          )}

          {data && view === "grid" && data.totalPages > 1 && (
            <nav className="flex items-center justify-center gap-4 text-sm" aria-label="Pagination">
              <button className="glass rounded-full px-4 py-2 disabled:opacity-40" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
              <span className="text-muted">Page {data.page} of {data.totalPages}</span>
              <button className="glass rounded-full px-4 py-2 disabled:opacity-40" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
            </nav>
          )}
        </section>
      </div>
    </div>
  );
}
