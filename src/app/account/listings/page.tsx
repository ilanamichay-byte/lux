
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isSellerRole } from "@/lib/roles";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function MyListingsPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/sign-in");
    }

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    if (!isSellerRole(userRole)) {
        redirect("/become-seller");
    }

    const items = await prisma.item.findMany({
        where: { sellerId: userId },
        orderBy: { createdAt: "desc" },
        include: {
            bids: {
                orderBy: { amount: "desc" },
                take: 1
            },
            deals: true
        }
    });

    return (
        <div className="mx-auto max-w-4xl px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold">My Listings</h1>
                <Link href="/seller/list-item" className="rounded-full bg-yellow-500 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-400">
                    New Listing
                </Link>
            </div>

            {items.length === 0 ? (
                <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-8 text-center">
                    <p className="text-neutral-400">You haven&apos;t listed any items yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {items.map((item) => {
                        const highestBid = item.bids[0]?.amount;
                        const bidCount = item.bids.length; // Actually we need `_count` or fetch all, here we fetched all bids... wait `include bids` fetches all? Default is all, but `take: 1` limits it.
                        // Oh right, the above query `bids: { take: 1 }` only gets the top bid. We don't have the count.
                        // Let's modify the query in a real app, but for now we just show top bid.

                        return (
                            <div
                                key={item.id}
                                className="flex flex-col gap-4 rounded-xl border border-neutral-800 bg-neutral-950 p-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-900 border border-neutral-800">
                                        {item.mainImageUrl ? (
                                            <img src={item.mainImageUrl} alt={item.title} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-[10px] text-neutral-600">No Image</div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-neutral-200">
                                            {item.title}
                                        </h3>
                                        <p className="text-xs text-neutral-400">
                                            {item.saleType === "AUCTION" ? "Auction" : "Direct Sale"}
                                        </p>
                                        <div className="mt-1">
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border ${item.status === 'PUBLISHED' ? 'border-green-500/20 bg-green-500/10 text-green-400' :
                                                    item.status === 'SOLD' ? 'border-neutral-600 bg-neutral-800 text-neutral-300' :
                                                        'border-yellow-500/20 bg-yellow-500/10 text-yellow-400'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-6 sm:justify-end">
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase tracking-wider text-neutral-500">
                                            {item.saleType === "AUCTION" ? "Highest Bid" : "Price"}
                                        </p>
                                        <p className="font-medium text-neutral-200">
                                            {item.currency || 'USD'} {
                                                item.saleType === "AUCTION"
                                                    ? (highestBid?.toLocaleString() ?? '-')
                                                    : item.buyNowPrice?.toLocaleString()
                                            }
                                        </p>
                                    </div>
                                    <Link href={`/auctions/${item.id}`} className="text-sm text-yellow-400 hover:underline">
                                        View
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
