import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(1000) }))
    .min(1)
    .max(20),
});

const SYSTEM =
  "You are the StayScape concierge. Help guests choose hotels and resorts on StayScape, compare amenities and prices, and explain how to use the site. Online booking and payments are not live yet; say so if asked to book. Keep replies under 80 words.";

// Used when no ANTHROPIC_API_KEY is set or the AI call fails.
function fallback(text: string) {
  const t = text.toLowerCase();
  if (/price|cheap|budget|cost/.test(t))
    return "Use the price slider on the Explore page to set a maximum nightly rate. Prices shown are the lowest room rate per night.";
  if (/book|reserv/.test(t))
    return "Online booking and payments are part of the next build phase. For now you can compare hotels and room prices on Explore.";
  if (/map|near|location/.test(t))
    return "Open Explore and switch to Map view to see where every hotel is located.";
  if (/pool|spa|wi-?fi|amenit|gym|beach/.test(t))
    return "Use the amenity checkboxes on Explore to show only hotels with the facilities you need.";
  return "I can help you find a hotel, compare prices, or explain the site. Try asking about prices, amenities, or the map.";
}

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Send a message to continue." }, { status: 400 });

  const { messages } = parsed.data;
  const last = messages[messages.length - 1].content;
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return NextResponse.json({ reply: fallback(last), source: "fallback" });

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL ?? "claude-haiku-5-5",
        max_tokens: 300,
        system: SYSTEM,
        messages,
      }),
    });
    if (!res.ok) throw new Error(`Anthropic responded ${res.status}`);
    const data = (await res.json()) as { content: { type: string; text?: string }[] };
    const reply = data.content.filter((b) => b.type === "text").map((b) => b.text ?? "").join("\n").trim();
    return NextResponse.json({ reply: reply || fallback(last), source: "ai" });
  } catch (err) {
    console.error("Chat AI call failed:", err);
    return NextResponse.json({ reply: fallback(last), source: "fallback" });
  }
}
