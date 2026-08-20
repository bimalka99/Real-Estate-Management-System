import type { Metadata } from "next";
import { getAgencies } from "@/lib/api";
import AgencyCard from "@/components/agency/AgencyCard";
import type { AgencyDto } from "@/lib/types";

export const metadata: Metadata = {
  title: "Agencies | Aurelia Estates",
  description: "Browse the agencies representing our portfolio of homes.",
};

export default async function AgenciesPage() {
  let agencies: AgencyDto[] = [];
  try {
    agencies = await getAgencies();
  } catch {
    agencies = [];
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
      <p className="text-xs uppercase tracking-[0.3em] text-accent">Our Partners</p>
      <h1 className="font-display mt-3 text-4xl text-foreground sm:text-5xl">Agencies</h1>
      <p className="mt-4 max-w-xl text-sm text-muted">
        Independent agencies and boutique advisories representing our network of agents.
      </p>

      {agencies.length === 0 ? (
        <div className="mt-14 border border-dashed border-border p-16 text-center">
          <p className="text-sm text-muted">No agencies to show yet.</p>
        </div>
      ) : (
        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {agencies.map((agency) => (
            <AgencyCard key={agency.id} agency={agency} />
          ))}
        </div>
      )}
    </div>
  );
}
