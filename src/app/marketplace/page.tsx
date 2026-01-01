// src/app/marketplace/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function MarketplacePage() {
  const items = await prisma.item.findMany({
    where: { 
      saleType: "DIRECT",
      status: "PUBLISHED",
     },
    orderBy: { createdAt: "desc" },
    include: { seller: true },
    take: 24,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Marketplace Highlights</h1>
      <p className="mt-2 text-sm text-neutral-300">
        Buy exceptional pieces directly from verified sellers.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {items.length === 0 && (
          <p className="text-sm text-neutral-400">
            No direct-buy items yet. Run the seed script or list an item as a
            seller to see it here.
          </p>
        )}

        {items.map((item) => (
          <div
            key={item.id}
            className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950"
          >
            <div className="relative h-52 w-full bg-neutral-900">
              <div className="flex h-full items-center justify-center text-xs text-neutral-600">
                IMAGE
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
                  {item.seller?.name || item.seller?.email || "Unknown"}
                </span>
              </p>

              {item.buyNowPrice != null && (
                <p className="text-xs font-medium text-yellow-400">
                  Price: ${item.buyNowPrice.toLocaleString()}
                </p>
              )}

              <Link
                href={`/marketplace/${item.id}`}
                className="mt-2 inline-flex w-full items-center justify-center rounded-full border border-yellow-500 px-3 py-1.5 text-xs font-semibold text-yellow-300 hover:bg-yellow-500/10"
              >
                BUY NOW
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
