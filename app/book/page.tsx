import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { fetchHotels } from "@/lib/data";
import BookingForm from "@/components/BookingForm";

export const metadata = {
  title: "Book a Stay | StayScape",
  description: "Reserve your room at our handpicked luxury hotels and resorts.",
};

export default async function BookPage() {
  const hotels = await fetchHotels();

  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      }
    >
      <BookingForm hotels={hotels} />
    </Suspense>
  );
}

