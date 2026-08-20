import type { Metadata } from "next";
import { getAgents } from "@/lib/api";
import AgentCard from "@/components/agent/AgentCard";
import type { AgentDto } from "@/lib/types";

export const metadata: Metadata = {
  title: "Our Agents | Aurelia Estates",
  description: "Meet the advisors behind our portfolio of exceptional homes.",
};

export default async function AgentsPage() {
  let agents: AgentDto[] = [];
  try {
    agents = await getAgents();
  } catch {
    agents = [];
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
      <p className="text-xs uppercase tracking-[0.3em] text-accent">Our Advisors</p>
      <h1 className="font-display mt-3 text-4xl text-foreground sm:text-5xl">Meet the Team</h1>
      <p className="mt-4 max-w-xl text-sm text-muted">
        Dedicated professionals with deep market knowledge and a discreet, tailored
        approach to every transaction.
      </p>

      {agents.length === 0 ? (
        <div className="mt-14 border border-dashed border-border p-16 text-center">
          <p className="text-sm text-muted">No agents to show yet.</p>
        </div>
      ) : (
        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}
    </div>
  );
}
