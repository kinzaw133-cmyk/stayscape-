import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteSession } from "@/lib/db";

export const runtime = "nodejs";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("stayscape_session")?.value;
    if (token) {
      deleteSession(token);
    }
    cookieStore.delete("stayscape_session");
    return NextResponse.json({ message: "Logged out successfully." });
  } catch (err) {
    console.error("Logout error:", err);
    return NextResponse.json({ error: "Failed to log out." }, { status: 500 });
  }
}

