import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/data";

const schema = z.object({ email: z.string().trim().toLowerCase().email().max(254) });

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

  if (!db) {
    console.info("Newsletter signup (Supabase not configured):", parsed.data.email);
    return NextResponse.json({ message: "Subscribed in demo mode. Connect Supabase to store subscribers." });
  }
  const { error } = await db.from("newsletter_subscribers").insert({ email: parsed.data.email });
  if (error && error.code !== "23505") {
    return NextResponse.json({ error: "Could not subscribe right now. Try again." }, { status: 500 });
  }
  return NextResponse.json({ message: "You are subscribed. Watch your inbox for new stays." });
}
