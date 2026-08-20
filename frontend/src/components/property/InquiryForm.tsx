"use client";

import { useState, type FormEvent } from "react";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { createInquiry } from "@/lib/api";

export default function InquiryForm({ propertyId }: { propertyId: string }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);

    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      await createInquiry({
        propertyId,
        name: String(data.get("name") ?? ""),
        email: String(data.get("email") ?? ""),
        phone: String(data.get("phone") ?? "") || undefined,
        message: String(data.get("message") ?? ""),
      });
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong sending your message. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="mt-6 flex flex-col items-center gap-2 border-t border-border pt-6 text-center">
        <CheckCircle2 className="text-accent" size={28} />
        <p className="text-sm text-foreground">Thank you — your inquiry has been sent.</p>
        <p className="text-xs text-muted">The listing agent will be in touch shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 border-t border-border pt-6">
      <p className="text-xs uppercase tracking-[0.2em] text-muted">Enquire about this home</p>

      <div className="mt-4 space-y-3">
        <input
          name="name"
          type="text"
          required
          placeholder="Full name"
          className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
        />
        <input
          name="email"
          type="email"
          required
          placeholder="Email address"
          className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
        />
        <input
          name="phone"
          type="tel"
          placeholder="Phone (optional)"
          className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
        />
        <textarea
          name="message"
          required
          rows={3}
          defaultValue="I'd like to request more information and schedule a viewing."
          className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
        />
      </div>

      {status === "error" && (
        <p className="mt-3 text-xs text-red-600">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-4 flex w-full items-center justify-center gap-2 bg-accent px-6 py-3 text-sm uppercase tracking-wide text-accent-foreground transition-colors hover:bg-accent-dark disabled:opacity-60"
      >
        {status === "submitting" ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Mail size={16} />
        )}
        {status === "submitting" ? "Sending..." : "Send Inquiry"}
      </button>
    </form>
  );
}
