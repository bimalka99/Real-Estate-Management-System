import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  pageNumber: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  /** Current search params (minus pageNumber) to preserve across page links. */
  searchParams: Record<string, string | undefined>;
}

function buildHref(searchParams: Record<string, string | undefined>, page: number): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value) params.set(key, value);
  }
  params.set("pageNumber", String(page));
  return `/properties?${params.toString()}`;
}

export default function Pagination({
  pageNumber,
  totalPages,
  hasPreviousPage,
  hasNextPage,
  searchParams,
}: Props) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-16 flex items-center justify-center gap-6">
      <Link
        href={buildHref(searchParams, pageNumber - 1)}
        aria-disabled={!hasPreviousPage}
        className={`flex items-center gap-1 text-sm ${
          hasPreviousPage
            ? "text-foreground hover:text-accent"
            : "pointer-events-none text-muted/40"
        }`}
      >
        <ChevronLeft size={16} /> Previous
      </Link>

      <span className="text-sm text-muted">
        Page {pageNumber} of {totalPages}
      </span>

      <Link
        href={buildHref(searchParams, pageNumber + 1)}
        aria-disabled={!hasNextPage}
        className={`flex items-center gap-1 text-sm ${
          hasNextPage
            ? "text-foreground hover:text-accent"
            : "pointer-events-none text-muted/40"
        }`}
      >
        Next <ChevronRight size={16} />
      </Link>
    </div>
  );
}
