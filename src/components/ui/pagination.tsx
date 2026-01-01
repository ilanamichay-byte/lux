import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    baseUrl: string;
    className?: string;
}

export function Pagination({ currentPage, totalPages, baseUrl, className }: PaginationProps) {
    if (totalPages <= 1) return null;

    const getPageUrl = (page: number) => {
        const separator = baseUrl.includes("?") ? "&" : "?";
        return `${baseUrl}${separator}page=${page}`;
    };

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages: (number | "ellipsis")[] = [];
        const showEllipsisThreshold = 7;

        if (totalPages <= showEllipsisThreshold) {
            // Show all pages
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Show first, last, current, and neighbors with ellipsis
            pages.push(1);

            if (currentPage > 3) {
                pages.push("ellipsis");
            }

            for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                pages.push(i);
            }

            if (currentPage < totalPages - 2) {
                pages.push("ellipsis");
            }

            pages.push(totalPages);
        }

        return pages;
    };

    return (
        <nav className={cn("flex items-center justify-center gap-1", className)} aria-label="Pagination">
            {/* Previous button */}
            {currentPage > 1 ? (
                <Link
                    href={getPageUrl(currentPage - 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-800 text-neutral-400 hover:border-yellow-500 hover:text-yellow-400 transition-colors"
                    aria-label="Previous page"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Link>
            ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-900 text-neutral-700 cursor-not-allowed">
                    <ChevronLeft className="h-4 w-4" />
                </span>
            )}

            {/* Page numbers */}
            <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) =>
                    page === "ellipsis" ? (
                        <span key={`ellipsis-${index}`} className="px-2 text-neutral-500">
                            …
                        </span>
                    ) : (
                        <Link
                            key={page}
                            href={getPageUrl(page)}
                            className={cn(
                                "flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-sm font-medium transition-colors",
                                page === currentPage
                                    ? "bg-yellow-500 text-black"
                                    : "border border-neutral-800 text-neutral-400 hover:border-yellow-500 hover:text-yellow-400"
                            )}
                            aria-current={page === currentPage ? "page" : undefined}
                        >
                            {page}
                        </Link>
                    )
                )}
            </div>

            {/* Next button */}
            {currentPage < totalPages ? (
                <Link
                    href={getPageUrl(currentPage + 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-800 text-neutral-400 hover:border-yellow-500 hover:text-yellow-400 transition-colors"
                    aria-label="Next page"
                >
                    <ChevronRight className="h-4 w-4" />
                </Link>
            ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-900 text-neutral-700 cursor-not-allowed">
                    <ChevronRight className="h-4 w-4" />
                </span>
            )}
        </nav>
    );
}

// Simple "Load More" button alternative
interface LoadMoreButtonProps {
    onClick: () => void;
    isLoading?: boolean;
    hasMore: boolean;
    className?: string;
}

export function LoadMoreButton({ onClick, isLoading, hasMore, className }: LoadMoreButtonProps) {
    if (!hasMore) return null;

    return (
        <div className={cn("flex justify-center py-8", className)}>
            <button
                onClick={onClick}
                disabled={isLoading}
                className="rounded-full border border-neutral-700 px-6 py-2.5 text-sm font-medium text-neutral-300 hover:border-yellow-500 hover:text-yellow-400 transition-colors disabled:opacity-50"
            >
                {isLoading ? (
                    <span className="flex items-center gap-2">
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Loading...
                    </span>
                ) : (
                    "Load More"
                )}
            </button>
        </div>
    );
}
