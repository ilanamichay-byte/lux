
import { cn } from "@/lib/utils";

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-md bg-neutral-800/50",
                className
            )}
        />
    );
}

export function ProductCardSkeleton() {
    return (
        <div className="flex flex-col overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50">
            <Skeleton className="aspect-square w-full" />
            <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex justify-between pt-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-4 w-12" />
                </div>
            </div>
        </div>
    );
}

export function AuctionGridSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: count }).map((_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    );
}

export function DashboardStatSkeleton() {
    return (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
            <Skeleton className="h-4 w-20 mb-4" />
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-3 w-16" />
        </div>
    );
}

export function TableRowSkeleton() {
    return (
        <div className="flex items-center gap-4 py-4 border-b border-neutral-800">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-8 w-20" />
        </div>
    );
}

export function NotificationSkeleton() {
    return (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
            <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-3 w-full mb-1" />
            <Skeleton className="h-3 w-2/3" />
        </div>
    );
}

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
    children: React.ReactNode;
}

export function LoadingButton({ isLoading, children, className, disabled, ...props }: LoadingButtonProps) {
    return (
        <button
            className={cn(
                "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                className
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && (
                <svg
                    className="h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            )}
            {children}
        </button>
    );
}
