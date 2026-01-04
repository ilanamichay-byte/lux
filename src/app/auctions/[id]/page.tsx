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
      <div className="flex items-center justify-between gap-2 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <Link
            href="/auctions"
            className="rounded-lg border border-border bg-card-elevated px-3 py-1.5 text-gray-300 transition-colors hover:border-gray-500 hover:text-white"
          >
            ← Back to auctions
          </Link>
          <span className="hidden text-[10px] uppercase tracking-[0.15em] text-gray-500 md:inline">
            Auction lot
          </span>
        </div>
        {endsAt && (
          <span
            className={cn(
              "rounded-lg border px-4 py-1.5 text-[11px] font-medium",
              auctionEnded
                ? "border-border bg-card-elevated text-gray-400"
                : "border-warning/30 bg-warning-muted text-warning"
            )}
          >
            {auctionEnded ? "ENDED" : "ENDS IN: "}
            {endsAt && !auctionEnded ? (
              <CountdownTimer endDate={new Date(endsAt)} className="inline-flex text-xs font-bold" />
            ) : (
              <span className="font-normal text-gray-500">
                {new Date(endsAt!).toLocaleString("en-GB")}
              </span>
            )}
          </span>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        {/* Left side - Lot info */}
        <div className="space-y-5 rounded-xl border border-border bg-card p-6">
          <p className="text-[10px] uppercase tracking-[0.15em] text-gray-500">
            Auction lot
          </p>
          <h1 className="text-2xl font-semibold text-gray-100">
            {title}
          </h1>

          <p className="text-xs text-gray-400">
            Seller:{" "}
            <span className="font-medium text-gray-200">
              {sellerDisplayName}
            </span>
          </p>

          {description && (
            <p className="mt-3 text-sm leading-relaxed text-gray-300">
              {description}
            </p>
          )}

          {/* Product gallery */}
          <div className="mt-4">
            <ProductGallery
              images={anyItem.mainImageUrl ? [anyItem.mainImageUrl] : []}
              title={title}
            />
          </div>

          {/* Bid history */}
          <div className="mt-5 space-y-3 rounded-lg border border-border-subtle bg-card-elevated p-4">
            <p className="text-[10px] uppercase tracking-[0.15em] text-gray-500">
              Recent bids
            </p>
            {bidCount === 0 ? (
              <p className="text-xs text-gray-500">
                No bids placed yet. Be the first to bid.
              </p>
            ) : (
              <div className="space-y-2 text-xs">
                {bids.slice(0, 6).map((bid, idx) => {
                  const bidderName =
                    bid.bidder?.name ||
                    bid.bidder?.email ||
                    "Bidder";
                  const isLeading = idx === 0;
                  return (
                    <div
                      key={bid.id}
                      className="flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-medium uppercase ${isLeading ? "bg-positive/20 text-positive" : "bg-card-inner text-gray-300"
                          }`}>
                          {bidderName.charAt(0)}
                        </span>
                        <span className={`font-mono text-[11px] ${isLeading ? "text-positive font-medium" : "text-gray-300"
                          }`}>
                          {currency} {bid.amount.toLocaleString()}
                        </span>
                        {isLeading && (
                          <span className="text-[9px] uppercase tracking-wider text-positive">
                            Leading
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-500">
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
        <div className="space-y-5 rounded-xl border border-border bg-card p-6">
          {/* Panel Header */}
          <div className="border-b border-border-subtle pb-4">
            <h2 className="text-[10px] uppercase tracking-[0.15em] text-gray-500">
              Bidding Panel
            </h2>
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className="rounded-lg border border-negative/30 bg-negative-muted px-4 py-3 text-[12px] text-negative">
              {errorMessage}
            </div>
          )}

          {/* Current Price Block - Prominent */}
          <div className="rounded-lg bg-card-elevated p-4">
            <p className="text-[10px] uppercase tracking-[0.15em] text-gray-500">
              {currentPrice != null ? "Current Bid" : "Starting Price"}
            </p>
            {currentPrice != null ? (
              <p className="mt-1 font-mono text-2xl font-bold text-positive">
                {currency} {Number(currentPrice).toLocaleString()}
              </p>
            ) : startingPrice != null ? (
              <p className="mt-1 font-mono text-2xl font-bold text-gray-100">
                {currency} {Number(startingPrice).toLocaleString()}
              </p>
            ) : (
              <p className="mt-1 text-lg text-gray-500">
                No starting price set
              </p>
            )}

            {/* Bid count */}
            {bidCount > 0 && (
              <p className="mt-2 text-xs text-gray-400">
                {bidCount} bid{bidCount !== 1 ? "s" : ""} placed
              </p>
            )}
          </div>

          {/* Auction Status Info */}
          <div className="space-y-2 text-xs">
            {auctionEndDate && (
              <p className="text-gray-400">
                Auction {auctionEnded ? "ended" : "ends"} at:{" "}
                <span className="text-gray-300">
                  {auctionEndDate.toLocaleString("en-GB")}
                </span>
              </p>
            )}

            {!isOpenForBidding && (
              <p className="rounded-lg bg-card-inner px-3 py-2 text-[11px] text-gray-500">
                This auction is currently closed for bidding.
              </p>
            )}
          </div>

          {/* Auth/Permission notices */}
          {!currentUserId && (
            <div className="rounded-lg border border-border bg-card-elevated px-4 py-3 text-[12px] text-gray-300">
              Please{" "}
              <Link
                href="/sign-in"
                className="font-medium text-gray-100 underline-offset-2 hover:underline"
              >
                sign in
              </Link>{" "}
              to place a bid on this lot.
            </div>
          )}

          {currentUserId && isSellerOfItem && (
            <div className="rounded-lg border border-border bg-card-elevated px-4 py-3 text-[12px] text-gray-500">
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
                className="block text-[10px] uppercase tracking-[0.15em] text-gray-500"
              >
                Your bid
              </label>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    {currency}
                  </span>
                  <input
                    id="bid-amount"
                    name="amount"
                    type="number"
                    min={minNextBid}
                    step={1}
                    inputMode="numeric"
                    className="w-full rounded-lg border border-border bg-card-elevated py-3 pl-12 pr-4 font-mono text-base text-gray-100 outline-none transition-colors focus:border-gray-500 disabled:opacity-50"
                    placeholder={minNextBid.toLocaleString()}
                    disabled={!canBid}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:bg-muted disabled:text-gray-500"
                  disabled={!canBid}
                >
                  Place Bid
                </button>
              </div>

              <p className="text-[11px] text-gray-500">
                Minimum:{" "}
                <span className="font-mono text-gray-300">
                  {currency} {minNextBid.toLocaleString()}
                </span>
              </p>
            </div>
          </form>

          {/* Fine print */}
          <p className="border-t border-border-subtle pt-4 text-[10px] leading-relaxed text-gray-600">
            All bids are binding. Review our terms before placing a bid.
          </p>
        </div>
      </div>
    </div>
  );
}
