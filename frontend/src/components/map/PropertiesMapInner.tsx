"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import Link from "next/link";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { goldPinIcon } from "@/components/map/mapIcon";
import { formatPrice } from "@/lib/format";
import type { PropertyDto } from "@/lib/types";

type MappablePropertyDto = PropertyDto & { latitude: number; longitude: number };

/** Fits the map's viewport to every marker once, on mount/whenever the result set changes. */
function FitToMarkers({ properties }: { properties: MappablePropertyDto[] }) {
  const map = useMap();

  useEffect(() => {
    if (properties.length === 0) return;
    const bounds = L.latLngBounds(properties.map((p) => [p.latitude, p.longitude]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  }, [map, properties]);

  return null;
}

export default function PropertiesMapInner({ properties }: { properties: PropertyDto[] }) {
  const mappable = properties.filter(
    (p): p is MappablePropertyDto => p.latitude != null && p.longitude != null,
  );

  // Fallback center (roughly the continental US) for an empty/no-coordinates result
  // set, so the map still renders something reasonable instead of an invalid center.
  const center: [number, number] =
    mappable.length > 0 ? [mappable[0].latitude, mappable[0].longitude] : [39.8, -98.6];

  return (
    <MapContainer center={center} zoom={mappable.length > 0 ? 12 : 4} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitToMarkers properties={mappable} />
      {mappable.map((property) => {
        const cover = property.images.find((img) => img.isCover)?.url ?? property.images[0]?.url;
        return (
          <Marker key={property.id} position={[property.latitude, property.longitude]} icon={goldPinIcon}>
            <Popup minWidth={200}>
              <Link href={`/properties/${property.id}`} className="block no-underline">
                {cover && (
                  // eslint-disable-next-line @next/next/no-img-element -- inside a Leaflet
                  // popup, which next/image can't size correctly (no layout container)
                  <img src={cover} alt={property.title} className="mb-2 h-24 w-full rounded-none object-cover" />
                )}
                <p className="text-sm font-medium text-neutral-900">{formatPrice(property.price, property.currency)}</p>
                <p className="line-clamp-1 text-xs text-neutral-600">{property.title}</p>
              </Link>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
