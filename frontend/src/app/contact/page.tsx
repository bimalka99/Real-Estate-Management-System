"use client";

import { useState, type FormEvent } from "react";
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle } from "lucide-react";
import { createContactMessage, ApiError } from "@/lib/api";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const data = new FormData(event.currentTarget);
    try {
      await createContactMessage({
        name: String(data.get("name")),
        email: String(data.get("email")),
        message: String(data.get("message")),
      });
      setSent(true);
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
    <div className="mx-auto max-w-5xl px-6 py-20 lg:px-10">
      <p className="text-xs uppercase tracking-[0.3em] text-accent">Get in Touch</p>
      <h1 className="font-display mt-4 text-4xl text-foreground sm:text-5xl">
        We&apos;d love to hear from you.
      </h1>
      <p className="mt-4 max-w-lg text-sm text-muted">
        Whether you&apos;re buying, selling, or simply curious about the market —
        our advisors are on hand for a confidential conversation.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-3">
        <div>
          <Mail className="text-accent" size={20} />
          <p className="mt-3 text-sm text-foreground">hello@aureliaestates.example</p>
        </div>
        <div>
          <Phone className="text-accent" size={20} />
          <p className="mt-3 text-sm text-foreground">+1 (555) 019-2044</p>
        </div>
        <div>
          <MapPin className="text-accent" size={20} />
          <p className="mt-3 text-sm text-foreground">One Park Avenue, New York</p>
        </div>
      </div>

      {sent ? (
        <div className="mt-16 flex flex-col items-center border border-border bg-surface p-12 text-center">
          <CheckCircle className="text-accent" size={28} />
          <p className="mt-4 text-sm text-foreground">
            Thank you — your message has been sent. We&apos;ll be in touch shortly.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-16 grid grid-cols-1 gap-5 border border-border bg-surface p-8 sm:grid-cols-2">
          <input
            name="name"
            type="text"
            required
            maxLength={200}
            placeholder="Full name"
            className="border border-border bg-background px-4 py-3 text-sm focus:border-accent focus:outline-none"
          />
          <input
            name="email"
            type="email"
            required
            placeholder="Email address"
            className="border border-border bg-background px-4 py-3 text-sm focus:border-accent focus:outline-none"
          />
          <textarea
            name="message"
            required
            maxLength={4000}
            placeholder="How can we help?"
            rows={5}
            className="sm:col-span-2 border border-border bg-background px-4 py-3 text-sm focus:border-accent focus:outline-none"
          />

          {error && <p className="sm:col-span-2 text-xs text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 sm:col-span-2 bg-accent px-8 py-3 text-sm uppercase tracking-wide text-accent-foreground transition-colors hover:bg-accent-dark disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      )}
    </div>
  );
}
