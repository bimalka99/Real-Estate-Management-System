"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import type { PropertyDto } from "@/lib/types";

// Leaflet touches `window` at module load time, so it can never run during SSR —
// dynamic import with ssr:false is required, not just a "use client" directive.
const PropertiesMapInner = dynamic(() => import("@/components/map/PropertiesMapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-surface-muted">
      <Loader2 className="animate-spin text-muted" size={20} />
    </div>
  ),
});

export default function PropertiesMap({ properties }: { properties: PropertyDto[] }) {
  return (
    <div className="h-[32rem] w-full overflow-hidden border border-border">
      <PropertiesMapInner properties={properties} />
    </div>
  );
}
