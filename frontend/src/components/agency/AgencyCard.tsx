import Image from "next/image";
import Link from "next/link";
import { Building2, Users } from "lucide-react";
import type { AgencyDto } from "@/lib/types";

export default function AgencyCard({ agency }: { agency: AgencyDto }) {
  return (
    <Link
      href={`/agencies/${agency.id}`}
      className="group block border border-border bg-surface p-8 text-center transition-shadow hover:shadow-xl hover:shadow-black/5"
    >
      <div className="relative mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-surface-muted">
        {agency.logoUrl ? (
          <Image src={agency.logoUrl} alt={agency.name} fill sizes="80px" className="object-cover" />
        ) : (
          <Building2 className="text-accent" size={28} />
        )}
      </div>

      <h3 className="font-display mt-5 text-xl text-foreground">{agency.name}</h3>

      {agency.description && (
        <p className="mt-2 line-clamp-2 text-sm text-muted">{agency.description}</p>
      )}

      <div className="mt-4 flex items-center justify-center gap-4 text-xs uppercase tracking-[0.15em] text-accent">
        <span className="flex items-center gap-1">
          <Users size={13} /> {agency.agentCount}
        </span>
        <span>{agency.listingCount} Listings</span>
      </div>
    </Link>
  );
}
