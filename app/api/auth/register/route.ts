import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { createUser, getUserByEmail, createSession } from "@/lib/db";

export const runtime = "nodejs";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().toLowerCase().email("Please provide a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || "Invalid input data";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const { name, email, password } = parsed.data;

    const existing = getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const user = createUser(name, email, password);
    const token = createSession(user.id);

    const cookieStore = await cookies();
    cookieStore.set("stayscape_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return NextResponse.json({
      message: "Account created successfully.",
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Could not create account. Please try again." }, { status: 500 });
  }
}

