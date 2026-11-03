import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { money, type Hotel } from "@/lib/types";

const pin = L.divIcon({
  className: "",
  html: '<div style="width:22px;height:22px;border-radius:9999px;background:#D4AF37;border:3px solid #0B3D2E;box-shadow:0 0 0 4px rgba(212,175,55,.35)"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

export default function Map({ hotels, height = 520 }: { hotels: Hotel[]; height?: number }) {
  const single = hotels.length === 1;
  const center: [number, number] = single ? [hotels[0].lat, hotels[0].lng] : [20, 10];
  return (
    <MapContainer center={center} zoom={single ? 10 : 2} scrollWheelZoom style={{ height }} className="z-0 rounded-3xl">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {hotels.map((h) => (
        <Marker key={h.id} position={[h.lat, h.lng]} icon={pin}>
          <Popup>
            <div style={{ color: "#0B3D2E", minWidth: 160 }}>
              <strong>{h.name}</strong>
              <div>{h.rating.toFixed(1)} rating · from {money(h.from)}</div>
              <Link href={`/hotels/${h.slug}`} style={{ textDecoration: "underline" }}>View hotel</Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
