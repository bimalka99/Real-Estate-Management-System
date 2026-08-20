"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AuthUser } from "@/lib/types";
import {
  login as apiLogin,
  register as apiRegister,
  refreshAccessToken,
  verifyTwoFactorLogin,
  type RegisterInput,
} from "@/lib/api";

const STORAGE_KEY = "aurelia_auth";

// Refresh proactively once this little time is left on the access token, checked on
// an interval (not a single precise setTimeout) so a backgrounded/suspended tab —
// where browsers throttle or delay timers — still catches up shortly after it's
// foregrounded again, rather than needing an exact fire time.
const REFRESH_BUFFER_MS = 5 * 60 * 1000;
const REFRESH_CHECK_INTERVAL_MS = 60 * 1000;

interface StoredAuth {
  accessToken: string;
  accessTokenExpiresAtUtc: string;
  refreshToken: string;
  user: AuthUser;
}

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  /** True only while reading localStorage on first mount — lets pages avoid a login flash. */
  isLoading: boolean;
  /**
   * Resolves { requiresTwoFactor: true } instead of signing in when the account has 2FA
   * enabled — call completeTwoFactorLogin(code) next to finish. Otherwise signs in directly.
   */
  login: (email: string, password: string) => Promise<{ requiresTwoFactor: boolean }>;
  /** Redeems the pending 2FA challenge from login() with a TOTP or recovery code. */
  completeTwoFactorLogin: (code: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
  /**
   * Mints a fresh access token carrying the user's *current* server-side role.
   * A JWT's claims are a snapshot from issuance — after an action that changes
   * Role server-side (creating/joining/leaving an agency), call this so the UI
   * reflects it immediately instead of requiring a full logout/login.
   */
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [accessTokenExpiresAtUtc, setAccessTokenExpiresAtUtc] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Never persisted — a 2FA challenge is only good for 5 minutes and only makes
  // sense mid-flow on the login page, unlike accessToken/refreshToken/user.
  const [pendingTwoFactorToken, setPendingTwoFactorToken] = useState<string | null>(null);

  // Hydrate from localStorage on mount (client-only — nothing to persist server-side).
  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const stored = JSON.parse(raw) as StoredAuth;
        setUser(stored.user);
        setAccessToken(stored.accessToken);
        setAccessTokenExpiresAtUtc(stored.accessTokenExpiresAtUtc ?? null);
        setRefreshToken(stored.refreshToken);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  function persist(auth: StoredAuth) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    setUser(auth.user);
    setAccessToken(auth.accessToken);
    setAccessTokenExpiresAtUtc(auth.accessTokenExpiresAtUtc);
    setRefreshToken(auth.refreshToken);
  }

  // Proactively renew the access token before it expires, so a tab left open across
  // the ~60 minute lifetime never surfaces a 401 from simple time passing — the user
  // shouldn't have to notice this is happening at all.
  useEffect(() => {
    if (!accessTokenExpiresAtUtc) return;

    function checkAndRefresh() {
      const msRemaining = new Date(accessTokenExpiresAtUtc!).getTime() - Date.now();
      if (msRemaining < REFRESH_BUFFER_MS) {
        refreshSession();
      }
    }

    checkAndRefresh(); // covers a tab reopened/refocused after expiry already passed
    const interval = setInterval(checkAndRefresh, REFRESH_CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
    // Deliberately keyed only on accessTokenExpiresAtUtc — it changes exactly when a
    // new token is issued (login/refresh/2FA verify), which is the only time this
    // needs to reschedule; refreshSession/user/refreshToken are read from the closure
    // captured at that moment, not tracked as separate deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessTokenExpiresAtUtc]);

  async function login(email: string, password: string) {
    const res = await apiLogin(email, password);

    if (res.requiresTwoFactor) {
      setPendingTwoFactorToken(res.twoFactorChallengeToken ?? null);
      return { requiresTwoFactor: true };
    }

    // res.auth is always present when requiresTwoFactor is false — the backend
    // guarantees exactly one of the two is set.
    persist({
      accessToken: res.auth!.accessToken,
      accessTokenExpiresAtUtc: res.auth!.accessTokenExpiresAtUtc,
      refreshToken: res.auth!.refreshToken,
      user: res.auth!.user,
    });
    return { requiresTwoFactor: false };
  }

  async function completeTwoFactorLogin(code: string) {
    if (!pendingTwoFactorToken) {
      throw new Error("No sign-in is in progress.");
    }
    const res = await verifyTwoFactorLogin(pendingTwoFactorToken, code);
    setPendingTwoFactorToken(null);
    persist({
      accessToken: res.accessToken,
      accessTokenExpiresAtUtc: res.accessTokenExpiresAtUtc,
      refreshToken: res.refreshToken,
      user: res.user,
    });
  }

  async function register(input: RegisterInput) {
    const res = await apiRegister(input);
    persist({
      accessToken: res.accessToken,
      accessTokenExpiresAtUtc: res.accessTokenExpiresAtUtc,
      refreshToken: res.refreshToken,
      user: res.user,
    });
  }

  function logout() {
    window.localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setAccessToken(null);
    setAccessTokenExpiresAtUtc(null);
    setRefreshToken(null);
  }

  async function refreshSession() {
    if (!user || !refreshToken) return;
    try {
      const res = await refreshAccessToken(user.id, refreshToken);
      persist({
        accessToken: res.accessToken,
        accessTokenExpiresAtUtc: res.accessTokenExpiresAtUtc,
        refreshToken: res.refreshToken,
        user: res.user,
      });
    } catch {
      // Refresh token expired/invalid — fall back to requiring a real re-login.
      logout();
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, accessToken, isLoading, login, completeTwoFactorLogin, register, logout, refreshSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an <AuthProvider>.");
  }
  return ctx;
}
