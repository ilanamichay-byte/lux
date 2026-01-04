// src/app/auctions/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Pagination } from "@/components/ui/pagination";
import { formatPrice } from "@/lib/format";

const ITEMS_PER_PAGE = 12;

export const metadata = {
  title: "Live Auctions | LUX AUCTION",
  description: "Browse live auctions for luxury jewelry, diamonds, and timepieces",
};

export default async function AuctionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page || "1", 10));
  const now = new Date();

  // Get total count for pagination
  const totalCount = await prisma.item.count({
    where: {
      saleType: "AUCTION",
      status: "PUBLISHED",
      OR: [
        { auctionEnd: null },
        { auctionEnd: { gt: now } },
      ],
    },
  });

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const items = await prisma.item.findMany({
    where: {
      saleType: "AUCTION",
      status: "PUBLISHED",
      OR: [
        { auctionEnd: null },
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
    skip: (currentPage - 1) * ITEMS_PER_PAGE,
    take: ITEMS_PER_PAGE,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold text-gray-100">Live Auctions</h1>
          <p className="mt-2 text-sm text-gray-400">
            Discover exceptional pieces from verified sellers.
            {totalCount > 0 && (
              <span className="ml-2 text-gray-500">
                ({totalCount} active auction{totalCount !== 1 ? "s" : ""})
              </span>
            )}
          </p>
        </div>

        <Link
          href="/auctions/history"
          className="rounded-lg border border-border px-3 py-1.5 text-xs text-gray-300 hover:border-gray-500 hover:text-white transition-colors"
        >
          View past auctions
        </Link>
      </div>

      {/* Grid */}
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {items.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg border border-border bg-card-elevated">
              <svg className="h-8 w-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-medium text-gray-100">No live auctions</h2>
            <p className="mt-1 text-sm text-gray-500">
              New auctions will appear here. Check back soon!
            </p>
          </div>
        )}

        {items.map((item) => {
          const bids = item.bids as { amount: number }[];
          const bidCount = bids.length;
          const highestBidAmount = bids.length > 0
            ? Math.max(...bids.map(b => b.amount))
            : null;
          const basePrice = highestBidAmount ?? item.startingPrice ?? null;
          const currency = item.currency ?? "USD";

          return (
            <Link
              key={item.id}
              href={`/auctions/${item.id}`}
              className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-gray-600"
            >
              <div className="relative h-48 w-full overflow-hidden bg-card-elevated">
                {item.mainImageUrl ? (
                  <img
                    src={item.mainImageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-600">
                    <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="absolute left-3 top-3 flex items-center gap-1 rounded-md bg-negative px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  Live
                </div>
              </div>

              <div className="space-y-2 px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.15em] text-gray-500">
                  {item.category || "Luxury Item"}
                </p>
                <h2 className="text-sm font-medium text-gray-100 line-clamp-2 group-hover:text-white transition-colors">
                  {item.title}
                </h2>

                <p className="text-xs text-gray-500">
                  Seller:{" "}
                  <span className="text-gray-300">
                    {item.seller?.name || item.seller?.email || "Unknown"}
                  </span>
                </p>

                {basePrice != null && (
                  <div className="flex items-baseline gap-2">
                    <p className="font-mono text-base font-semibold text-gray-100">
                      {formatPrice(basePrice, currency)}
                    </p>
                    {bidCount > 0 && (
                      <span className="text-[10px] text-positive">
                        {bidCount} bid{bidCount === 1 ? "" : "s"}
                      </span>
                    )}
                  </div>
                )}

                {item.auctionEnd && (
                  <p className="text-[10px] text-gray-500">
                    Ends: {new Date(item.auctionEnd).toLocaleString("en-GB", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          baseUrl="/auctions"
          className="mt-12"
        />
      )}
    </div>
  );
}

