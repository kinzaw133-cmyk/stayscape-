import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Mountain, Plane, Quote, Sparkles, Waves } from "lucide-react";
import HotelCard from "@/components/HotelCard";
import { HeroSearch, Newsletter } from "@/components/Forms";
import { fetchHotels } from "@/lib/data";

const HERO = "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=80";

const FACILITIES: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Waves, title: "Pools and beaches", text: "Lagoon pools, private beach access and sunset decks." },
  { icon: Mountain, title: "Mountain retreats", text: "Chalets and cottages with ski access and wide views." },
  { icon: Sparkles, title: "Spa and wellness", text: "Treatment rooms, steam, and quiet gardens to unwind." },
  { icon: Plane, title: "Airport transfers", text: "Filter for hotels that offer a shuttle from the airport." },
];

const REVIEWS = [
  { quote: "The villa felt private and the staff remembered our names by the second morning.", name: "Amara K.", trip: "Maldives, 5 nights" },
  { quote: "Finding a hotel by price and amenities took minutes. The map helped us pick the right valley.", name: "Lukas M.", trip: "Zermatt, 3 nights" },
  { quote: "A calm, beautiful place. The filters showed exactly which resorts had a spa.", name: "Priya S.", trip: "Como, 4 nights" },
];

export default async function Home() {
  const hotels = await fetchHotels();
  const featured = [...hotels].sort((a, b) => b.rating - a.rating).slice(0, 3);

  const byCity = new Map<string, { city: string; country: string; count: number }>();
  for (const h of hotels) {
    const c = byCity.get(h.city) ?? { city: h.city, country: h.country, count: 0 };
    c.count += 1;
    byCity.set(h.city, c);
  }
  const destinations = [...byCity.values()];

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <img src={HERO} alt="" aria-hidden="true" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-bg via-bg/70 to-bg/20" />
        <div className="mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-end gap-10 px-6 pb-14 pt-40">
          <div className="max-w-2xl space-y-5">
            <h1 className="font-display text-6xl leading-[1.02] md:text-7xl">Stay somewhere worth remembering.</h1>
            <p className="max-w-xl text-lg text-muted">
              Handpicked hotels and resorts, clear room prices, and maps that show exactly where you will wake up.
            </p>
          </div>
          <HeroSearch />
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-8 px-6 py-20">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-4xl">Featured stays</h2>
          <Link href="/explore" className="text-sm text-accent underline-offset-4 hover:underline">See all hotels</Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {featured.map((h) => <HotelCard key={h.id} h={h} featured />)}
        </div>
      </section>

      <section id="destinations" className="mx-auto max-w-6xl scroll-mt-28 space-y-8 px-6 pb-20">
        <h2 className="font-display text-4xl">Popular destinations</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((d) => (
            <Link key={d.city} href={`/explore?q=${encodeURIComponent(d.city)}`} className="glass flex items-center justify-between rounded-2xl p-6 transition hover:border-accent">
              <span>
                <span className="font-display block text-2xl">{d.city}</span>
                <span className="text-sm text-muted">{d.country}</span>
              </span>
              <span className="text-sm text-muted">{d.count} {d.count === 1 ? "stay" : "stays"}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-fg/10 bg-surface/40">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-4">
          {FACILITIES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="space-y-3">
              <Icon className="h-7 w-7 text-accent" />
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-8 px-6 py-20">
        <h2 className="font-display text-4xl">What guests say</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {REVIEWS.map((r) => (
            <figure key={r.name} className="glass rounded-3xl p-7">
              <Quote className="mb-4 h-6 w-6 text-accent" />
              <blockquote className="text-muted">{r.quote}</blockquote>
              <figcaption className="mt-5 text-sm"><span className="font-semibold text-fg">{r.name}</span> · {r.trip}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="glass grid gap-6 rounded-[2rem] p-8 md:grid-cols-2 md:items-center md:p-12">
          <div className="space-y-3">
            <h2 className="font-display text-4xl">New stays in your inbox</h2>
            <p className="text-muted">Hear first about newly listed hotels and resorts. We send only new stays.</p>
          </div>
          <Newsletter />
        </div>
      </section>
    </>
  );
}
