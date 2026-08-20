"use client";

import { useEffect, useState } from "react";
import { UserPlus, Loader2, Clock } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { joinAgency, getMyJoinRequest, ApiError } from "@/lib/api";
import type { AgencyJoinRequestDto } from "@/lib/types";

export default function JoinAgencyButton({ agencyId }: { agencyId: string }) {
  const { user, accessToken, isLoading: authLoading } = useAuth();
  const [isJoining, setIsJoining] = useState(false);
  const [myRequest, setMyRequest] = useState<AgencyJoinRequestDto | null | undefined>(undefined); // undefined = loading
  const [error, setError] = useState<string | null>(null);

  const eligible =
    !!user && ["Agent", "AgencyAdmin", "SuperAdmin"].includes(user.role) && !user.agencyId;

  useEffect(() => {
    if (!accessToken || !eligible) {
      setMyRequest(null);
      return;
    }
    getMyJoinRequest(accessToken).then(setMyRequest).catch(() => setMyRequest(null));
  }, [accessToken, eligible]);

  // Only signed-in agents without an agency already can request to join.
  if (authLoading) return null;
  if (!eligible) return null;
  if (myRequest === undefined) return null;

  async function handleJoin() {
    if (!accessToken) return;
    setIsJoining(true);
    setError(null);
    try {
      await joinAgency(accessToken, agencyId);
      setMyRequest({
        id: "",
        agencyId,
        agencyName: "",
        userId: user!.id,
        userName: "",
        userEmail: "",
        status: "Pending",
        createdAtUtc: new Date().toISOString(),
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't send that request.");
    } finally {
      setIsJoining(false);
    }
  }

  if (myRequest) {
    if (myRequest.agencyId === agencyId) {
      return (
        <p className="flex items-center gap-1.5 text-sm text-accent">
          <Clock size={15} /> Your request to join is pending approval.
        </p>
      );
    }
    return (
      <p className="text-sm text-muted">
        You have a pending request with another agency — withdraw it by waiting for a
        response before requesting to join this one.
      </p>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleJoin}
        disabled={isJoining}
        className="flex items-center gap-2 border border-accent px-6 py-2.5 text-sm uppercase tracking-wide text-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
      >
        {isJoining ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />}
        {isJoining ? "Sending..." : "Request to Join"}
      </button>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
