
import { Hero } from "@/components/home/hero";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const featuredAuctions = await prisma.item.findMany({
    where: {
      saleType: "AUCTION",
      status: "PUBLISHED",
      // Simple filter for "Featured" - in real app could be a flag
      auctionEnd: { gt: new Date() },
    },
    take: 3,
    orderBy: { auctionEnd: "asc" },
    include: {
      _count: { select: { bids: true } },
    }
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Hero />

      {/* Featured Section */}
      <section className="relative z-10 mx-auto w-full max-w-7xl px-4 py-20">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              Live Auctions
            </h2>
            <p className="mt-2 text-neutral-400">
              Bid on verified luxury items ending soon.
            </p>
          </div>
          <Button variant="link" className="text-yellow-500" asChild>
            <Link href="/auctions">View All &rarr;</Link>
          </Button>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {featuredAuctions.map((item) => (
            <Link
              key={item.id}
              href={`/auctions/${item.id}`}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/50 transition-all hover:border-yellow-500/50 hover:shadow-2xl hover:shadow-yellow-500/10"
            >
              {/* Image Container */}
              <div className="aspect-[4/3] w-full overflow-hidden bg-neutral-950 px-2 lg:px-4">
                {item.mainImageUrl ? (
                  <img
                    src={item.mainImageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-neutral-900 text-neutral-700">
                    NO IMAGE
                  </div>
                )}

                <div className="absolute top-4 left-4 rounded-full bg-red-500/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                  Live
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-6">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                  {item.category || "Luxury Item"}
                </div>
                <h3 className="mb-2 text-lg font-bold text-white line-clamp-1 group-hover:text-yellow-400">
                  {item.title}
                </h3>

                <div className="mt-auto flex items-center justify-between border-t border-neutral-800 pt-4">
                  <div>
                    <span className="text-xs text-neutral-500">Current Bid</span>
                    <div className="font-mono text-lg font-medium text-white">
                      {item.currency || "$"}
                      {(item.startingPrice || 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-neutral-500">Ends In</span>
                    <div className="text-sm font-medium text-yellow-500">
                      {item.auctionEnd ? new Date(item.auctionEnd).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="border-t border-neutral-900 bg-neutral-950 py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 text-center md:grid-cols-3">
          <div>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10 text-3xl">🛡️</div>
            <h3 className="mb-2 text-xl font-bold text-white">Verified Authenticity</h3>
            <p className="text-sm text-neutral-400">Every item is vetted by our expert gemologists.</p>
          </div>
          <div>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10 text-3xl">⚖️</div>
            <h3 className="mb-2 text-xl font-bold text-white">Fair Market Value</h3>
            <p className="text-sm text-neutral-400">Transparent bidding history and market data.</p>
          </div>
          <div>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10 text-3xl">🔒</div>
            <h3 className="mb-2 text-xl font-bold text-white">Secure Transactions</h3>
            <p className="text-sm text-neutral-400">Escrow protection for both buyers and sellers.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
