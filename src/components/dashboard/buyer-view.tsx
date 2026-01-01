
import Link from "next/link";
import { StatCard } from "./stat-card";
import { Search, Gavel, ShoppingBag, Heart } from "lucide-react";

interface BuyerDashboardProps {
    requests: any[];
    deals: any[];
    bids: any[];
}

export function BuyerDashboard({ requests, deals, bids }: BuyerDashboardProps) {
    const activeBids = bids.length; // Simplified for now
    const activeDeals = deals.filter(d => d.status === 'OPEN').length;

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-4">
                <StatCard
                    title="Active Bids"
                    value={activeBids}
                    icon={Gavel}
                />
                <StatCard
                    title="Open Deals"
                    value={activeDeals}
                    icon={ShoppingBag}
                />
                <StatCard
                    title="Open Requests"
                    value={requests.length}
                    icon={Search}
                />
                <StatCard
                    title="Watchlist"
                    value="0"
                    icon={Heart}
                />
            </div>

            {/* Recent Bids */}
            <section className="rounded-2xl border border-neutral-800 bg-neutral-950/90 p-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-white">Recent Activity</h2>
                    <Link href="/auctions" className="text-xs text-neutral-500 hover:text-white">Browse Auctions</Link>
                </div>

                {bids.length === 0 ? (
                    <p className="mt-4 text-xs text-neutral-500">You haven't placed any bids yet.</p>
                ) : (
                    <div className="mt-4 space-y-3">
                        {bids.slice(0, 5).map((bid) => (
                            <div key={bid.id} className="flex items-center justify-between rounded-lg border border-neutral-800 bg-black/40 p-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 text-neutral-500">
                                        <Gavel className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{bid.item.title}</p>
                                        <p className="text-[10px] text-neutral-500">Placed on {new Date(bid.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-yellow-500">
                                        ${bid.amount.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
