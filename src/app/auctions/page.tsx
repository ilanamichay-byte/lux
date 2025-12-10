import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AuctionsPage() {
  const items = await prisma.item.findMany({
  where: {
    saleType: "AUCTION",
    status: "PUBLISHED", // ✅ חדש
  },
  orderBy: { auctionEnd: "asc" },
  include: { seller: true },
  take: 12,
});


  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Live Auctions</h1>
      <p className="mt-2 text-sm text-neutral-300">
        Discover exceptional pieces from verified sellers.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {items.length === 0 && (
          <p className="text-sm text-neutral-400">
            No live auctions yet. Add an item in the database to see it here.
          </p>
        )}

        {items.map((item) => (
          <Link
            key={item.id}
            href={`/auctions/${item.id}`}
            className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 hover:border-yellow-400/70 hover:bg-yellow-500/5 transition"
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
              <h2 className="text-sm font-semibold">{item.title}</h2>

              <p className="text-xs text-neutral-400">
                Seller:{" "}
                <span className="text-neutral-200">
                  {item.seller?.name || item.seller?.email || "Unknown"}
                </span>
              </p>

              {item.startingPrice != null && (
                <p className="text-xs font-medium text-yellow-400">
                  Starting from ${item.startingPrice.toLocaleString()}
                </p>
              )}

              {item.auctionEnd && (
                <p className="text-[11px] text-neutral-500">
                  Ends at:{" "}
                  {new Date(item.auctionEnd).toLocaleString("en-GB")}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
