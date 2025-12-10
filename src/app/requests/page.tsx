import { prisma } from "@/lib/prisma";

export default async function RequestsPage() {
  const requests = await prisma.request.findMany({
    orderBy: { createdAt: "desc" },
    include: { buyer: true },
    take: 50,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Active Requests</h1>
      <p className="mt-2 text-sm text-neutral-300">
        Buyers are looking for specific pieces. Respond with matching items.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {requests.length === 0 && (
          <p className="text-sm text-neutral-400">
            No active requests yet. Create one from the Request Item page.
          </p>
        )}

        {requests.map((req) => (
          <div
            key={req.id}
            className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4"
          >
            <p className="text-[11px] uppercase tracking-wide text-neutral-400">
              {req.category || "Category"}
            </p>
            <h2 className="mt-1 text-sm font-semibold">{req.title}</h2>

            {req.description && (
              <p className="mt-1 text-xs text-neutral-300">
                {req.description}
              </p>
            )}

            <p className="mt-2 text-xs text-neutral-400">
              Budget:{" "}
              <span className="text-neutral-100">
                {req.budgetMax
                  ? `$${req.budgetMax.toLocaleString()}`
                  : "Not specified"}
              </span>{" "}
              {req.currency}
            </p>

            <p className="mt-1 text-[11px] text-neutral-500">
              Buyer: {req.buyer?.name || req.buyer?.email || "Unknown"}
            </p>

            <button className="mt-3 inline-flex items-center rounded-full border border-blue-500 px-3 py-1.5 text-[11px] font-semibold text-blue-300 hover:bg-blue-500/10">
              I have a matching item
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
