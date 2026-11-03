import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserBySession, cancelBooking, getBookingById } from "@/lib/db";

export const runtime = "nodejs";

export async function PATCH(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const cookieStore = await cookies();
    const token = cookieStore.get("stayscape_session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const user = getUserBySession(token);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const booking = getBookingById(id);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    if (booking.user_id !== user.id) {
      return NextResponse.json({ error: "You cannot modify this booking." }, { status: 403 });
    }

    cancelBooking(id, user.id);
    return NextResponse.json({ message: "Booking cancelled successfully." });
  } catch (err) {
    console.error("PATCH /api/bookings/[id] error:", err);
    return NextResponse.json({ error: "Could not cancel booking." }, { status: 500 });
  }
}

