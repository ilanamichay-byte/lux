import { AuctionGridSkeleton } from "@/components/ui/skeleton";

export default function MarketplaceLoading() {
    return (
        <div className="mx-auto max-w-6xl px-4 py-10">
            <div className="h-8 w-56 animate-pulse rounded-lg bg-neutral-800/50" />
            <div className="mt-2 h-4 w-80 animate-pulse rounded-lg bg-neutral-800/50" />

            <div className="mt-8">
                <AuctionGridSkeleton count={6} />
            </div>
        </div>
    );
}
