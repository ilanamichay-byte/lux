// src/app/auctions/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function AuctionDetailsPage({
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
    // אם יש לך include / relations – אפשר להוסיף כאן
  });

  if (!item) {
    notFound();
  }

  const anyItem = item as any;

  const title =
    anyItem.title ??
    anyItem.name ??
    "Untitled auction lot";

  const description =
    anyItem.description ??
    "No description provided for this lot yet.";

  const currency = anyItem.currency ?? "USD";

  const startingPrice =
    anyItem.startingPrice ??
    anyItem.startPrice ??
    anyItem.reservePrice ??
    null;

  const buyNowPrice =
    anyItem.buyNowPrice ??
    anyItem.fixedPrice ??
    null;

  const endsAt =
  anyItem.auctionEnd ??
  anyItem.endsAt ??
  anyItem.endTime ??
  null;


  return (
    <div className="space-y-6">
      {/* ניווט עליון קטן */}
      <div className="flex items-center justify-between gap-2 text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <Link
            href="/auctions"
            className="rounded-full border border-neutral-800 bg-black/50 px-3 py-1 hover:border-yellow-400 hover:text-yellow-200"
          >
            ← Back to auctions
          </Link>
          <span className="hidden text-[10px] uppercase tracking-[0.2em] text-neutral-500 md:inline">
            Auction lot
          </span>
        </div>
        {endsAt && (
          <span className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-[10px] font-semibold text-red-200">
            Ends: {new Date(endsAt).toLocaleString("en-GB")}
          </span>
        )}
      </div>

      <div className="grid gap-8 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        {/* צד שמאל – מידע על הלוט */}
        <div className="space-y-5 rounded-2xl border border-neutral-800 bg-neutral-950/90 p-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            Auction lot
          </p>
          <h1 className="text-2xl font-semibold text-white">{title}</h1>

          {description && (
            <p className="text-sm leading-relaxed text-neutral-200">
              {description}
            </p>
          )}

          {/* פה אפשר בעתיד להוסיף תמונות / גלריה */}
          <div className="mt-4 rounded-xl border border-neutral-800 bg-black/60 px-4 py-3 text-xs text-neutral-400">
            <p>
              In the full product this page will show high–res imagery,
              certification, previous sale history and live bidding activity.
              For now this is a static details view for the MVP.
            </p>
          </div>
        </div>

        {/* צד ימין – פאנל בידים */}
        <div className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-950/90 p-6">
          <h2 className="text-sm font-semibold text-white">
            Bidding panel
          </h2>

          <div className="space-y-2 text-sm text-neutral-200">
            {startingPrice != null && (
              <p>
                Starting price:{" "}
                <span className="font-semibold text-yellow-300">
                  {currency}{" "}
                  {Number(startingPrice).toLocaleString()}
                </span>
              </p>
            )}
            {buyNowPrice != null && (
              <p>
                Buy now:{" "}
                <span className="font-semibold text-yellow-300">
                  {currency}{" "}
                  {Number(buyNowPrice).toLocaleString()}
                </span>
              </p>
            )}
            {endsAt && (
              <p className="text-xs text-neutral-400">
                Auction ends:{" "}
                {new Date(endsAt).toLocaleString("en-GB")}
              </p>
            )}
          </div>

          <div className="mt-4 space-y-2">
            <button
              type="button"
              className="flex w-full items-center justify-center rounded-full bg-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-400"
              disabled
            >
              Place bid (coming soon)
            </button>
            <button
              type="button"
              className="flex w-full items-center justify-center rounded-full border border-neutral-700 bg-black/70 px-4 py-2 text-xs font-semibold text-neutral-300"
              disabled
            >
              Contact exchange desk (coming soon)
            </button>
          </div>

          <p className="pt-2 text-[10px] leading-relaxed text-neutral-500">
            In the production version this panel will connect to the live
            bidding engine, payment, and compliance checks. For now it&apos;s
            here to give a realistic flow for buyers and sellers.
          </p>
        </div>
      </div>
    </div>
  );
}
