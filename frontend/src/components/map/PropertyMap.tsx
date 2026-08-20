"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Leaflet touches `window` at module load time, so it can never run during SSR —
// dynamic import with ssr:false is required, not just a "use client" directive.
const PropertyMapInner = dynamic(() => import("@/components/map/PropertyMapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-surface-muted">
      <Loader2 className="animate-spin text-muted" size={20} />
    </div>
  ),
});

export default function PropertyMap(props: { latitude: number; longitude: number; title: string }) {
  return (
    <div className="h-80 w-full overflow-hidden border border-border">
      <PropertyMapInner {...props} />
    </div>
  );
}
