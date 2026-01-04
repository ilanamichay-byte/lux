// src/app/marketplace/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function MarketplacePage() {
  const items = await prisma.item.findMany({
    where: {
      saleType: "DIRECT",
      status: "PUBLISHED",
      buyNowPrice: { not: null },
    },
    orderBy: { createdAt: "desc" },
    include: { seller: true },
    take: 24,
  });


  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-gray-100">Marketplace</h1>
      <p className="mt-2 text-sm text-gray-400">
        Buy exceptional pieces directly from verified sellers.
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {items.length === 0 && (
          <p className="text-sm text-gray-500">
            No direct-buy items yet. Run the seed script or list an item as a
            seller to see it here.
          </p>
        )}

        {items.map((item) => (
          <div
            key={item.id}
            className="overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-gray-600"
          >
            <div className="relative h-48 w-full overflow-hidden bg-card-elevated">
              {item.mainImageUrl ? (
                <img
                  src={item.mainImageUrl}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-600">
                  <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            <div className="space-y-2 px-4 py-4">
              <p className="text-[10px] uppercase tracking-[0.15em] text-gray-500">
                {item.category || "Category"}
              </p>

              <h2 className="text-sm font-medium text-gray-100 line-clamp-2">
                {item.title}
              </h2>

              <p className="text-xs text-gray-500">
                Seller:{" "}
                <span className="text-gray-300">
                  {item.seller?.name || item.seller?.email || "Unknown"}
                </span>
              </p>

              <p className="font-mono text-base font-semibold text-gray-100">
                ${item.buyNowPrice!.toLocaleString()}
              </p>

              <Link
                href={`/marketplace/${item.id}`}
                className="mt-2 inline-flex w-full items-center justify-center rounded-lg border border-border bg-card-elevated px-3 py-2 text-xs font-medium text-gray-300 transition-colors hover:border-gray-500 hover:text-white"
              >
                {item.buyNowPrice != null ? "VIEW DETAILS" : "CONTACT SELLER"}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

