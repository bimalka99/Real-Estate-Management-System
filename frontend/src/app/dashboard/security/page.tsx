"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldOff,
  ShieldAlert,
  Loader2,
  Mail,
  CheckCircle,
  Copy,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  resendVerificationEmail,
  setupTwoFactor,
  enableTwoFactor,
  disableTwoFactor,
  ApiError,
} from "@/lib/api";
import type { TwoFactorSetup } from "@/lib/types";

type TwoFactorView = "idle" | "settingUp" | "recoveryCodes" | "disabling";

export default function SecurityPage() {
  const { user, accessToken, isLoading: authLoading, refreshSession } = useAuth();

  const [view, setView] = useState<TwoFactorView>("idle");
  const [setup, setSetup] = useState<TwoFactorSetup | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [verificationSent, setVerificationSent] = useState(false);

  async function handleResendVerification() {
    if (!accessToken) return;
    setIsBusy(true);
    setError(null);
    try {
      await resendVerificationEmail(accessToken);
      setVerificationSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleStartSetup() {
    if (!accessToken) return;
    setIsBusy(true);
    setError(null);
    try {
      const result = await setupTwoFactor(accessToken);
      setSetup(result);
      setView("settingUp");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleConfirmSetup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) return;
    setIsBusy(true);
    setError(null);

    const data = new FormData(event.currentTarget);
    try {
      const codes = await enableTwoFactor(accessToken, String(data.get("code")));
      setRecoveryCodes(codes);
      setView("recoveryCodes");
      await refreshSession();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleDisable(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) return;
    setIsBusy(true);
    setError(null);

    const data = new FormData(event.currentTarget);
    try {
      await disableTwoFactor(accessToken, String(data.get("password")));
      setView("idle");
      await refreshSession();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsBusy(false);
    }
  }

  function finishSetupFlow() {
    setView("idle");
    setSetup(null);
    setRecoveryCodes([]);
  }

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-muted" size={24} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="text-sm text-muted">
          <Link href="/login" className="text-accent underline-offset-4 hover:underline">
            Sign in
          </Link>{" "}
          to manage your account security.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 lg:px-10">
      <p className="text-xs uppercase tracking-[0.3em] text-accent">Your Account</p>
      <h1 className="font-display mt-3 text-4xl text-foreground">Security</h1>

      {/* Email verification */}
      <section className="mt-10 border border-border p-6">
        <div className="flex items-start gap-4">
          <Mail className="mt-0.5 shrink-0 text-muted" size={20} />
          <div className="flex-1">
            <h2 className="text-sm font-medium text-foreground">Email address</h2>
            <p className="mt-1 text-sm text-muted">{user.email}</p>

            {user.isEmailVerified ? (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-accent">
                <CheckCircle size={14} /> Verified
              </p>
            ) : verificationSent ? (
              <p className="mt-3 text-xs text-muted">
                Verification email sent — check your inbox (or, in local development, the backend
                console / <code>wwwroot/dev-emails</code>).
              </p>
            ) : (
              <div className="mt-3">
                <p className="mb-2 flex items-center gap-1.5 text-xs text-amber-600">
                  <AlertTriangle size={14} /> Not verified
                </p>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={isBusy}
                  className="border border-border px-4 py-2 text-xs uppercase tracking-wide text-foreground transition-colors hover:border-accent hover:text-accent disabled:opacity-60"
                >
                  Resend verification email
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Two-factor authentication */}
      <section className="mt-6 border border-border p-6">
        <div className="flex items-start gap-4">
          {user.twoFactorEnabled ? (
            <ShieldCheck className="mt-0.5 shrink-0 text-accent" size={20} />
          ) : (
            <ShieldOff className="mt-0.5 shrink-0 text-muted" size={20} />
          )}
          <div className="flex-1">
            <h2 className="text-sm font-medium text-foreground">Two-factor authentication</h2>
            <p className="mt-1 text-sm text-muted">
              Require a code from an authenticator app (Google Authenticator, 1Password, Authy, etc.)
              in addition to your password when signing in.
            </p>

            {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

            {view === "idle" && (
              <div className="mt-4">
                {user.twoFactorEnabled ? (
                  <button
                    type="button"
                    onClick={() => setView("disabling")}
                    className="border border-red-200 px-4 py-2 text-xs uppercase tracking-wide text-red-600 transition-colors hover:bg-red-50"
                  >
                    Disable two-factor authentication
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartSetup}
                    disabled={isBusy}
                    className="bg-accent px-4 py-2 text-xs uppercase tracking-wide text-accent-foreground transition-colors hover:bg-accent-dark disabled:opacity-60"
                  >
                    {isBusy ? "Starting..." : "Enable two-factor authentication"}
                  </button>
                )}
              </div>
            )}

            {view === "disabling" && (
              <form onSubmit={handleDisable} className="mt-4 max-w-xs space-y-3">
                <div>
                  <label className="mb-1.5 block text-xs text-muted">Confirm your password</label>
                  <input
                    name="password"
                    type="password"
                    required
                    autoFocus
                    className="w-full border border-border bg-surface px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isBusy}
                    className="border border-red-200 px-4 py-2 text-xs uppercase tracking-wide text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
                  >
                    {isBusy ? "Disabling..." : "Confirm disable"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setView("idle"); setError(null); }}
                    className="px-4 py-2 text-xs uppercase tracking-wide text-muted hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {view === "settingUp" && setup && (
              <div className="mt-4 space-y-4">
                <p className="text-xs text-muted">
                  Scan this QR code with your authenticator app, then enter the 6-digit code it shows.
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element -- data URI, not an optimizable remote image */}
                <img
                  src={`data:image/png;base64,${setup.qrCodeImageBase64}`}
                  alt="Two-factor authentication QR code"
                  width={200}
                  height={200}
                  className="border border-border"
                />
                <p className="text-xs text-muted">
                  Can&apos;t scan it? Enter this key manually:{" "}
                  <code className="border border-border bg-surface px-1.5 py-0.5">{setup.manualEntryKey}</code>
                </p>

                <form onSubmit={handleConfirmSetup} className="max-w-xs space-y-3">
                  <div>
                    <label className="mb-1.5 block text-xs text-muted">6-digit code</label>
                    <input
                      name="code"
                      type="text"
                      required
                      autoFocus
                      placeholder="123456"
                      className="w-full border border-border bg-surface px-3 py-2.5 text-center text-lg tracking-[0.3em] focus:border-accent focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={isBusy}
                      className="bg-accent px-4 py-2 text-xs uppercase tracking-wide text-accent-foreground transition-colors hover:bg-accent-dark disabled:opacity-60"
                    >
                      {isBusy ? "Confirming..." : "Confirm & enable"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setView("idle"); setSetup(null); setError(null); }}
                      className="px-4 py-2 text-xs uppercase tracking-wide text-muted hover:text-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {view === "recoveryCodes" && (
              <div className="mt-4 space-y-4">
                <p className="flex items-center gap-1.5 text-xs text-accent">
                  <CheckCircle size={14} /> Two-factor authentication is now enabled.
                </p>
                <div className="border border-amber-200 bg-amber-50 p-4">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-amber-800">
                    <AlertTriangle size={14} /> Save your recovery codes
                  </p>
                  <p className="mt-1.5 text-xs text-amber-800">
                    Each can be used once to sign in if you lose access to your authenticator app.
                    They won&apos;t be shown again.
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-sm text-foreground">
                    {recoveryCodes.map((code) => (
                      <span key={code} className="border border-border bg-surface px-2 py-1.5 text-center">
                        {code}
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(recoveryCodes.join("\n"))}
                    className="mt-3 flex items-center gap-1.5 text-xs text-foreground underline-offset-4 hover:underline"
                  >
                    <Copy size={13} /> Copy all
                  </button>
                </div>
                <button
                  type="button"
                  onClick={finishSetupFlow}
                  className="border border-border px-4 py-2 text-xs uppercase tracking-wide text-foreground transition-colors hover:border-accent hover:text-accent"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
