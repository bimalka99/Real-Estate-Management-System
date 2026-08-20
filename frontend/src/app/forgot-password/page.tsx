"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Mail, Send, Loader2, CheckCircle } from "lucide-react";
import { forgotPassword, ApiError } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const data = new FormData(event.currentTarget);
    try {
      await forgotPassword(String(data.get("email")));
      // The backend always responds the same way regardless of whether the email
      // is registered — shown unconditionally here too, so this page can't be used
      // to check which emails have accounts.
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16 text-center">
        <CheckCircle className="mx-auto text-accent" size={32} />
        <h1 className="font-display mt-4 text-3xl text-foreground">Check your email</h1>
        <p className="mt-3 text-sm text-muted">
          If an account exists for that email address, we&apos;ve sent a link to reset your password.
          It expires in 1 hour.
        </p>
        <Link href="/login" className="mt-8 text-sm text-accent underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <Mail className="text-accent" size={28} />
      <h1 className="font-display mt-3 text-4xl text-foreground">Forgot Password</h1>
      <p className="mt-2 text-sm text-muted">Enter your account email and we&apos;ll send you a reset link.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-1.5 block text-xs text-muted">Email</label>
          <input
            name="email"
            type="email"
            required
            autoFocus
            className="w-full border border-border bg-surface px-4 py-3 text-sm focus:border-accent focus:outline-none"
          />
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 bg-accent px-6 py-3 text-sm uppercase tracking-wide text-accent-foreground transition-colors hover:bg-accent-dark disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {isSubmitting ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Remembered it?{" "}
        <Link href="/login" className="text-foreground underline-offset-4 hover:text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
