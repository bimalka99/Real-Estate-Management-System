"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import { getMyFavoriteIds, addFavorite, removeFavorite } from "@/lib/api";

interface FavoritesContextValue {
  favoriteIds: Set<string>;
  isFavorited: (propertyId: string) => boolean;
  toggleFavorite: (propertyId: string) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user, accessToken } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  // Load the user's favorites whenever they log in; clear them on logout.
  useEffect(() => {
    if (!user || !accessToken) {
      setFavoriteIds(new Set());
      return;
    }

    getMyFavoriteIds(accessToken)
      .then((ids) => setFavoriteIds(new Set(ids)))
      .catch(() => setFavoriteIds(new Set()));
  }, [user, accessToken]);

  async function toggleFavorite(propertyId: string) {
    if (!accessToken) return;

    const wasFavorited = favoriteIds.has(propertyId);

    // Optimistic update — flip immediately, roll back only if the request fails.
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      wasFavorited ? next.delete(propertyId) : next.add(propertyId);
      return next;
    });

    try {
      if (wasFavorited) {
        await removeFavorite(accessToken, propertyId);
      } else {
        await addFavorite(accessToken, propertyId);
      }
    } catch {
      // Roll back on failure.
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        wasFavorited ? next.add(propertyId) : next.delete(propertyId);
        return next;
      });
    }
  }

  return (
    <FavoritesContext.Provider
      value={{
        favoriteIds,
        isFavorited: (propertyId) => favoriteIds.has(propertyId),
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites must be used within a <FavoritesProvider>.");
  }
  return ctx;
}
