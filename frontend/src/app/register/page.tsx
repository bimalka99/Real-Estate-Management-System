"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const data = new FormData(event.currentTarget);
    try {
      await register({
        firstName: String(data.get("firstName")),
        lastName: String(data.get("lastName")),
        email: String(data.get("email")),
        password: String(data.get("password")),
        role: data.get("role") === "Agent" ? "Agent" : "Client",
      });
      router.push("/");
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

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <p className="text-xs uppercase tracking-[0.3em] text-accent">Join Us</p>
      <h1 className="font-display mt-3 text-4xl text-foreground">Create Account</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs text-muted">First name</label>
            <input
              name="firstName"
              type="text"
              required
              className="w-full border border-border bg-surface px-4 py-3 text-sm focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted">Last name</label>
            <input
              name="lastName"
              type="text"
              required
              className="w-full border border-border bg-surface px-4 py-3 text-sm focus:border-accent focus:outline-none"
            />
          </div>
        </div>

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
          <label className="mb-1.5 block text-xs text-muted">Password</label>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            className="w-full border border-border bg-surface px-4 py-3 text-sm focus:border-accent focus:outline-none"
          />
          <p className="mt-1 text-xs text-muted">At least 8 characters.</p>
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-muted">I am a...</label>
          <select
            name="role"
            defaultValue="Client"
            className="w-full border border-border bg-surface px-4 py-3 text-sm focus:border-accent focus:outline-none"
          >
            <option value="Client">Buyer / Renter</option>
            <option value="Agent">Real Estate Agent</option>
          </select>
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 bg-accent px-6 py-3 text-sm uppercase tracking-wide text-accent-foreground transition-colors hover:bg-accent-dark disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
          {isSubmitting ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-foreground underline-offset-4 hover:text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
