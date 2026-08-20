"use client";

import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useFavorites } from "@/lib/favorites-context";

interface Props {
  propertyId: string;
  /** Larger, labeled variant for the property detail sidebar vs. the compact card overlay. */
  variant?: "card" | "detail";
}

export default function FavoriteButton({ propertyId, variant = "card" }: Props) {
  const { user } = useAuth();
  const { isFavorited, toggleFavorite } = useFavorites();
  const router = useRouter();
  const favorited = isFavorited(propertyId);

  function handleClick(event: React.MouseEvent) {
    event.preventDefault(); // don't follow the parent <Link> to the property page
    event.stopPropagation();

    if (!user) {
      router.push("/login");
      return;
    }
    void toggleFavorite(propertyId);
  }

  if (variant === "detail") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="flex w-full items-center justify-center gap-2 border border-border px-6 py-3 text-sm uppercase tracking-wide text-foreground transition-colors hover:border-accent hover:text-accent"
      >
        <Heart size={16} className={favorited ? "fill-accent text-accent" : ""} />
        {favorited ? "Saved" : "Save Property"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
      className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center bg-background/90 backdrop-blur-sm transition-transform hover:scale-105"
    >
      <Heart size={16} className={favorited ? "fill-accent text-accent" : "text-foreground"} />
    </button>
  );
}
