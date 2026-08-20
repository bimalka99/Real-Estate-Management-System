import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <span className="font-display text-2xl text-foreground">Aurelia Estates</span>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              Representing an exceptional portfolio of villas, penthouses and private
              estates. Discretion, craft and market insight for every transaction.
            </p>
            <div className="mt-6 flex gap-5 text-xs uppercase tracking-[0.15em] text-muted">
              <a href="#" className="transition-colors hover:text-accent">Instagram</a>
              <a href="#" className="transition-colors hover:text-accent">Facebook</a>
              <a href="#" className="transition-colors hover:text-accent">LinkedIn</a>
            </div>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-muted">Explore</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li><Link href="/properties" className="text-foreground/80 hover:text-accent">Buy</Link></li>
              <li><Link href="/properties?listingType=Rent" className="text-foreground/80 hover:text-accent">Rent</Link></li>
              <li><Link href="/agents" className="text-foreground/80 hover:text-accent">Agents</Link></li>
              <li><Link href="/about" className="text-foreground/80 hover:text-accent">About</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-muted">Contact</h3>
            <ul className="mt-4 space-y-3 text-sm text-foreground/80">
              <li>hello@aureliaestates.example</li>
              <li>+1 (555) 019-2044</li>
              <li>One Park Avenue, New York</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-xs text-muted md:flex-row">
          <p>&copy; {new Date().getFullYear()} Aurelia Estates. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-accent">Privacy</Link>
            <Link href="/terms" className="hover:text-accent">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
