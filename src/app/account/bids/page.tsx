
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function MyBidsPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/sign-in");
    }

    const userId = (session.user as any).id;

    const bids = await prisma.bid.findMany({
        where: { bidderId: userId },
        orderBy: { createdAt: "desc" },
        include: {
            item: {
                include: {
                    bids: {
                        orderBy: { amount: "desc" },
                        take: 1,
                    }
                }
            },
        },
    });

    return (
        <div className="mx-auto max-w-4xl px-4 py-8">
            <h1 className="mb-6 text-2xl font-semibold">My Bids</h1>

            {bids.length === 0 ? (
                <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-8 text-center">
                    <p className="text-neutral-400">You haven&apos;t placed any bids yet.</p>
                    <Link
                        href="/auctions"
                        className="mt-4 inline-block rounded-full bg-yellow-500 px-6 py-2 text-sm font-semibold text-black hover:bg-yellow-400"
                    >
                        Explore Auctions
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {bids.map((bid) => {
                        const item = bid.item;
                        const highestBid = item.bids[0]?.amount ?? 0;
                        const isWinning = highestBid === bid.amount;
                        const isAuctionEnded = item.auctionEnd && new Date(item.auctionEnd).getTime() < Date.now();

                        return (
                            <div
                                key={bid.id}
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
                                            <Link href={`/auctions/${item.id}`} className="hover:text-yellow-400">
                                                {item.title}
                                            </Link>
                                        </h3>
                                        <p className="text-xs text-neutral-400">
                                            Placed: {new Date(bid.createdAt).toLocaleDateString()}
                                        </p>
                                        <div className="mt-1 flex items-center gap-2">
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${isWinning
                                                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                                                }`}>
                                                {isWinning ? "HIGHEST BIDDER" : "OUTBID"}
                                            </span>
                                            {isAuctionEnded && isWinning && (
                                                <span className="inline-flex items-center rounded-full bg-yellow-500/10 px-2 py-0.5 text-[10px] font-medium text-yellow-500 border border-yellow-500/20">
                                                    WON
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-6 sm:justify-end">
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase tracking-wider text-neutral-500">Your Bid</p>
                                        <p className="font-medium text-neutral-200">{(item.currency || 'USD')} {bid.amount.toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase tracking-wider text-neutral-500">Current Price</p>
                                        <p className="font-medium text-yellow-400">{(item.currency || 'USD')} {highestBid.toLocaleString()}</p>
                                    </div>
                                    {(isAuctionEnded && isWinning) && (
                                        <Link href={`/checkout/${item.id}`} className="rounded-full bg-green-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-green-500">
                                            Pay Now
                                        </Link>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
