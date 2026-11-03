"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  Hotel as HotelIcon,
  Loader2,
  MapPin,
  Users,
  XCircle,
  PlusCircle,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { money } from "@/lib/types";

type BookingItem = {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  hotel_slug: string;
  hotel_name: string;
  hotel_city: string;
  hotel_country: string;
  hotel_image: string;
  room_id: string;
  room_name: string;
  room_price: number;
  check_in: string;
  check_out: string;
  guests: number;
  nights: number;
  total_price: number;
  special_requests: string | null;
  status: "confirmed" | "cancelled";
  created_at: string;
};

export default function BookingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login?redirect=/bookings");
      return;
    }

    if (user) {
      loadBookings();
    }
  }, [user, authLoading, router]);

  async function loadBookings() {
    setLoading(true);
    try {
      const res = await fetch("/api/bookings");
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(id: string) {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    setCancellingId(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: "PATCH" });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b))
        );
      }
    } catch (err) {
      console.error("Failed to cancel booking:", err);
    } finally {
      setCancellingId(null);
    }
  }

  if (authLoading || (loading && !bookings.length)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="text-sm text-muted">Loading your reservations...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-accent font-semibold">Your Reservations</p>
          <h1 className="font-display text-4xl md:text-5xl text-fg">My Bookings</h1>
          <p className="text-sm text-muted mt-1">
            Logged in as <span className="text-fg font-medium">{user?.name}</span> ({user?.email})
          </p>
        </div>
        <Link href="/book" className="btn-accent inline-flex items-center gap-2 self-start sm:self-auto">
          <PlusCircle className="h-4 w-4" /> Book a New Stay
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="glass rounded-[2.5rem] p-12 text-center max-w-xl mx-auto space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 text-accent">
            <Calendar className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="font-display text-3xl text-fg">No bookings yet</h2>
            <p className="text-sm text-muted">
              You haven't reserved any stays yet. Explore our luxury resorts and find your next unforgettable destination.
            </p>
          </div>
          <div className="pt-2">
            <Link href="/explore" className="btn-accent inline-flex items-center gap-2">
              Explore Stays <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((b) => {
            const isCancelled = b.status === "cancelled";
            return (
              <div
                key={b.id}
                className={`glass rounded-3xl p-6 md:p-8 transition border ${
                  isCancelled ? "opacity-60 border-fg/5" : "border-fg/15 hover:border-accent/40"
                }`}
              >
                <div className="grid gap-6 md:grid-cols-[180px_1fr_auto] md:items-center">
                  {/* Hotel Photo */}
                  <div className="relative aspect-[4/3] md:aspect-square overflow-hidden rounded-2xl bg-sage/30">
                    <img
                      src={b.hotel_image}
                      alt={b.hotel_name}
                      className="h-full w-full object-cover"
                    />
                    <span
                      className={`absolute top-2 left-2 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md ${
                        isCancelled
                          ? "bg-rose-500/80 text-white"
                          : "bg-emerald-600/90 text-white"
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="font-mono text-xs text-accent font-semibold">{b.id}</span>
                      <span className="text-xs text-muted">· Booked on {new Date(b.created_at).toLocaleDateString()}</span>
                    </div>

                    <div>
                      <h2 className="font-display text-2xl text-fg">{b.hotel_name}</h2>
                      <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" /> {b.hotel_city}, {b.hotel_country}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-muted pt-1">
                      <span className="flex items-center gap-1.5 font-medium text-fg">
                        <HotelIcon className="h-3.5 w-3.5 text-accent" /> {b.room_name}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" /> {b.check_in} → {b.check_out} ({b.nights} {b.nights === 1 ? "night" : "nights"})
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" /> {b.guests} {b.guests === 1 ? "guest" : "guests"}
                      </span>
                    </div>

                    {b.special_requests && (
                      <p className="text-xs text-muted/80 bg-surface/50 rounded-xl px-3 py-2 border border-fg/5">
                        <span className="font-medium text-fg">Requests:</span> {b.special_requests}
                      </p>
                    )}
                  </div>

                  {/* Pricing and Actions */}
                  <div className="flex md:flex-col items-end justify-between md:justify-center gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-fg/10">
                    <div className="text-left md:text-right">
                      <p className="text-xs text-muted">Total Amount</p>
                      <p className="font-display text-2xl md:text-3xl font-bold text-accent">
                        {money(b.total_price)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/hotels/${b.hotel_slug}`}
                        className="btn-ghost text-xs px-3 py-1.5"
                      >
                        Hotel details
                      </Link>
                      {!isCancelled && (
                        <button
                          onClick={() => handleCancel(b.id)}
                          disabled={cancellingId === b.id}
                          className="text-xs text-rose-400 hover:text-rose-300 transition flex items-center gap-1 px-3 py-1.5 rounded-full border border-rose-400/20 hover:border-rose-400/50"
                        >
                          {cancellingId === b.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5" />
                          )}
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

