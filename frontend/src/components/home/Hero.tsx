import Image from "next/image";
import { Search } from "lucide-react";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=2000&q=80&auto=format&fit=crop";

export default function Hero() {
  return (
    <section className="relative flex min-h-[88vh] items-end overflow-hidden bg-foreground">
      <Image
        src={HERO_IMAGE}
        alt="A luxury modern estate at dusk"
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-80"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

      <div className="relative mx-auto w-full max-w-7xl px-6 pb-20 lg:px-10">
        <p className="text-xs uppercase tracking-[0.35em] text-accent">
          Est. 2010 &mdash; Curated Luxury Real Estate
        </p>
        <h1 className="font-display mt-5 max-w-3xl text-5xl leading-[1.1] text-white sm:text-6xl lg:text-7xl">
          Exceptional homes, for an exceptional life.
        </h1>
        <p className="mt-6 max-w-xl text-base text-white/80">
          A private portfolio of villas, penthouses and estates in the world&apos;s
          most sought-after addresses.
        </p>

        <form
          action="/properties"
          method="GET"
          className="mt-10 grid grid-cols-1 gap-3 bg-background/95 p-3 shadow-2xl backdrop-blur sm:grid-cols-[1.5fr_1fr_1fr_auto]"
        >
          <input
            type="text"
            name="city"
            placeholder="City, e.g. Aspen"
            className="border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
          />
          <select
            name="type"
            defaultValue=""
            className="border border-border bg-surface px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none"
          >
            <option value="">Any type</option>
            <option value="Villa">Villa</option>
            <option value="Penthouse">Penthouse</option>
            <option value="Apartment">Apartment</option>
            <option value="Estate">Estate</option>
            <option value="Townhouse">Townhouse</option>
          </select>
          <select
            name="listingType"
            defaultValue=""
            className="border border-border bg-surface px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none"
          >
            <option value="">Buy or Rent</option>
            <option value="Sale">For Sale</option>
            <option value="Rent">For Rent</option>
          </select>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-accent px-6 py-3 text-sm uppercase tracking-wide text-accent-foreground transition-colors hover:bg-accent-dark"
          >
            <Search size={16} />
            Search
          </button>
        </form>
      </div>
    </section>
  );
}
