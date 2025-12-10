import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function RequestedItemsPage() {
  const requests = await prisma.request.findMany({
    orderBy: { createdAt: "desc" },
    include: { buyer: true },
    take: 50,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Requested Items</h1>
      <p className="mt-2 text-sm text-neutral-300">
        Browse what buyers are looking for and respond with matching pieces.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {requests.length === 0 && (
          <p className="text-sm text-neutral-400">
            No active requests yet. Buyers can create requests from the
            &quot;Request Item&quot; page.
          </p>
        )}

        {requests.map((req) => (
          <Link
            key={req.id}
            href={`/requested-items/${req.id}`}
            className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 transition hover:border-blue-500/70 hover:bg-neutral-900/70"
          >
            <div className="relative h-40 w-full bg-neutral-900">
              <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-wide text-neutral-500">
                Requested Item
              </div>
              <div className="absolute left-3 top-3 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                Looking For
              </div>
            </div>

            <div className="space-y-1 px-4 py-3">
              <p className="text-[11px] uppercase tracking-wide text-neutral-400">
                {req.category || "Category"}
              </p>

              <h2 className="text-sm font-semibold">{req.title}</h2>

              {req.description && (
                <p className="text-xs text-neutral-300 line-clamp-3">
                  {req.description}
                </p>
              )}

              <p className="mt-1 text-xs text-neutral-400">
                Budget:{" "}
                <span className="text-neutral-100">
                  {req.budgetMax
                    ? `$${req.budgetMax.toLocaleString()}`
                    : "Not specified"}
                </span>{" "}
                {req.currency}
              </p>

              <p className="text-[11px] text-neutral-500">
                Buyer: {req.buyer?.name || req.buyer?.email || "Unknown"}
              </p>

              <p className="mt-2 text-[11px] font-semibold text-blue-300">
                View details & respond →
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
