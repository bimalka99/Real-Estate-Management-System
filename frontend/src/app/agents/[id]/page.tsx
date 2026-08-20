import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Mail, Phone, Building2 } from "lucide-react";
import { getAgentById, getProperties, getReviewsForAgent } from "@/lib/api";
import PropertyCard from "@/components/property/PropertyCard";
import StarRating from "@/components/agent/StarRating";
import ReviewsSection from "@/components/agent/ReviewsSection";

function initials(fullName: string): string {
  return fullName
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export async function generateMetadata(
  props: PageProps<"/agents/[id]">,
): Promise<Metadata> {
  const { id } = await props.params;
  const agent = await getAgentById(id);

  return {
    title: agent ? `${agent.fullName} | Aurelia Estates` : "Agent | Aurelia Estates",
    description: agent?.bio ?? undefined,
  };
}

export default async function AgentProfilePage(props: PageProps<"/agents/[id]">) {
  const { id } = await props.params;
  const agent = await getAgentById(id);

  if (!agent) {
    notFound();
  }

  const [listings, reviews] = await Promise.all([
    getProperties({ agentId: agent.id, pageSize: 50 }).catch(() => null),
    getReviewsForAgent(agent.id).catch(() => []),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
      <div className="flex flex-col items-center gap-6 border border-border bg-surface p-10 text-center sm:flex-row sm:text-left">
        <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full bg-surface-muted">
          {agent.avatarUrl ? (
            <Image src={agent.avatarUrl} alt={agent.fullName} fill sizes="128px" className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-display text-3xl text-accent">
              {initials(agent.fullName)}
            </div>
          )}
        </div>

        <div>
          <h1 className="font-display text-3xl text-foreground sm:text-4xl">{agent.fullName}</h1>

          {agent.reviewCount > 0 && agent.averageRating != null && (
            <div className="mt-2 flex items-center justify-center gap-2 sm:justify-start">
              <StarRating rating={agent.averageRating} />
              <span className="text-xs text-muted">
                {agent.averageRating.toFixed(1)} ({agent.reviewCount} {agent.reviewCount === 1 ? "review" : "reviews"})
              </span>
            </div>
          )}

          {agent.agencyName && (
            <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-muted sm:justify-start">
              <Building2 size={15} /> {agent.agencyName}
            </p>
          )}
          {agent.bio && <p className="mt-4 max-w-lg text-sm text-muted">{agent.bio}</p>}

          <div className="mt-5 flex flex-wrap justify-center gap-5 text-sm sm:justify-start">
            <a href={`mailto:${agent.email}`} className="flex items-center gap-1.5 text-foreground/80 hover:text-accent">
              <Mail size={15} /> {agent.email}
            </a>
            {agent.phoneNumber && (
              <a href={`tel:${agent.phoneNumber}`} className="flex items-center gap-1.5 text-foreground/80 hover:text-accent">
                <Phone size={15} /> {agent.phoneNumber}
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="font-display text-2xl text-foreground">
          {agent.listingCount} {agent.listingCount === 1 ? "Listing" : "Listings"}
        </h2>

        {!listings || listings.items.length === 0 ? (
          <div className="mt-8 border border-dashed border-border p-16 text-center">
            <p className="text-sm text-muted">No active listings right now.</p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {listings.items.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-16 max-w-2xl">
        <ReviewsSection agentId={agent.id} initialReviews={reviews} />
      </div>
    </div>
  );
}
