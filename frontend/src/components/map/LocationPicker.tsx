"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Loader2, MapPin } from "lucide-react";

const LocationPickerInner = dynamic(() => import("@/components/map/LocationPickerInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-surface-muted">
      <Loader2 className="animate-spin text-muted" size={20} />
    </div>
  ),
});

/**
 * Renders hidden `latitude`/`longitude` inputs so it drops into the existing
 * FormData-based dashboard forms (see /dashboard/new, /dashboard/edit/[id])
 * without changing how those forms read their fields.
 */
export default function LocationPicker({
  initialLatitude,
  initialLongitude,
}: {
  initialLatitude?: number | null;
  initialLongitude?: number | null;
}) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    initialLatitude != null && initialLongitude != null
      ? { lat: initialLatitude, lng: initialLongitude }
      : null,
  );

  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs text-muted">
        <MapPin size={13} /> Location — click the map to set a pin (optional)
      </label>

      <div className="h-64 w-full overflow-hidden border border-border">
        <LocationPickerInner
          initialLatitude={initialLatitude}
          initialLongitude={initialLongitude}
          onChange={(lat, lng) => setCoords({ lat, lng })}
        />
      </div>

      {coords && (
        <p className="mt-1.5 text-xs text-muted">
          Pin set at {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
        </p>
      )}

      <input type="hidden" name="latitude" value={coords?.lat ?? ""} />
      <input type="hidden" name="longitude" value={coords?.lng ?? ""} />
    </div>
  );
}
