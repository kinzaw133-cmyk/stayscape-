import { NextResponse } from "next/server";
import { z } from "zod";
import { applyQuery } from "@/lib/types";
import { fetchHotels } from "@/lib/data";

const schema = z.object({
  q: z.string().max(100).default(""),
  maxPrice: z.coerce.number().min(0).default(100000),
  minRating: z.coerce.number().min(0).max(5).default(0),
  amenities: z.string().default(""),
  sort: z.enum(["rating", "price-asc", "price-desc"]).default("rating"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(6),
});

export async function GET(req: Request) {
  const parsed = schema.safeParse(Object.fromEntries(new URL(req.url).searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Check the filter values and try again." }, { status: 400 });
  }
  const { amenities, ...rest } = parsed.data;
  try {
    const hotels = await fetchHotels();
    return NextResponse.json(
      applyQuery(hotels, { ...rest, amenities: amenities ? amenities.split(",").filter(Boolean) : [] }),
    );
  } catch (err) {
    console.error("GET /api/hotels failed:", err);
    return NextResponse.json({ error: "Hotels could not be loaded. Try again shortly." }, { status: 500 });
  }
}
