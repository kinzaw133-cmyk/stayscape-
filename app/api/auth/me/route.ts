import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserBySession } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("stayscape_session")?.value;
    if (!token) {
      return NextResponse.json({ user: null });
    }

    const user = getUserBySession(token);
    if (!user) {
      cookieStore.delete("stayscape_session");
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user });
  } catch (err) {
    console.error("Auth me error:", err);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}

