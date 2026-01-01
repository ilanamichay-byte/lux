
import Link from "next/link";
import { StatCard } from "./stat-card";
import { DollarSign, Eye, Package, ShoppingBag } from "lucide-react";

interface SellerDashboardProps {
    items: any[];
    deals: any[];
    sellerStatus: string;
}

export function SellerDashboard({ items, deals, sellerStatus }: SellerDashboardProps) {
    // Mock analytics for MVP
    const totalRevenue = deals
        .filter((d) => d.status === "PAID" || d.status === "COMPLETE")
        .reduce((acc, d) => acc + (d.totalPrice || 0), 0);

    const activeListings = items.filter(i => i.status === 'PUBLISHED').length;

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-4">
                <StatCard
                    title="Total Revenue"
                    value={`$${totalRevenue.toLocaleString()}`}
                    icon={DollarSign}
                    trend="12% vs last month"
                    trendUp={true}
                />
                <StatCard
                    title="Active Listings"
                    value={activeListings}
                    icon={Package}
                />
                <StatCard
                    title="Total Views"
                    value="1.2k"
                    icon={Eye}
                    trend="8% vs last month"
                    trendUp={true}
                />
                <StatCard
                    title="Pending Orders"
                    value={deals.filter(d => d.status === 'OPEN').length}
                    icon={ShoppingBag}
                />
            </div>

            {/* Quick Actions */}
            <section className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-white">Quick Actions</h2>
                </div>
                <div className="mt-4 flex gap-4">
                    <Link href="/seller/list-item" className="flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm font-medium text-yellow-400 transition-colors hover:bg-yellow-500/20">
                        <span>+ List New Item</span>
                    </Link>
                    <Link href="/account/listings" className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-3 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-800">
                        <span>Manage Listings</span>
                    </Link>
                </div>
            </section>

            {/* Recent Listings */}
            <section className="rounded-2xl border border-neutral-800 bg-neutral-950/90 p-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-white">Recent Listings</h2>
                    <Link href="/account/listings" className="text-xs text-neutral-500 hover:text-white">View all</Link>
                </div>

                {items.length === 0 ? (
                    <p className="mt-4 text-xs text-neutral-500">No active listings.</p>
                ) : (
                    <div className="mt-4 space-y-3">
                        {items.slice(0, 5).map((item) => (
                            <div key={item.id} className="flex items-center justify-between rounded-lg border border-neutral-800 bg-black/40 p-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 overflow-hidden rounded bg-neutral-900">
                                        {item.mainImageUrl && <img src={item.mainImageUrl} className="h-full w-full object-cover" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{item.title}</p>
                                        <p className="text-[10px] uppercase text-neutral-500">{item.saleType}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-neutral-200">
                                        {item.saleType === 'AUCTION'
                                            ? `$${(item.startingPrice || 0).toLocaleString()}`
                                            : `$${(item.buyNowPrice || 0).toLocaleString()}`}
                                    </p>
                                    <p className={`text-[10px] ${item.status === 'PUBLISHED' ? 'text-green-400' : 'text-neutral-500'}`}>
                                        {item.status}
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
