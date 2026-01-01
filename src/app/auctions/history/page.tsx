// src/app/auctions/history/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function PastAuctionsPage() {
  const now = new Date();

  const items = await prisma.item.findMany({
    where: {
      saleType: "AUCTION",
      status: "PUBLISHED",
      auctionEnd: { lte: now }, // רק כאלה שכבר נגמרו
    },
    orderBy: { auctionEnd: "desc" },
    include: {
      seller: true,
      bids: {
        select: { amount: true },
      },
    },
    take: 24,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-3xl font-semibold">
            Past auctions
          </h1>
          <p className="mt-2 text-sm text-neutral-300">
            Closed lots for internal review and future analytics.
          </p>
        </div>

        <Link
          href="/auctions"
          className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-200 hover:border-yellow-400 hover:text-yellow-200"
        >
          ← Back to live auctions
        </Link>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {items.length === 0 && (
          <p className="text-sm text-neutral-400">
            No closed auctions yet. Once auctions end, they&apos;ll appear
            here for historical review.
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

          const finalPrice = highestBidAmount ?? item.startingPrice ?? null;
          const currency = item.currency ?? "USD";

          return (
            <div
              key={item.id}
              className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950"
            >
              <div className="relative h-52 w-full bg-neutral-900">
                <div className="flex h-full items-center justify-center text-xs text-neutral-600">
                  IMAGE
                </div>
                <div className="absolute left-3 top-3 rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-200">
                  Closed
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

                {finalPrice != null && (
                  <p className="text-xs font-medium text-neutral-300">
                    Final price:{" "}
                    <span className="text-yellow-300">
                      {currency} {finalPrice.toLocaleString()}
                    </span>{" "}
                    {bidCount > 0 && (
                      <span className="text-[10px] text-neutral-500">
                        · {bidCount} bid{bidCount === 1 ? "" : "s"}
                      </span>
                    )}
                  </p>
                )}

                {item.auctionEnd && (
                  <p className="text-[11px] text-neutral-500">
                    Ended at:{" "}
                    {new Date(
                      item.auctionEnd,
                    ).toLocaleString("en-GB")}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
