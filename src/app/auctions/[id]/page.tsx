// src/app/auctions/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ProductGallery } from "@/components/auction/product-gallery";
import { CountdownTimer } from "@/components/auction/countdown-timer";
import { cn } from "@/lib/utils";

/**
 * Server Action – יצירת BID חדש עם ולידציות מלאות
 */
async function placeBidAction(formData: FormData) {
  "use server";

  // Import dynamically to avoid circular issues if any, but standard import is fine usually
  const { createNotification } = await import("@/lib/notifications");

  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  const user = session.user as any;
  const userId = user.id as string | undefined;

  if (!userId) {
    redirect("/sign-in");
  }

  const itemId = formData.get("itemId")?.toString();
  const amountRaw = formData.get("amount")?.toString();

  if (!itemId || !amountRaw) {
    redirect("/auctions?error=Invalid+bid+submission");
  }

  const amount = Number(amountRaw);
  if (!Number.isFinite(amount) || amount <= 0) {
    redirect(
      `/auctions/${itemId}?error=${encodeURIComponent(
        "Bid amount must be a positive number",
      )}`,
    );
  }

  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: {
      seller: true,
      bids: {
        orderBy: { amount: "desc" },
        take: 1,
      },
    },
  });

  if (!item || item.saleType !== "AUCTION") {
    redirect("/auctions");
  }

  if (item.status !== "PUBLISHED") {
    redirect(
      `/auctions/${item.id}?error=${encodeURIComponent(
        "This auction is not open for bidding",
      )}`,
    );
  }

  if (item.auctionEnd && item.auctionEnd.getTime() <= Date.now()) {
    redirect(
      `/auctions/${item.id}?error=${encodeURIComponent(
        "This auction has already ended",
      )}`,
    );
  }

  if (item.sellerId === userId) {
    redirect(
      `/auctions/${item.id}?error=${encodeURIComponent(
        "You cannot bid on your own listing",
      )}`,
    );
  }

  const highestBidAmount = item.bids[0]?.amount ?? null;
  const basePrice = highestBidAmount ?? item.startingPrice ?? 0;
  const minIncrement = 1; // אפשר לשדרג בעתיד למדרגות חכמות
  const minAllowed = basePrice + minIncrement;

  if (amount < minAllowed) {
    const msg = `Bid too low. Minimum allowed is ${item.currency || "USD"} ${minAllowed.toLocaleString()}`;
    redirect(
      `/auctions/${item.id}?error=${encodeURIComponent(msg)}`,
    );
  }

  // Anti-Sniping: Extend if bid within last 5 minutes
  let newEndTime = item.auctionEnd;
  const fiveMinutesInMillis = 5 * 60 * 1000;
  const timeRemaining = item.auctionEnd ? item.auctionEnd.getTime() - Date.now() : 0;

  if (item.auctionEnd && timeRemaining < fiveMinutesInMillis) {
    newEndTime = new Date(Date.now() + fiveMinutesInMillis);
  }

  // Update Item with new end time if changed
  await prisma.item.update({
    where: { id: item.id },
    data: { auctionEnd: newEndTime }
  });

  await prisma.bid.create({
    data: {
      amount,
      itemId: item.id,
      bidderId: userId,
    },
  });

  // 1. Notify Seller
  if (item.sellerId !== userId) {
    await createNotification({
      userId: item.sellerId,
      title: "New Bid",
      message: `A new bid of ${item.currency || "USD"} ${amount.toLocaleString()} was placed on "${item.title}".`,
      link: `/auctions/${item.id}`
    });
  }

  // 2. Notify Outbid User (if exists)
  if (item.bids.length > 0) {
    const lastBidderId = item.bids[0].bidderId;
    // Don't notify if the outbid person is the same as the new bidder (re-bidding)
    if (lastBidderId !== userId) {
      await createNotification({
        userId: lastBidderId,
        title: "You've been outbid!",
        message: `Someone placed a higher bid on "${item.title}". Check it out now.`,
        type: "WARNING",
        link: `/auctions/${item.id}`
      });
    }
  }

  redirect(`/auctions/${item.id}`);
}


export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await prisma.item.findUnique({ where: { id } });

  if (!item) return { title: "Item Not Found" };

  return {
    title: `${item.title} | Lux Auction`,
    description: item.description?.slice(0, 160) || `Bid on ${item.title} at Lux Auction.`,
    openGraph: {
      images: item.mainImageUrl ? [item.mainImageUrl] : [],
    },
  };
}

export default async function AuctionDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const errorMessage =
    typeof sp.error === "string" ? sp.error : undefined;

  if (!id) {
    notFound();
  }

  const session = await auth();
  const currentUser = session?.user as any | undefined;
  const currentUserId = currentUser?.id as string | undefined;

  const item = await prisma.item.findUnique({
    where: { id },
    include: {
      seller: true,
      bids: {
        include: { bidder: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!item || item.saleType !== "AUCTION") {
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

  const bids = item.bids;
  const bidCount = bids.length;

  const highestBidAmount =
    bidCount > 0
      ? bids.reduce(
        (max, b) => (b.amount > max ? b.amount : max),
        bids[0].amount,
      )
      : null;

  const currentPrice =
    highestBidAmount != null
      ? highestBidAmount
      : startingPrice ?? null;

  const now = Date.now();
  const auctionEndDate = endsAt ? new Date(endsAt) : null;
  const auctionEnded = auctionEndDate
    ? auctionEndDate.getTime() <= now
    : false;

  const isOpenForBidding =
    item.status === "PUBLISHED" && !auctionEnded;

  const isSellerOfItem =
    !!currentUserId && currentUserId === item.sellerId;

  const canBid =
    !!currentUserId && !isSellerOfItem && isOpenForBidding;

  const minIncrement = 1;
  const basePriceForNextBid =
    currentPrice != null ? currentPrice : 0;
  const minNextBid =
    basePriceForNextBid > 0
      ? basePriceForNextBid + minIncrement
      : 1;

  const sellerDisplayName =
    item.seller?.name ||
    item.seller?.email ||
    "Unknown seller";

  return (
    <div className="space-y-6">
      {/* Top navigation bar */}
      <div className="flex items-center justify-between gap-2 text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <Link
            href="/auctions"
            className="rounded-full border border-neutral-700 bg-neutral-900/80 px-3 py-1.5 text-neutral-300 transition-colors hover:border-neutral-500 hover:text-white"
          >
            ← Back to auctions
          </Link>
          <span className="hidden text-[10px] uppercase tracking-[0.2em] text-neutral-500 md:inline">
            Auction lot
          </span>
        </div>
        {endsAt && (
          <span
            className={cn(
              "rounded-full border px-4 py-1.5 text-[11px] font-semibold",
              auctionEnded
                ? "border-neutral-700 bg-neutral-800/80 text-neutral-400"
                : "border-amber-500/40 bg-amber-500/10 text-amber-200"
            )}
          >
            {auctionEnded ? "ENDED" : "ENDS IN: "}
            {endsAt && !auctionEnded ? (
              <CountdownTimer endDate={new Date(endsAt)} className="inline-flex text-xs font-bold" />
            ) : (
              <span className="font-normal text-neutral-400">
                {new Date(endsAt!).toLocaleString("en-GB")}
              </span>
            )}
          </span>
        )}
      </div>

      <div className="grid gap-8 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        {/* צד שמאל – מידע על הלוט */}
        <div className="space-y-5 rounded-2xl border border-neutral-800 bg-neutral-950/90 p-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            Auction lot
          </p>
          <h1 className="text-2xl font-semibold text-white">
            {title}
          </h1>

          <p className="text-xs text-neutral-400">
            Seller:{" "}
            <span className="font-medium text-neutral-100">
              {sellerDisplayName}
            </span>
          </p>

          {description && (
            <p className="mt-3 text-sm leading-relaxed text-neutral-200">
              {description}
            </p>
          )}

          {/* עכשיו משתמשים בגלריה אמיתית */}
          <div className="mt-4">
            <ProductGallery
              images={anyItem.mainImageUrl ? [anyItem.mainImageUrl] : []}
              title={title}
            />
          </div>

          {/* היסטוריית בידים */}
          <div className="mt-5 space-y-2 rounded-xl border border-neutral-800 bg-black/70 p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
              Recent bids
            </p>
            {bidCount === 0 ? (
              <p className="text-xs text-neutral-500">
                No bids placed yet. Be the first to bid.
              </p>
            ) : (
              <div className="space-y-2 text-xs text-neutral-200">
                {bids.slice(0, 6).map((bid) => {
                  const bidderName =
                    bid.bidder?.name ||
                    bid.bidder?.email ||
                    "Bidder";
                  return (
                    <div
                      key={bid.id}
                      className="flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-800 text-[10px] font-semibold uppercase text-neutral-100">
                          {bidderName.charAt(0)}
                        </span>
                        <span className="text-[11px] text-neutral-300">
                          {currency} {bid.amount.toLocaleString()}
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-500">
                        {new Date(
                          bid.createdAt,
                        ).toLocaleString("en-GB")}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right side - Bidding Panel */}
        <div className="space-y-5 rounded-2xl border border-neutral-800 bg-neutral-950/90 p-6">
          {/* Panel Header */}
          <div className="border-b border-neutral-800 pb-4">
            <h2 className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
              Bidding Panel
            </h2>
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-[12px] text-red-200">
              {errorMessage}
            </div>
          )}

          {/* Current Price Block - Prominent */}
          <div className="rounded-xl bg-neutral-900/60 p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
              {currentPrice != null ? "Current Bid" : "Starting Price"}
            </p>
            {currentPrice != null ? (
              <p className="mt-1 text-2xl font-bold text-white">
                {currency} {Number(currentPrice).toLocaleString()}
              </p>
            ) : startingPrice != null ? (
              <p className="mt-1 text-2xl font-bold text-white">
                {currency} {Number(startingPrice).toLocaleString()}
              </p>
            ) : (
              <p className="mt-1 text-lg text-neutral-400">
                No starting price set
              </p>
            )}

            {/* Bid count */}
            {bidCount > 0 && (
              <p className="mt-2 text-xs text-neutral-400">
                {bidCount} bid{bidCount !== 1 ? "s" : ""} placed
              </p>
            )}
          </div>

          {/* Auction Status Info */}
          <div className="space-y-2 text-xs">
            {auctionEndDate && (
              <p className="text-neutral-400">
                Auction {auctionEnded ? "ended" : "ends"} at:{" "}
                <span className="text-neutral-300">
                  {auctionEndDate.toLocaleString("en-GB")}
                </span>
              </p>
            )}

            {!isOpenForBidding && (
              <p className="rounded-lg bg-neutral-900 px-3 py-2 text-[11px] text-neutral-400">
                This auction is currently closed for bidding.
              </p>
            )}
          </div>

          {/* Auth/Permission notices */}
          {!currentUserId && (
            <div className="rounded-xl border border-neutral-700 bg-neutral-900/80 px-4 py-3 text-[12px] text-neutral-300">
              Please{" "}
              <Link
                href="/sign-in"
                className="font-semibold text-white underline-offset-2 hover:underline"
              >
                sign in
              </Link>{" "}
              to place a bid on this lot.
            </div>
          )}

          {currentUserId && isSellerOfItem && (
            <div className="rounded-xl border border-neutral-700 bg-neutral-900/80 px-4 py-3 text-[12px] text-neutral-400">
              You are the seller of this lot. Sellers cannot bid on their own listings.
            </div>
          )}

          {/* Bid Form */}
          <form
            action={placeBidAction}
            className="space-y-4"
          >
            <input type="hidden" name="itemId" value={item.id} />

            <div className="space-y-2">
              <label
                htmlFor="bid-amount"
                className="block text-[11px] uppercase tracking-[0.18em] text-neutral-500"
              >
                Your bid
              </label>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-neutral-500">
                    {currency}
                  </span>
                  <input
                    id="bid-amount"
                    name="amount"
                    type="number"
                    min={minNextBid}
                    step={1}
                    inputMode="numeric"
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-900/80 py-3 pl-12 pr-4 text-base text-white outline-none transition-colors focus:border-neutral-500 disabled:opacity-50"
                    placeholder={minNextBid.toLocaleString()}
                    disabled={!canBid}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-primary-soft disabled:bg-neutral-700 disabled:text-neutral-400"
                  disabled={!canBid}
                >
                  Place Bid
                </button>
              </div>

              <p className="text-[11px] text-neutral-500">
                Minimum:{" "}
                <span className="text-neutral-300">
                  {currency} {minNextBid.toLocaleString()}
                </span>
              </p>
            </div>
          </form>

          {/* Fine print */}
          <p className="border-t border-neutral-800 pt-4 text-[10px] leading-relaxed text-neutral-600">
            All bids are binding. Review our terms before placing a bid.
          </p>
        </div>
      </div>
    </div>
  );
}
