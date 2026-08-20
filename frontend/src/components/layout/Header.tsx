"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, LogIn, LogOut, User, Heart, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const NAV_LINKS = [
  { href: "/properties", label: "Properties" },
  { href: "/properties?listingType=Rent", label: "Rent" },
  { href: "/agents", label: "Agents" },
  { href: "/agencies", label: "Agencies" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { user, isLoading, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
        <Link href="/" className="flex items-baseline gap-2" onClick={() => setOpen(false)}>
          <span className="font-display text-2xl tracking-wide text-foreground">
            Aurelia
          </span>
          <span className="text-[0.65rem] uppercase tracking-[0.3em] text-accent">
            Estates
          </span>
        </Link>

        <nav className="hidden items-center gap-10 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm tracking-wide text-foreground/80 transition-colors hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          {!isLoading && (
            <>
              {user ? (
                <div className="flex items-center gap-4 text-sm text-foreground/80">
                  {["Agent", "AgencyAdmin", "SuperAdmin"].includes(user.role) && (
                    <Link href="/dashboard" className="tracking-wide hover:text-accent">
                      Dashboard
                    </Link>
                  )}
                  {user.role === "SuperAdmin" && (
                    <Link href="/dashboard/admin" className="tracking-wide hover:text-accent">
                      Admin
                    </Link>
                  )}
                  <Link href="/favorites" aria-label="Saved properties" className="transition-colors hover:text-accent">
                    <Heart size={16} />
                  </Link>
                  <Link href="/dashboard/security" aria-label="Account security" className="transition-colors hover:text-accent">
                    <ShieldCheck size={16} />
                  </Link>
                  <span className="flex items-center gap-1.5">
                    <User size={15} /> {user.firstName}
                  </span>
                  <button
                    type="button"
                    onClick={logout}
                    aria-label="Sign out"
                    className="text-foreground/50 transition-colors hover:text-accent"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 text-sm tracking-wide text-foreground/80 hover:text-accent"
                >
                  <LogIn size={15} /> Sign In
                </Link>
              )}
            </>
          )}

          <Link
            href="/contact"
            className="inline-flex items-center border border-accent px-6 py-2.5 text-sm tracking-wide text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Enquire
          </Link>
        </div>

        <button
          type="button"
          className="p-2 text-foreground lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/70 bg-background lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded px-2 py-3 text-sm tracking-wide text-foreground/80 hover:bg-surface-muted hover:text-accent"
              >
                {link.label}
              </Link>
            ))}

            {!isLoading && (
              user ? (
                <>
                  {["Agent", "AgencyAdmin", "SuperAdmin"].includes(user.role) && (
                    <Link
                      href="/dashboard"
                      onClick={() => setOpen(false)}
                      className="rounded px-2 py-3 text-sm tracking-wide text-foreground/80 hover:bg-surface-muted hover:text-accent"
                    >
                      Dashboard
                    </Link>
                  )}
                  <Link
                    href="/favorites"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-1.5 rounded px-2 py-3 text-sm tracking-wide text-foreground/80 hover:bg-surface-muted hover:text-accent"
                  >
                    <Heart size={15} /> Saved Properties
                  </Link>
                  <Link
                    href="/dashboard/security"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-1.5 rounded px-2 py-3 text-sm tracking-wide text-foreground/80 hover:bg-surface-muted hover:text-accent"
                  >
                    <ShieldCheck size={15} /> Account Security
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setOpen(false);
                    }}
                    className="flex items-center gap-1.5 rounded px-2 py-3 text-left text-sm tracking-wide text-foreground/80 hover:bg-surface-muted hover:text-accent"
                  >
                    <LogOut size={15} /> Sign Out ({user.firstName})
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-1.5 rounded px-2 py-3 text-sm tracking-wide text-foreground/80 hover:bg-surface-muted hover:text-accent"
                >
                  <LogIn size={15} /> Sign In
                </Link>
              )
            )}

            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center border border-accent px-6 py-2.5 text-sm tracking-wide text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              Enquire
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
