import { AuctionGridSkeleton } from "@/components/ui/skeleton";

export default function AuctionsLoading() {
    return (
        <div className="mx-auto max-w-6xl px-4 py-10">
            <div className="flex items-center justify-between gap-2">
                <div>
                    <div className="h-8 w-48 animate-pulse rounded-lg bg-neutral-800/50" />
                    <div className="mt-2 h-4 w-72 animate-pulse rounded-lg bg-neutral-800/50" />
                </div>
                <div className="h-8 w-32 animate-pulse rounded-full bg-neutral-800/50" />
            </div>

            <div className="mt-8">
                <AuctionGridSkeleton count={6} />
            </div>
        </div>
    );
}
