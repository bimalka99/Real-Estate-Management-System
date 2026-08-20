"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Trash2, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { createReview, deleteReview, ApiError } from "@/lib/api";
import type { ReviewDto } from "@/lib/types";
import StarRating from "@/components/agent/StarRating";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function initials(name: string): string {
  return name.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

export default function ReviewsSection({
  agentId,
  initialReviews,
}: {
  agentId: string;
  initialReviews: ReviewDto[];
}) {
  const { user, accessToken } = useAuth();
  const [reviews, setReviews] = useState<ReviewDto[]>(initialReviews);
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const myReview = user ? reviews.find((r) => r.reviewerId === user.id) : undefined;
  const isOwnProfile = user?.id === agentId;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) return;

    setIsSubmitting(true);
    setError(null);

    const data = new FormData(event.currentTarget);
    try {
      const review = await createReview(accessToken, agentId, {
        rating,
        comment: String(data.get("comment")),
      });
      setReviews((prev) => [review, ...prev]);
      event.currentTarget.reset();
      setRating(5);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't submit your review.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(reviewId: string) {
    if (!accessToken) return;
    setDeletingId(reviewId);
    try {
      await deleteReview(accessToken, reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch {
      setError("Couldn't delete that review.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <h2 className="font-display text-2xl text-foreground">
        Reviews {reviews.length > 0 && `(${reviews.length})`}
      </h2>

      {reviews.length === 0 ? (
        <p className="mt-4 text-sm text-muted">No reviews yet.</p>
      ) : (
        <div className="mt-6 space-y-5">
          {reviews.map((review) => (
            <div key={review.id} className="border border-border bg-surface p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-muted text-xs font-display text-accent">
                    {review.reviewerAvatarUrl ? (
                      <Image src={review.reviewerAvatarUrl} alt={review.reviewerName} fill sizes="36px" className="object-cover" />
                    ) : (
                      initials(review.reviewerName)
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-foreground">{review.reviewerName}</p>
                    <p className="text-xs text-muted">{formatDate(review.createdAtUtc)}</p>
                  </div>
                </div>
                <StarRating rating={review.rating} />
              </div>

              <p className="mt-3 text-sm text-foreground/80">{review.comment}</p>

              {user?.id === review.reviewerId && (
                <button
                  type="button"
                  onClick={() => handleDelete(review.id)}
                  disabled={deletingId === review.id}
                  className="mt-3 flex items-center gap-1.5 text-xs text-muted hover:text-red-600 disabled:opacity-50"
                >
                  {deletingId === review.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!user ? (
        <p className="mt-8 text-sm text-muted">
          <Link href="/login" className="text-accent underline-offset-4 hover:underline">Sign in</Link> to leave a review.
        </p>
      ) : isOwnProfile ? null : myReview ? (
        <p className="mt-8 text-sm text-muted">You&apos;ve already reviewed this agent.</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 border-t border-border pt-8">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Leave a Review</p>

          <div className="mt-3 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                aria-label={`Rate ${n} stars`}
                className="p-0.5"
              >
                <Star size={20} className={n <= rating ? "fill-accent text-accent" : "text-border"} />
              </button>
            ))}
          </div>

          <textarea
            name="comment"
            required
            rows={3}
            placeholder="Share your experience..."
            className="mt-3 w-full border border-border bg-background px-4 py-3 text-sm focus:border-accent focus:outline-none"
          />

          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-3 bg-accent px-6 py-2.5 text-sm uppercase tracking-wide text-accent-foreground transition-colors hover:bg-accent-dark disabled:opacity-60"
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      )}
    </div>
  );
}
