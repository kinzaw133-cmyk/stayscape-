"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { money, type Hotel } from "@/lib/types";

export default function HotelCard({ h, featured = false }: { h: Hotel; featured?: boolean }) {
  return (
    <Link href={`/hotels/${h.slug}`} className="group block overflow-hidden rounded-3xl bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">
      <div className={`relative overflow-hidden bg-sage/30 ${featured ? "aspect-[4/3]" : "aspect-[4/5]"}`}>
        {h.image && (
          <img
            src={h.image}
            alt={h.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        )}
        <span className="glass absolute left-3 top-3 flex items-center gap-1 rounded-full px-3 py-1 text-xs text-fg">
          <Star className="h-3.5 w-3.5 fill-accent text-accent" /> {h.rating.toFixed(1)}
        </span>
      </div>
      <div className="space-y-2 p-5">
        <h3 className="font-display text-2xl leading-tight text-fg">{h.name}</h3>
        <p className="text-sm text-muted">{h.city}, {h.country}</p>
        <p className="flex items-baseline justify-between text-sm text-muted">
          <span>From <span className="text-lg font-semibold text-accent">{money(h.from)}</span> per night</span>
          <span>{h.reviews} reviews</span>
        </p>
      </div>
    </Link>
  );
}
