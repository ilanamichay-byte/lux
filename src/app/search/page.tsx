
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const sp = await searchParams;
    const q = typeof sp.q === "string" ? sp.q : "";
    const category = typeof sp.category === "string" ? sp.category : undefined;
    const minPrice = typeof sp.minPrice === "string" ? Number(sp.minPrice) : undefined;
    const maxPrice = typeof sp.maxPrice === "string" ? Number(sp.maxPrice) : undefined;

    const where: any = {
        status: "PUBLISHED",
        AND: [], // We'll push conditions here
    };

    // Text Search
    if (q) {
        where.AND.push({
            OR: [
                { title: { contains: q } },
                { description: { contains: q } },
                { category: { contains: q } }
            ]
        });
    }

    // Category Filter
    if (category) {
        where.AND.push({ category });
    }

    // Smart Price Filter (Checks EITHER Starting Price OR Buy Now Price)
    if (minPrice !== undefined || maxPrice !== undefined) {
        const priceConditions: any[] = [];

        // Condition for Auctions: startingPrice within range
        const auctionCondition: any = { saleType: "AUCTION" };
        if (minPrice !== undefined) auctionCondition.startingPrice = { gte: minPrice };
        if (maxPrice !== undefined) {
            if (!auctionCondition.startingPrice) auctionCondition.startingPrice = {};
            auctionCondition.startingPrice.lte = maxPrice;
        }

        // Condition for Direct Buy: buyNowPrice within range
        const directCondition: any = { saleType: "DIRECT" };
        if (minPrice !== undefined) directCondition.buyNowPrice = { gte: minPrice };
        if (maxPrice !== undefined) {
            if (!directCondition.buyNowPrice) directCondition.buyNowPrice = {};
            directCondition.buyNowPrice.lte = maxPrice;
        }

        where.AND.push({
            OR: [
                auctionCondition,
                directCondition
            ]
        });
    }

    const items = await prisma.item.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
            _count: { select: { bids: true } }
        }
    });

    const categories = await prisma.item.findMany({
        select: { category: true },
        distinct: ['category'],
        where: { status: 'PUBLISHED' }
    });

    return (
        <div className="flex min-h-screen flex-col md:flex-row">
            {/* Sidebar Filters */}
            <aside className="w-full border-r border-neutral-800 bg-neutral-950 p-6 md:w-64 md:min-h-screen">
                <h2 className="mb-6 text-lg font-bold text-white">Filters</h2>

                <form className="space-y-6">
                    <input type="hidden" name="q" value={q} />

                    {/* Category */}
                    <div>
                        <h3 className="mb-2 text-sm font-semibold text-neutral-400">Category</h3>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2">
                                <input type="radio" name="category" value="" defaultChecked={!category} className="accent-yellow-500" />
                                <span className="text-sm text-neutral-300">All Categories</span>
                            </label>
                            {categories.map(c => c.category && (
                                <label key={c.category} className="flex items-center gap-2">
                                    <input type="radio" name="category" value={c.category} defaultChecked={category === c.category} className="accent-yellow-500" />
                                    <span className="text-sm text-neutral-300">{c.category}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Price Range */}
                    <div>
                        <h3 className="mb-2 text-sm font-semibold text-neutral-400">Price Range</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                name="minPrice"
                                type="number"
                                placeholder="Min"
                                defaultValue={minPrice}
                                className="w-full rounded bg-neutral-900 px-2 py-1 text-sm text-white border border-neutral-700"
                            />
                            <input
                                name="maxPrice"
                                type="number"
                                placeholder="Max"
                                defaultValue={maxPrice}
                                className="w-full rounded bg-neutral-900 px-2 py-1 text-sm text-white border border-neutral-700"
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full" variant="secondary">
                        Apply Filters
                    </Button>

                    {(category || minPrice || maxPrice || q) && (
                        <Link href="/search" className="block text-center text-xs text-neutral-500 hover:text-white">
                            Clear All
                        </Link>
                    )}
                </form>
            </aside>

            {/* Results Grid */}
            <div className="flex-1 p-6 md:p-8">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-white">
                        {q ? `Results for "${q}"` : "All Items"}
                    </h1>
                    <span className="text-sm text-neutral-500">{items.length} items found</span>
                </div>

                {items.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-neutral-800 p-12 text-center">
                        <p className="text-lg font-medium text-neutral-400">No items match your search.</p>
                        <p className="text-sm text-neutral-600">Try adjusting your filters or search term.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {items.map((item) => (
                            <Link
                                key={item.id}
                                href={`/auctions/${item.id}`}
                                className="group relative flex flex-col overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50 transition-all hover:border-yellow-500/50 hover:shadow-lg"
                            >
                                <div className="aspect-square w-full overflow-hidden bg-neutral-950">
                                    {item.mainImageUrl ? (
                                        <img src={item.mainImageUrl} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-xs text-neutral-700">No Image</div>
                                    )}
                                    {item.saleType === 'AUCTION' && (
                                        <div className="absolute top-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase text-white backdrop-blur-sm">
                                            Auction
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-1 flex-col p-4">
                                    <h3 className="font-medium text-white group-hover:text-yellow-400 line-clamp-1">{item.title}</h3>
                                    <p className="mb-2 text-xs text-neutral-500">{item.category}</p>

                                    <div className="mt-auto flex items-center justify-between">
                                        <span className="font-mono text-sm font-semibold text-white">
                                            {item.currency} {(item.startingPrice || 0).toLocaleString()}
                                        </span>
                                        {item.saleType === 'AUCTION' && (
                                            <span className="text-[10px] text-neutral-500">
                                                {item._count.bids} Bids
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
