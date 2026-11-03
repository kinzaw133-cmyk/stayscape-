import { createClient } from "@supabase/supabase-js";
import type { Hotel, Room } from "./types";

// Server-only. Uses Supabase when configured, otherwise built-in demo hotels so the site runs with zero setup.
export const db =
  process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, { auth: { persistSession: false } })
    : null;

type SeedRoom = [name: string, price: number, capacity: number, beds: string];
type SeedHotel = Omit<Hotel, "id" | "from" | "rooms"> & { rooms: SeedRoom[] };

const photo = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1400&q=80`;

const SEED: SeedHotel[] = [
  { slug: "aqua-bay-resort", name: "Aqua Bay Resort", city: "Male Atoll", country: "Maldives", description: "Overwater villas, a coral lagoon and a spa built on the reef.", rating: 4.9, reviews: 812, lat: 4.1755, lng: 73.5093, image: photo("1566073771259-6a8506099945"), amenities: ["Pool", "Spa", "Beach Access", "Restaurant", "Free Wi-Fi"], rooms: [["Overwater Villa", 640, 2, "1 King Bed"], ["Beach Pavilion", 410, 3, "1 King Bed + Sofa"]] },
  { slug: "alpine-crest-lodge", name: "Alpine Crest Lodge", city: "Zermatt", country: "Switzerland", description: "Chalet rooms beneath the Matterhorn with ski-in, ski-out access.", rating: 4.8, reviews: 540, lat: 46.0207, lng: 7.7491, image: photo("1520250497591-112f2f40a3f4"), amenities: ["Ski Access", "Spa", "Restaurant", "Bar", "Free Wi-Fi"], rooms: [["Mountain Chalet", 520, 2, "1 King Bed"], ["Family Loft", 780, 4, "2 Queen Beds"]] },
  { slug: "banyan-ridge-villas", name: "Banyan Ridge Villas", city: "Ubud", country: "Bali, Indonesia", description: "Private pool villas wrapped in rice terraces and jungle.", rating: 4.7, reviews: 396, lat: -8.5069, lng: 115.2625, image: photo("1582719478250-c89cae4dc85b"), amenities: ["Pool", "Spa", "Gym", "Free Wi-Fi", "Restaurant"], rooms: [["Garden Pool Villa", 290, 2, "1 King Bed"], ["Ridge Suite", 460, 2, "1 King Bed"]] },
  { slug: "desert-pearl-hotel", name: "Desert Pearl Hotel", city: "Dubai", country: "UAE", description: "A skyline hotel with a rooftop pool and a private beach club.", rating: 4.6, reviews: 1205, lat: 25.1972, lng: 55.2744, image: photo("1542314831-068cd1dbfeeb"), amenities: ["Pool", "Gym", "Bar", "Airport Shuttle", "Beach Access"], rooms: [["City Deluxe", 230, 2, "1 King Bed"], ["Skyline Suite", 420, 3, "1 King Bed + Sofa"]] },
  { slug: "lakeside-serene-como", name: "Lakeside Serene", city: "Como", country: "Italy", description: "Lake-view suites, a historic garden and slow lakeside dining.", rating: 4.7, reviews: 318, lat: 45.8081, lng: 9.0852, image: photo("1551882547-ff40c63fe5fa"), amenities: ["Restaurant", "Bar", "Spa", "Free Wi-Fi"], rooms: [["Lake View Room", 350, 2, "1 Queen Bed"], ["Garden Suite", 510, 3, "1 King Bed + Sofa"]] },
  { slug: "himalaya-pine-retreat", name: "Himalaya Pine Retreat", city: "Murree", country: "Pakistan", description: "Hillside cottages among pine forests with mountain views.", rating: 4.5, reviews: 214, lat: 33.9067, lng: 73.3943, image: photo("1571896349842-33c89424de2d"), amenities: ["Restaurant", "Free Wi-Fi", "Bar"], rooms: [["Pine Cottage", 95, 2, "1 Queen Bed"], ["Family Cottage", 160, 4, "2 Queen Beds"]] },
];

type Row = {
  id: string; slug: string; name: string; city: string; country: string; description: string;
  rating: number; review_count: number; lat: number; lng: number; image_url: string | null;
  amenities: string[]; rooms: { id: string; name: string; price_per_night: number; capacity: number; beds: string }[];
};

function build(base: Omit<Hotel, "id" | "rooms" | "from">, id: string, rooms: Room[]): Hotel {
  return { ...base, id, rooms, from: rooms.length ? Math.min(...rooms.map((r) => r.price)) : 0 };
}

function fromSeed(s: SeedHotel): Hotel {
  const rooms = s.rooms.map(([name, price, capacity, beds], i) => ({ id: `${s.slug}-${i}`, name, price, capacity, beds }));
  const { rooms: _ignored, ...base } = s;
  return build(base, s.slug, rooms);
}

function fromRow(r: Row): Hotel {
  const rooms = r.rooms.map((x) => ({ id: x.id, name: x.name, price: x.price_per_night, capacity: x.capacity, beds: x.beds }));
  return build(
    {
      slug: r.slug, name: r.name, city: r.city, country: r.country, description: r.description,
      rating: Number(r.rating), reviews: r.review_count, lat: r.lat, lng: r.lng,
      image: r.image_url ?? "", amenities: r.amenities,
    },
    r.id,
    rooms,
  );
}

export async function fetchHotels(): Promise<Hotel[]> {
  if (!db) return SEED.map(fromSeed);
  const { data, error } = await db
    .from("hotels")
    .select("id,slug,name,city,country,description,rating,review_count,lat,lng,image_url,amenities,rooms(id,name,price_per_night,capacity,beds)")
    .eq("published", true);
  if (error) throw new Error(error.message);
  return ((data ?? []) as Row[]).map(fromRow);
}
