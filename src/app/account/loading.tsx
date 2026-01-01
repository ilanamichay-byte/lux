import { DashboardStatSkeleton, TableRowSkeleton } from "@/components/ui/skeleton";

export default function AccountLoading() {
    return (
        <div className="space-y-8 py-8">
            {/* Header Card */}
            <section className="rounded-2xl border border-neutral-800 bg-neutral-950/90 p-6">
                <div className="h-3 w-24 animate-pulse rounded bg-neutral-800/50" />
                <div className="mt-2 h-7 w-48 animate-pulse rounded bg-neutral-800/50" />
                <div className="mt-3 flex gap-3">
                    <div className="h-6 w-20 animate-pulse rounded-full bg-neutral-800/50" />
                    <div className="h-6 w-24 animate-pulse rounded-full bg-neutral-800/50" />
                </div>
            </section>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-3">
                <DashboardStatSkeleton />
                <DashboardStatSkeleton />
                <DashboardStatSkeleton />
            </div>

            {/* Content Section */}
            <section className="rounded-2xl border border-neutral-800 bg-neutral-950/90 p-6">
                <div className="mb-4 h-5 w-32 animate-pulse rounded bg-neutral-800/50" />
                <div className="space-y-4">
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                </div>
            </section>
        </div>
    );
}
