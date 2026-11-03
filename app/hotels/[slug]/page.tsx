import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, MapPin, Star } from "lucide-react";
import MapView from "@/components/MapView";
import { fetchHotels } from "@/lib/data";
import { money } from "@/lib/types";

export default async function HotelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const hotel = (await fetchHotels()).find((h) => h.slug === slug);
  if (!hotel) notFound();

  return (
    <article className="mx-auto max-w-6xl space-y-12 px-6 pb-24 pt-14">
      <div className="relative aspect-[21/9] overflow-hidden rounded-[2rem] bg-sage/30">
        {hotel.image && (
          <img src={hotel.image} alt={hotel.name} className="h-full w-full object-cover" />
        )}
      </div>

      <header className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
        <div className="space-y-3">
          <h1 className="font-display text-5xl leading-tight">{hotel.name}</h1>
          <p className="flex items-center gap-2 text-muted"><MapPin className="h-4 w-4" /> {hotel.city}, {hotel.country}</p>
        </div>
        <div className="flex flex-col sm:flex-row md:items-end gap-3 md:justify-end">
          <p className="flex items-center gap-2 text-fg">
            <Star className="h-4 w-4 fill-accent text-accent" /> {hotel.rating.toFixed(1)}
            <span className="text-muted">· {hotel.reviews} reviews</span>
          </p>
          <Link
            href={`/book?hotel=${hotel.slug}`}
            className="btn-accent inline-flex items-center gap-2 text-sm"
          >
            <Calendar className="h-4 w-4" /> Reserve Stay
          </Link>
        </div>
      </header>

      <p className="max-w-2xl text-lg leading-relaxed text-muted">{hotel.description}</p>

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-3xl">Available Rooms</h2>
          <span className="text-xs text-muted">All rates include complimentary Wi-Fi</span>
        </div>
        <div className="glass divide-y divide-fg/10 rounded-3xl">
          {hotel.rooms.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-4 p-6">
              <div>
                <h3 className="text-lg font-semibold">{r.name}</h3>
                <p className="text-sm text-muted">{r.beds} · sleeps up to {r.capacity} guests</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-right">
                  <span className="text-xl font-semibold text-accent">{money(r.price)}</span>
                  <span className="text-xs text-muted block">per night</span>
                </p>
                <Link
                  href={`/book?hotel=${hotel.slug}&room=${r.id}`}
                  className="btn-accent text-xs px-4 py-2"
                >
                  Book this room
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-3xl">Amenities</h2>
        <ul className="flex flex-wrap gap-2">
          {hotel.amenities.map((a) => (
            <li key={a} className="rounded-full border border-fg/15 px-4 py-1.5 text-sm">{a}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-3xl">Location</h2>
        <MapView hotels={[hotel]} height={380} />
      </section>
    </article>
  );
}
