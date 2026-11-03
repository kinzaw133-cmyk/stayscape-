"use client";
import dynamic from "next/dynamic";

// Leaflet needs the browser, so the map loads client-side only.
export default dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => <div className="h-[520px] animate-pulse rounded-3xl bg-surface" />,
});
