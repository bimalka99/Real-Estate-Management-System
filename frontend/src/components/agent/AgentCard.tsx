import Image from "next/image";
import Link from "next/link";
import { Building2 } from "lucide-react";
import type { AgentDto } from "@/lib/types";
import StarRating from "@/components/agent/StarRating";

function initials(fullName: string): string {
  return fullName
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function AgentCard({ agent }: { agent: AgentDto }) {
  return (
    <Link
      href={`/agents/${agent.id}`}
      className="group block border border-border bg-surface p-8 text-center transition-shadow hover:shadow-xl hover:shadow-black/5"
    >
      <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-full bg-surface-muted">
        {agent.avatarUrl ? (
          <Image src={agent.avatarUrl} alt={agent.fullName} fill sizes="96px" className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-display text-2xl text-accent">
            {initials(agent.fullName)}
          </div>
        )}
      </div>

      <h3 className="font-display mt-5 text-xl text-foreground">{agent.fullName}</h3>

      {agent.reviewCount > 0 && agent.averageRating != null && (
        <div className="mt-1.5 flex items-center justify-center gap-1.5">
          <StarRating rating={agent.averageRating} size={12} />
          <span className="text-xs text-muted">({agent.reviewCount})</span>
        </div>
      )}

      {agent.agencyName && (
        <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-muted">
          <Building2 size={14} /> {agent.agencyName}
        </p>
      )}

      <p className="mt-4 text-xs uppercase tracking-[0.2em] text-accent">
        {agent.listingCount} {agent.listingCount === 1 ? "Listing" : "Listings"}
      </p>
    </Link>
  );
}
