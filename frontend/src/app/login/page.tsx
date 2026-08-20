"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, Loader2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";

export default function LoginPage() {
  const { login, completeTwoFactorLogin } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [awaitingTwoFactor, setAwaitingTwoFactor] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const data = new FormData(event.currentTarget);
    try {
      const { requiresTwoFactor } = await login(String(data.get("email")), String(data.get("password")));
      if (requiresTwoFactor) {
        setAwaitingTwoFactor(true);
      } else {
        router.push("/");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleTwoFactorSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const data = new FormData(event.currentTarget);
    try {
      await completeTwoFactorLogin(String(data.get("code")));
      router.push("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (awaitingTwoFactor) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
        <ShieldCheck className="text-accent" size={28} />
        <h1 className="font-display mt-3 text-4xl text-foreground">Two-Factor Code</h1>
        <p className="mt-2 text-sm text-muted">
          Enter the 6-digit code from your authenticator app, or one of your recovery codes.
        </p>

        <form onSubmit={handleTwoFactorSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs text-muted">Code</label>
            <input
              name="code"
              type="text"
              inputMode="text"
              autoFocus
              required
              placeholder="123456"
              className="w-full border border-border bg-surface px-4 py-3 text-center text-lg tracking-[0.3em] focus:border-accent focus:outline-none"
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 bg-accent px-6 py-3 text-sm uppercase tracking-wide text-accent-foreground transition-colors hover:bg-accent-dark disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
            {isSubmitting ? "Verifying..." : "Verify"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setAwaitingTwoFactor(false)}
          className="mt-6 text-center text-sm text-muted hover:text-foreground"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <p className="text-xs uppercase tracking-[0.3em] text-accent">Welcome Back</p>
      <h1 className="font-display mt-3 text-4xl text-foreground">Sign In</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-1.5 block text-xs text-muted">Email</label>
          <input
            name="email"
            type="email"
            required
            className="w-full border border-border bg-surface px-4 py-3 text-sm focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs text-muted">Password</label>
            <Link href="/forgot-password" className="text-xs text-accent hover:underline">
              Forgot password?
            </Link>
          </div>
          <input
            name="password"
            type="password"
            required
            className="w-full border border-border bg-surface px-4 py-3 text-sm focus:border-accent focus:outline-none"
          />
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 bg-accent px-6 py-3 text-sm uppercase tracking-wide text-accent-foreground transition-colors hover:bg-accent-dark disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
          {isSubmitting ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-foreground underline-offset-4 hover:text-accent hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
