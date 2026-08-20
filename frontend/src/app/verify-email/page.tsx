"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { verifyEmail, ApiError } from "@/lib/api";

// useSearchParams() opts this page out of static rendering unless wrapped in
// Suspense — see https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailStatus />
    </Suspense>
  );
}

function VerifyEmailStatus() {
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
  const [error, setError] = useState<string | null>(null);
  // Effects run twice in dev (React Strict Mode) — the token is single-use, so a
  // second real request would fail even though the first one succeeded.
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    if (!uid || !token) {
      setStatus("error");
      setError("This link is missing its verification token.");
      return;
    }

    verifyEmail(uid, token)
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error");
        setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      });
  }, [uid, token]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16 text-center">
      {status === "pending" && (
        <>
          <Loader2 className="mx-auto animate-spin text-muted" size={32} />
          <p className="mt-4 text-sm text-muted">Verifying your email...</p>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle className="mx-auto text-accent" size={32} />
          <h1 className="font-display mt-4 text-3xl text-foreground">Email verified</h1>
          <p className="mt-3 text-sm text-muted">Your email address has been confirmed.</p>
          <Link href="/" className="mt-8 text-sm text-accent underline-offset-4 hover:underline">
            Continue to Aurelia Estates
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <XCircle className="mx-auto text-red-500" size={32} />
          <h1 className="font-display mt-4 text-3xl text-foreground">Verification failed</h1>
          <p className="mt-3 text-sm text-muted">{error}</p>
          <p className="mt-6 text-sm text-muted">
            You can request a new link from your{" "}
            <Link href="/dashboard/security" className="text-accent underline-offset-4 hover:underline">
              account security settings
            </Link>
            .
          </p>
        </>
      )}
    </div>
  );
}
