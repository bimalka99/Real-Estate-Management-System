"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, Loader2, CheckCircle } from "lucide-react";
import { resetPassword, ApiError } from "@/lib/api";

// useSearchParams() opts this page out of static rendering unless wrapped in
// Suspense — see https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!uid || !token) return;

    setIsSubmitting(true);
    setError(null);

    const data = new FormData(event.currentTarget);
    const newPassword = String(data.get("password"));
    const confirm = String(data.get("confirmPassword"));

    if (newPassword !== confirm) {
      setError("Passwords don't match.");
      setIsSubmitting(false);
      return;
    }

    try {
      await resetPassword(uid, token, newPassword);
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err) {
      if (err instanceof ApiError) {
        const firstFieldError = err.errors ? Object.values(err.errors)[0]?.[0] : undefined;
        setError(firstFieldError ?? err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!uid || !token) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16 text-center">
        <p className="text-sm text-muted">
          This link is missing its reset token.{" "}
          <Link href="/forgot-password" className="text-accent underline-offset-4 hover:underline">
            Request a new one
          </Link>
          .
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16 text-center">
        <CheckCircle className="mx-auto text-accent" size={32} />
        <h1 className="font-display mt-4 text-3xl text-foreground">Password reset</h1>
        <p className="mt-3 text-sm text-muted">Taking you to sign in...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <KeyRound className="text-accent" size={28} />
      <h1 className="font-display mt-3 text-4xl text-foreground">Reset Password</h1>
      <p className="mt-2 text-sm text-muted">Choose a new password for your account.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-1.5 block text-xs text-muted">New password</label>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoFocus
            className="w-full border border-border bg-surface px-4 py-3 text-sm focus:border-accent focus:outline-none"
          />
          <p className="mt-1 text-xs text-muted">At least 8 characters.</p>
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-muted">Confirm new password</label>
          <input
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            className="w-full border border-border bg-surface px-4 py-3 text-sm focus:border-accent focus:outline-none"
          />
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 bg-accent px-6 py-3 text-sm uppercase tracking-wide text-accent-foreground transition-colors hover:bg-accent-dark disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
          {isSubmitting ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}
