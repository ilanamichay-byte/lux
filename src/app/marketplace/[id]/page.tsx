// src/app/marketplace/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function MarketplaceItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const item = await prisma.item.findUnique({
    where: { id },
    // אפשר להוסיף include אם יש relations רלוונטיים
  });

  if (!item) {
    notFound();
  }

  const anyItem = item as any;

  const title =
    anyItem.title ??
    anyItem.name ??
    "Untitled marketplace item";

  const description =
    anyItem.description ??
    "No description provided for this listing yet.";

  const currency = anyItem.currency ?? "USD";

  const price =
    anyItem.fixedPrice ??
    anyItem.listPrice ??
    anyItem.price ??
    null;

  return (
    <div className="space-y-6">
      {/* ניווט עליון קטן */}
      <div className="flex items-center justify-between gap-2 text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <Link
            href="/marketplace"
            className="rounded-full border border-neutral-800 bg-black/50 px-3 py-1 hover:border-yellow-400 hover:text-yellow-200"
          >
            ← Back to marketplace
          </Link>
          <span className="hidden text-[10px] uppercase tracking-[0.2em] text-neutral-500 md:inline">
            Marketplace listing
          </span>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        {/* צד שמאל – מידע על הפריט */}
        <div className="space-y-5 rounded-2xl border border-neutral-800 bg-neutral-950/90 p-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            Marketplace
          </p>
          <h1 className="text-2xl font-semibold text-white">{title}</h1>

          {description && (
            <p className="text-sm leading-relaxed text-neutral-200">
              {description}
            </p>
          )}

          <div className="mt-4 rounded-xl border border-neutral-800 bg-black/60 px-4 py-3 text-xs text-neutral-400">
            <p>
              In the full marketplace experience this page will show detailed
              specs, certification, seller profile and recommended comparable
              pieces. For now it&apos;s a simplified details view to support
              navigation and flows.
            </p>
          </div>
        </div>

        {/* צד ימין – פאנל קנייה */}
        <div className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-950/90 p-6">
          <h2 className="text-sm font-semibold text-white">
            Purchase panel
          </h2>

          <div className="space-y-2 text-sm text-neutral-200">
            {price != null ? (
              <p>
                Price:{" "}
                <span className="font-semibold text-yellow-300">
                  {currency} {Number(price).toLocaleString()}
                </span>
              </p>
            ) : (
              <p className="text-xs text-neutral-400">
                Price will be defined in the full product.
              </p>
            )}
          </div>

          <div className="mt-4 space-y-2">
            <button
              type="button"
              className="flex w-full items-center justify-center rounded-full bg-yellow-500 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-400 disabled:bg-neutral-700 disabled:text-neutral-300"
              disabled
            >
              Buy now (coming soon)
            </button>
            <button
              type="button"
              className="flex w-full items-center justify-center rounded-full border border-neutral-700 bg-black/70 px-4 py-2 text-xs font-semibold text-neutral-300"
              disabled
            >
              Contact seller (coming soon)
            </button>
          </div>

          <p className="pt-2 text-[10px] leading-relaxed text-neutral-500">
            Later this will integrate with payment, escrow and shipping flows.
            For the MVP we&apos;re focusing on listings, discovery and matching.
          </p>
        </div>
      </div>
    </div>
  );
}
