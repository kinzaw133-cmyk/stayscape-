"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Info,
  Loader2,
  Lock,
  MapPin,
  Star,
  Users,
} from "lucide-react";
import type { Hotel } from "@/lib/types";
import { money } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";

export default function BookingForm({ hotels }: { hotels: Hotel[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  // Initial defaults
  const paramHotel = searchParams.get("hotel") || (hotels[0]?.slug ?? "");
  const paramRoom = searchParams.get("room") || "";
  const paramCheckIn = searchParams.get("checkin") || "";
  const paramCheckOut = searchParams.get("checkout") || "";
  const paramGuests = Number(searchParams.get("guests")) || 2;

  // Selected hotel
  const [selectedHotelSlug, setSelectedHotelSlug] = useState(paramHotel);
  const selectedHotel = useMemo(() => {
    return hotels.find((h) => h.slug === selectedHotelSlug) || hotels[0];
  }, [hotels, selectedHotelSlug]);

  // Selected room
  const [selectedRoomId, setSelectedRoomId] = useState(() => {
    if (paramRoom && selectedHotel?.rooms.some((r) => r.id === paramRoom)) {
      return paramRoom;
    }
    return selectedHotel?.rooms[0]?.id || "";
  });

  // When hotel changes, reset room if not matching
  useEffect(() => {
    if (selectedHotel && !selectedHotel.rooms.some((r) => r.id === selectedRoomId)) {
      setSelectedRoomId(selectedHotel.rooms[0]?.id || "");
    }
  }, [selectedHotel, selectedRoomId]);

  const selectedRoom = useMemo(() => {
    return selectedHotel?.rooms.find((r) => r.id === selectedRoomId) || selectedHotel?.rooms[0];
  }, [selectedHotel, selectedRoomId]);

  // Dates
  const today = new Date().toISOString().split("T")[0];
  const defaultIn = paramCheckIn || new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0];
  const defaultOut = paramCheckOut || new Date(Date.now() + 86400000 * 10).toISOString().split("T")[0];

  const [checkIn, setCheckIn] = useState(defaultIn);
  const [checkOut, setCheckOut] = useState(defaultOut);
  const [guests, setGuests] = useState(Math.min(paramGuests, selectedRoom?.capacity || 2));
  const [specialRequests, setSpecialRequests] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);

  // Nights calculation
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 1;
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const count = Math.round(diff / (1000 * 60 * 60 * 24));
    return count > 0 ? count : 1;
  }, [checkIn, checkOut]);

  // Price calculations
  const nightlyRate = selectedRoom?.price || 0;
  const subtotal = nightlyRate * nights;
  const taxesAndFees = Math.round(subtotal * 0.1);
  const grandTotal = subtotal + taxesAndFees;

  // Sync guests with room capacity
  useEffect(() => {
    if (selectedRoom && guests > selectedRoom.capacity) {
      setGuests(selectedRoom.capacity);
    }
  }, [selectedRoom, guests]);

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      // Redirect to login preserving the booking query
      const p = new URLSearchParams({
        hotel: selectedHotelSlug,
        room: selectedRoomId,
        checkin: checkIn,
        checkout: checkOut,
        guests: String(guests),
      });
      router.push(`/login?redirect=${encodeURIComponent(`/book?${p.toString()}`)}`);
      return;
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      setError("Check-out date must be after check-in date.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotelSlug: selectedHotel.slug,
          roomId: selectedRoom.id,
          checkIn,
          checkOut,
          guests,
          specialRequests,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not complete booking. Please try again.");
      } else {
        setConfirmedBooking(data.booking);
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Confirmation view
  if (confirmedBooking) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="glass text-center rounded-[2.5rem] p-8 md:p-12 space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/20 text-accent">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-accent font-semibold">Reservation Confirmed</p>
            <h1 className="font-display text-4xl md:text-5xl text-fg">You are all set!</h1>
            <p className="text-muted text-sm max-w-md mx-auto">
              We have reserved your stay at <span className="font-semibold text-fg">{confirmedBooking.hotel_name}</span>. A confirmation has been saved to your account.
            </p>
          </div>

          <div className="glass rounded-2xl p-6 text-left space-y-3 text-sm">
            <div className="flex justify-between border-b border-fg/10 pb-2">
              <span className="text-muted">Booking Reference</span>
              <span className="font-mono font-semibold text-accent">{confirmedBooking.id}</span>
            </div>
            <div className="flex justify-between border-b border-fg/10 pb-2">
              <span className="text-muted">Hotel & Room</span>
              <span className="font-medium text-fg">{confirmedBooking.hotel_name} · {confirmedBooking.room_name}</span>
            </div>
            <div className="flex justify-between border-b border-fg/10 pb-2">
              <span className="text-muted">Dates</span>
              <span className="text-fg">{confirmedBooking.check_in} → {confirmedBooking.check_out} ({confirmedBooking.nights} {confirmedBooking.nights === 1 ? "night" : "nights"})</span>
            </div>
            <div className="flex justify-between border-b border-fg/10 pb-2">
              <span className="text-muted">Guests</span>
              <span className="text-fg">{confirmedBooking.guests} {confirmedBooking.guests === 1 ? "guest" : "guests"}</span>
            </div>
            <div className="flex justify-between pt-1 text-base">
              <span className="font-medium text-fg">Total Paid</span>
              <span className="font-bold text-accent">{money(confirmedBooking.total_price)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/bookings" className="btn-accent justify-center py-3">
              View My Bookings
            </Link>
            <Link href="/explore" className="btn-ghost justify-center py-3">
              Explore More Stays
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-10 space-y-2">
        <p className="text-xs uppercase tracking-wider text-accent font-semibold">Reserve Your Stay</p>
        <h1 className="font-display text-4xl md:text-5xl text-fg">Book a luxury escape</h1>
        <p className="text-muted">Select your destination, choose room preferences, and lock in your reservation.</p>
      </div>

      {error && (
        <div className="mb-8 rounded-2xl bg-rose-500/10 border border-rose-500/20 px-5 py-4 text-sm text-rose-300">
          {error}
        </div>
      )}

      <form onSubmit={handleBook} className="grid gap-8 lg:grid-cols-[1.5fr_1fr] items-start">
        {/* Left Column: Form Fields */}
        <div className="space-y-6">
          {/* Hotel Selection */}
          <div className="glass rounded-3xl p-6 space-y-4">
            <h2 className="font-display text-2xl text-fg">1. Choose Destination</h2>
            <label className="block space-y-1.5 text-xs text-muted">
              Select Hotel or Resort
              <select
                className="field text-sm"
                value={selectedHotelSlug}
                onChange={(e) => setSelectedHotelSlug(e.target.value)}
              >
                {hotels.map((h) => (
                  <option key={h.slug} value={h.slug}>
                    {h.name} — {h.city}, {h.country} ({money(h.from)}/night)
                  </option>
                ))}
              </select>
            </label>

            {selectedHotel && (
              <div className="flex items-center gap-4 pt-2">
                <img
                  src={selectedHotel.image}
                  alt={selectedHotel.name}
                  className="h-16 w-20 rounded-2xl object-cover shrink-0"
                />
                <div className="text-sm">
                  <p className="font-semibold text-fg">{selectedHotel.name}</p>
                  <p className="text-xs text-muted flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {selectedHotel.city}, {selectedHotel.country}
                  </p>
                  <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                    <Star className="h-3 w-3 fill-accent text-accent" /> {selectedHotel.rating.toFixed(1)} ({selectedHotel.reviews} reviews)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Room Selection */}
          <div className="glass rounded-3xl p-6 space-y-4">
            <h2 className="font-display text-2xl text-fg">2. Select Room Type</h2>
            <div className="grid gap-3">
              {selectedHotel?.rooms.map((r) => {
                const isSelected = r.id === selectedRoomId;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRoomId(r.id)}
                    className={`cursor-pointer rounded-2xl border p-4 transition flex items-center justify-between gap-4 ${
                      isSelected
                        ? "border-accent bg-accent/10 shadow-sm"
                        : "border-fg/10 hover:border-fg/25 bg-surface/50"
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-fg">{r.name}</p>
                      <p className="text-xs text-muted">
                        {r.beds} · Up to {r.capacity} {r.capacity === 1 ? "guest" : "guests"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-accent">{money(r.price)}</p>
                      <p className="text-[10px] text-muted">per night</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dates & Guests */}
          <div className="glass rounded-3xl p-6 space-y-4">
            <h2 className="font-display text-2xl text-fg">3. Dates & Guests</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-xs text-muted">
                Check-in Date
                <input
                  type="date"
                  min={today}
                  required
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="field text-sm"
                />
              </label>

              <label className="space-y-1.5 text-xs text-muted">
                Check-out Date
                <input
                  type="date"
                  min={checkIn || today}
                  required
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="field text-sm"
                />
              </label>
            </div>

            <label className="block space-y-1.5 text-xs text-muted">
              Number of Guests
              <select
                className="field text-sm"
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
              >
                {Array.from({ length: selectedRoom?.capacity || 4 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "Guest" : "Guests"} {n === selectedRoom?.capacity ? "(Room Max)" : ""}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1.5 text-xs text-muted">
              Special Requests (optional)
              <textarea
                rows={2}
                maxLength={500}
                placeholder="Airport transfer, quiet room, late check-in..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="field text-sm resize-none"
              />
            </label>
          </div>
        </div>

        {/* Right Column: Order Summary & Confirmation */}
        <div className="glass sticky top-24 rounded-3xl p-6 md:p-8 space-y-6">
          <h2 className="font-display text-2xl text-fg">Price Summary</h2>

          {selectedHotel && selectedRoom && (
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center pb-3 border-b border-fg/10">
                <span className="text-muted">
                  {selectedRoom.name} ({nights} {nights === 1 ? "night" : "nights"})
                </span>
                <span className="font-medium text-fg">{money(subtotal)}</span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-fg/10">
                <span className="text-muted">Estimated Taxes & Resort Fees (10%)</span>
                <span className="font-medium text-fg">{money(taxesAndFees)}</span>
              </div>

              <div className="flex justify-between items-baseline pt-2">
                <span className="font-display text-xl text-fg">Total</span>
                <span className="font-display text-3xl font-bold text-accent">{money(grandTotal)}</span>
              </div>
            </div>
          )}

          {/* User Status Bar */}
          {!authLoading && (
            <div className="rounded-2xl bg-surface/80 p-4 border border-fg/10 text-xs">
              {user ? (
                <div className="space-y-1">
                  <p className="text-muted">Booking under your account:</p>
                  <p className="font-semibold text-fg">{user.name} ({user.email})</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-muted flex items-center gap-1.5 font-medium text-fg">
                    <Info className="h-4 w-4 text-accent shrink-0" />
                    Account Required
                  </p>
                  <p className="text-muted">
                    Sign in to confirm this reservation and keep your bookings synced to the database.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Button */}
          <button
            type="submit"
            disabled={submitting}
            className="btn-accent w-full justify-center py-4 text-base"
          >
            {submitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : user ? (
              "Confirm & Book Reservation"
            ) : (
              "Log in to Book"
            )}
          </button>

          <p className="text-center text-[11px] text-muted flex items-center justify-center gap-1.5">
            <Lock className="h-3 w-3" /> Secure booking · Free cancellation up to 48h before check-in
          </p>
        </div>
      </form>
    </div>
  );
}

