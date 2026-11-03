import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { getUserByEmail, verifyPassword, createSession } from "@/lib/db";

export const runtime = "nodejs";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please provide a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || "Invalid email or password";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const { email, password } = parsed.data;

    const userWithSecret = getUserByEmail(email);
    if (!userWithSecret) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const isValid = verifyPassword(password, userWithSecret.password_hash, userWithSecret.salt);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const token = createSession(userWithSecret.id);

    const cookieStore = await cookies();
    cookieStore.set("stayscape_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return NextResponse.json({
      message: "Logged in successfully.",
      user: {
        id: userWithSecret.id,
        name: userWithSecret.name,
        email: userWithSecret.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Could not log in. Please try again." }, { status: 500 });
  }
}

