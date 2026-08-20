import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Building2, Mail, Phone, Globe } from "lucide-react";
import { getAgencyById, getProperties } from "@/lib/api";
import AgentCard from "@/components/agent/AgentCard";
import PropertyCard from "@/components/property/PropertyCard";
import JoinAgencyButton from "@/components/agency/JoinAgencyButton";

export async function generateMetadata(
  props: PageProps<"/agencies/[id]">,
): Promise<Metadata> {
  const { id } = await props.params;
  const agency = await getAgencyById(id);

  return {
    title: agency ? `${agency.name} | Aurelia Estates` : "Agency | Aurelia Estates",
    description: agency?.description ?? undefined,
  };
}

export default async function AgencyProfilePage(props: PageProps<"/agencies/[id]">) {
  const { id } = await props.params;
  const agency = await getAgencyById(id);

  if (!agency) {
    notFound();
  }

  const listings = await getProperties({ agencyId: agency.id, pageSize: 50 }).catch(() => null);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
      <div className="flex flex-col items-center gap-6 border border-border bg-surface p-10 text-center sm:flex-row sm:text-left">
        <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-muted">
          {agency.logoUrl ? (
            <Image src={agency.logoUrl} alt={agency.name} fill sizes="112px" className="object-cover" />
          ) : (
            <Building2 className="text-accent" size={36} />
          )}
        </div>

        <div>
          <h1 className="font-display text-3xl text-foreground sm:text-4xl">{agency.name}</h1>
          {agency.description && <p className="mt-3 max-w-lg text-sm text-muted">{agency.description}</p>}

          <div className="mt-5 flex flex-wrap justify-center gap-5 text-sm sm:justify-start">
            {agency.email && (
              <a href={`mailto:${agency.email}`} className="flex items-center gap-1.5 text-foreground/80 hover:text-accent">
                <Mail size={15} /> {agency.email}
              </a>
            )}
            {agency.phoneNumber && (
              <a href={`tel:${agency.phoneNumber}`} className="flex items-center gap-1.5 text-foreground/80 hover:text-accent">
                <Phone size={15} /> {agency.phoneNumber}
              </a>
            )}
            {agency.website && (
              <a href={agency.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-foreground/80 hover:text-accent">
                <Globe size={15} /> Website
              </a>
            )}
          </div>

          <div className="mt-5 flex justify-center sm:justify-start">
            <JoinAgencyButton agencyId={agency.id} />
          </div>
        </div>
      </div>

      {agency.agents.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display text-2xl text-foreground">Our Agents</h2>
          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {agency.agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-16">
        <h2 className="font-display text-2xl text-foreground">
          {agency.listingCount} {agency.listingCount === 1 ? "Listing" : "Listings"}
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
    </div>
  );
}
