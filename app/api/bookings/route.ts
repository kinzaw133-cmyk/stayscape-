import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { getUserBySession, createBooking, getUserBookings } from "@/lib/db";
import { fetchHotels } from "@/lib/data";

export const runtime = "nodejs";

const bookingSchema = z.object({
  hotelSlug: z.string().min(1, "Hotel is required"),
  roomId: z.string().min(1, "Room type is required"),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid check-in date"),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid check-out date"),
  guests: z.coerce.number().int().min(1, "At least 1 guest is required"),
  specialRequests: z.string().max(500).optional(),
});

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("stayscape_session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const user = getUserBySession(token);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const bookings = getUserBookings(user.id);
    return NextResponse.json({ bookings });
  } catch (err) {
    console.error("GET /api/bookings error:", err);
    return NextResponse.json({ error: "Could not fetch bookings." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("stayscape_session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Please log in to complete your booking." }, { status: 401 });
    }

    const user = getUserBySession(token);
    if (!user) {
      return NextResponse.json({ error: "Please log in to complete your booking." }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const parsed = bookingSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || "Invalid booking data.";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const { hotelSlug, roomId, checkIn, checkOut, guests, specialRequests } = parsed.data;

    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = checkOutDate.getTime() - checkInDate.getTime();
    const nights = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (isNaN(nights) || nights < 1) {
      return NextResponse.json({ error: "Check-out date must be at least 1 day after check-in." }, { status: 400 });
    }

    // Verify hotel and room
    const hotels = await fetchHotels();
    const hotel = hotels.find((h) => h.slug === hotelSlug);
    if (!hotel) {
      return NextResponse.json({ error: "Selected hotel does not exist." }, { status: 404 });
    }

    const room = hotel.rooms.find((r) => r.id === roomId);
    if (!room) {
      return NextResponse.json({ error: "Selected room does not exist for this hotel." }, { status: 404 });
    }

    if (guests > room.capacity) {
      return NextResponse.json({
        error: `This room accommodates up to ${room.capacity} guests. Please select a larger room or reduce guests.`,
      }, { status: 400 });
    }

    const totalPrice = nights * room.price;

    const booking = createBooking({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      hotelSlug: hotel.slug,
      hotelName: hotel.name,
      hotelCity: hotel.city,
      hotelCountry: hotel.country,
      hotelImage: hotel.image,
      roomId: room.id,
      roomName: room.name,
      roomPrice: room.price,
      checkIn,
      checkOut,
      guests,
      nights,
      totalPrice,
      specialRequests,
    });

    return NextResponse.json({
      message: "Booking confirmed successfully!",
      booking,
    });
  } catch (err) {
    console.error("POST /api/bookings error:", err);
    return NextResponse.json({ error: "Could not create booking. Please try again." }, { status: 500 });
  }
}

