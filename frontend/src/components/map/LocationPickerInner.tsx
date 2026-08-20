"use client";

import { useState } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { goldPinIcon } from "@/components/map/mapIcon";

const DEFAULT_CENTER: [number, number] = [40.7128, -74.006]; // New York — arbitrary starting point

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPickerInner({
  initialLatitude,
  initialLongitude,
  onChange,
}: {
  initialLatitude?: number | null;
  initialLongitude?: number | null;
  onChange: (lat: number, lng: number) => void;
}) {
  const [position, setPosition] = useState<[number, number] | null>(
    initialLatitude != null && initialLongitude != null ? [initialLatitude, initialLongitude] : null,
  );

  function handlePick(lat: number, lng: number) {
    setPosition([lat, lng]);
    onChange(lat, lng);
  }

  return (
    <MapContainer
      center={position ?? DEFAULT_CENTER}
      zoom={position ? 14 : 11}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onPick={handlePick} />
      {position && <Marker position={position} icon={goldPinIcon} />}
    </MapContainer>
  );
}
