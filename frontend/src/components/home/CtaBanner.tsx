import Link from "next/link";

export default function CtaBanner() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
      <div className="flex flex-col items-center gap-6 border border-border bg-surface px-8 py-20 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-accent">Private Consultation</p>
        <h2 className="font-display max-w-xl text-4xl text-foreground">
          Considering a sale? Let&apos;s discuss your property&apos;s true value.
        </h2>
        <p className="max-w-md text-sm text-muted">
          Our advisors provide a confidential valuation and a tailored marketing
          strategy for your home.
        </p>
        <Link
          href="/contact"
          className="mt-4 inline-flex items-center border border-accent px-8 py-3 text-sm uppercase tracking-wide text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          Request a Valuation
        </Link>
      </div>
    </section>
  );
}
