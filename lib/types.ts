export type Room = { id: string; name: string; price: number; capacity: number; beds: string };

export type Hotel = {
  id: string; slug: string; name: string; city: string; country: string; description: string;
  rating: number; reviews: number; lat: number; lng: number; image: string;
  amenities: string[]; rooms: Room[]; from: number;
};

export const AMENITIES = [
  "Pool", "Spa", "Gym", "Beach Access", "Restaurant", "Bar", "Free Wi-Fi", "Ski Access", "Airport Shuttle",
] as const;

export type Sort = "rating" | "price-asc" | "price-desc";

export type Query = {
  q: string; maxPrice: number; minRating: number; amenities: string[];
  sort: Sort; page: number; pageSize: number;
};

export const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

// Pure filtering, sorting and pagination. Prices come from server data, never from the client.
export function applyQuery(hotels: Hotel[], o: Query) {
  const q = o.q.trim().toLowerCase();
  const list = hotels
    .filter(
      (h) =>
        (!q || `${h.name} ${h.city} ${h.country}`.toLowerCase().includes(q)) &&
        h.from <= o.maxPrice &&
        h.rating >= o.minRating &&
        o.amenities.every((a) => h.amenities.includes(a)),
    )
    .sort((a, b) =>
      o.sort === "price-asc" ? a.from - b.from : o.sort === "price-desc" ? b.from - a.from : b.rating - a.rating,
    );
  const totalPages = Math.max(1, Math.ceil(list.length / o.pageSize));
  const page = Math.min(o.page, totalPages);
  return {
    items: list.slice((page - 1) * o.pageSize, page * o.pageSize),
    total: list.length,
    page,
    totalPages,
  };
}
