// src/app/auctions/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AuctionsPage() {
  const now = new Date();

  const items = await prisma.item.findMany({
    where: {
      saleType: "AUCTION",
      status: "PUBLISHED",
      OR: [
        // מכירות בלי auctionEnd עדיין נחשבות פעילות
        { auctionEnd: null },
        // מכירות עם זמן סיום – רק אם הוא בעתיד
        { auctionEnd: { gt: now } },
      ],
    },
    orderBy: { auctionEnd: "asc" },
    include: {
      seller: true,
      bids: {
        select: { amount: true },
      },
    },
    take: 12,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* כותרת + כפתור Past auctions */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-3xl font-semibold">Live Auctions</h1>
          <p className="mt-2 text-sm text-neutral-300">
            Discover exceptional pieces from verified sellers.
          </p>
        </div>

        <Link
          href="/auctions/history"
          className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-200 hover:border-yellow-400 hover:text-yellow-200"
        >
          View past auctions
        </Link>
      </div>

      {/* גריד האוקשיינז */}
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {items.length === 0 && (
          <p className="text-sm text-neutral-400">
            No live auctions at the moment. Once there are open lots with a
            future end time, they&apos;ll appear here.
          </p>
        )}

        {items.map((item) => {
          const bids = (item as any).bids as { amount: number }[] | undefined;
          const bidCount = bids?.length ?? 0;

          const highestBidAmount =
            bids && bids.length > 0
              ? bids.reduce(
                  (max, b) => (b.amount > max ? b.amount : max),
                  bids[0].amount,
                )
              : null;

          const basePrice =
            highestBidAmount != null
              ? highestBidAmount
              : item.startingPrice ?? null;

          const currency = item.currency ?? "USD";

          return (
            <Link
              key={item.id}
              href={`/auctions/${item.id}`}
              className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 transition hover:border-yellow-400/70 hover:bg-yellow-500/5"
            >
              <div className="relative h-52 w-full bg-neutral-900">
                <div className="flex h-full items-center justify-center text-xs text-neutral-600">
                  IMAGE
                </div>
                <div className="absolute left-3 top-3 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  Live
                </div>
              </div>

              <div className="space-y-1 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wide text-neutral-400">
                  {item.category || "Category"}
                </p>
                <h2 className="text-sm font-semibold line-clamp-2">
                  {item.title}
                </h2>

                <p className="text-xs text-neutral-400">
                  Seller:{" "}
                  <span className="text-neutral-200">
                    {item.seller?.name ||
                      item.seller?.email ||
                      "Unknown"}
                  </span>
                </p>

                {basePrice != null && (
                  <p className="text-xs font-medium text-yellow-400">
                    {bidCount > 0 ? "Current bid" : "Starting from"}:{" "}
                    {currency} {basePrice.toLocaleString()}{" "}
                    {bidCount > 0 && (
                      <span className="text-[10px] text-neutral-400">
                        · {bidCount} bid{bidCount === 1 ? "" : "s"}
                      </span>
                    )}
                  </p>
                )}

                {item.auctionEnd && (
                  <p className="text-[11px] text-neutral-500">
                    Ends at:{" "}
                    {new Date(
                      item.auctionEnd,
                    ).toLocaleString("en-GB")}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
