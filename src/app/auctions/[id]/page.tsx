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
          <span
            className={cn(
              "rounded-full border px-3 py-1 text-[10px] font-semibold",
              auctionEnded
                ? "border-neutral-600 bg-neutral-800 text-neutral-300"
                : "border-red-500/40 bg-red-500/10 text-red-200"
            )}
          >
            {auctionEnded ? "Ended: " : "Ends In: "}
            {endsAt && !auctionEnded ? (
              <CountdownTimer endDate={new Date(endsAt)} className="inline-flex text-xs" />
            ) : (
              new Date(endsAt!).toLocaleString("en-GB")
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

        {/* צד ימין – פאנל בידים */}
        <div className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-950/90 p-6">
          <h2 className="text-sm font-semibold text-white">
            Bidding panel
          </h2>

          {/* הודעת שגיאה מה־action אם יש */}
          {errorMessage && (
            <div className="rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-2 text-[11px] text-red-200">
              {errorMessage}
            </div>
          )}

          <div className="space-y-2 text-sm text-neutral-200">
            {currentPrice != null ? (
              <p>
                Current bid:{" "}
                <span className="font-semibold text-yellow-300">
                  {currency}{" "}
                  {Number(currentPrice).toLocaleString()}
                </span>
              </p>
            ) : startingPrice != null ? (
              <p>
                Starting price:{" "}
                <span className="font-semibold text-yellow-300">
                  {currency}{" "}
                  {Number(startingPrice).toLocaleString()}
                </span>
              </p>
            ) : (
              <p className="text-xs text-neutral-400">
                No starting price defined yet.
              </p>
            )}

            {bidCount > 0 && (
              <p className="text-xs text-neutral-400">
                Bids placed:{" "}
                <span className="font-semibold text-neutral-200">
                  {bidCount}
                </span>
              </p>
            )}

            {auctionEndDate && (
              <p className="text-xs text-neutral-400">
                Auction{" "}
                {auctionEnded ? "ended" : "ends"} at:{" "}
                {auctionEndDate.toLocaleString("en-GB")}
              </p>
            )}

            {!isOpenForBidding && (
              <p className="mt-1 text-[11px] text-red-300">
                This auction is currently closed for bidding.
              </p>
            )}
          </div>

          {/* לוגיקה למי יכול לבצע בידים */}
          {!currentUserId && (
            <div className="mt-3 rounded-xl border border-neutral-800 bg-black/70 px-4 py-3 text-[11px] text-neutral-300">
              Please{" "}
              <Link
                href="/sign-in"
                className="font-semibold text-yellow-300 underline-offset-2 hover:underline"
              >
                sign in
              </Link>{" "}
              to place a bid on this lot.
            </div>
          )}

          {currentUserId && isSellerOfItem && (
            <div className="mt-3 rounded-xl border border-neutral-800 bg-black/70 px-4 py-3 text-[11px] text-neutral-300">
              You are the seller of this lot. Sellers cannot bid on
              their own listings.
            </div>
          )}

          {/* טופס BID אמיתי */}
          <form
            action={placeBidAction}
            className="mt-4 space-y-3"
          >
            <input type="hidden" name="itemId" value={item.id} />

            <div className="space-y-1 text-xs text-neutral-300">
              <label
                htmlFor="bid-amount"
                className="text-[11px] uppercase tracking-[0.18em] text-neutral-500"
              >
                Your bid
              </label>
              <div className="flex gap-2">
                <input
                  id="bid-amount"
                  name="amount"
                  type="number"
                  min={minNextBid}
                  step={1}
                  inputMode="numeric"
                  className="flex-1 rounded-full border border-neutral-700 bg-black/60 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-yellow-400"
                  placeholder={`${currency} ${minNextBid.toLocaleString()}`}
                  disabled={!canBid}
                  required
                />
                <button
                  type="submit"
                  className="flex items-center justify-center rounded-full bg-yellow-500 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-400 disabled:bg-neutral-700 disabled:text-neutral-300"
                  disabled={!canBid}
                >
                  Place bid
                </button>
              </div>
              <p className="text-[11px] text-neutral-500">
                Minimum allowed:{" "}
                <span className="font-semibold text-neutral-200">
                  {currency} {minNextBid.toLocaleString()}
                </span>
              </p>
            </div>
          </form>

          <p className="pt-2 text-[10px] leading-relaxed text-neutral-500">
            In the production version this panel will connect to a live
            bidding engine, payment, escrow and compliance checks. For
            the MVP, bids are persisted in the database and can be
            reviewed in real time by the exchange team.
          </p>
        </div>
      </div>
    </div>
  );
}
