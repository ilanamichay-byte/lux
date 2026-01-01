// src/app/deals/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { isAdminRole, type UserRole } from "@/lib/roles";
import Link from "next/link";

export default async function DealDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  const user = session.user as any;
  const userId = user.id as string | undefined;
  const role = (user.role as UserRole | undefined) ?? "BUYER";

  if (!userId) {
    redirect("/sign-in");
  }

  const isAdmin = isAdminRole(role);

  const deal = await prisma.deal.findUnique({
    where: { id },
    include: {
      buyer: true,
      seller: true,
      request: true,
      offer: true,
      item: true,
    },
  });

  if (!deal) {
    notFound();
  }

  const isParticipant =
    deal.buyerId === userId || deal.sellerId === userId;

  if (!isParticipant && !isAdmin) {
    redirect("/");
  }

  const isBuyer = userId === deal.buyerId;
  const isSeller = userId === deal.sellerId;

  const counterpart = isBuyer ? deal.seller : deal.buyer;

  const isPaidOrComplete =
    deal.status === "PAID" || deal.status === "COMPLETE";
  const isCancelled = deal.status === "CANCELLED";
  const isPendingPayment = deal.status === "PENDING_PAYMENT";

  const isRequestBasedDeal = !!deal.request;
  const isListingBasedDeal = !!deal.item && !deal.request;

  let statusColorClasses =
    "bg-yellow-500/15 text-yellow-300 border-yellow-500/60";
  if (isPaidOrComplete) {
    statusColorClasses =
      "bg-green-500/15 text-green-300 border-green-500/60";
  } else if (isCancelled) {
    statusColorClasses =
      "bg-red-500/15 text-red-300 border-red-500/60";
  }

  const roleLabel = isAdmin
    ? "Platform admin"
    : isBuyer
    ? "Buyer"
    : "Seller";

  const dealTypeLabel = isRequestBasedDeal
    ? "Request-based match"
    : isListingBasedDeal
    ? "Marketplace direct sale"
    : "Custom deal";

  const pageTitle = isAdmin
    ? "Deal between buyer and seller"
    : isBuyer
    ? `Your deal with ${counterpart?.name || counterpart?.email || "seller"}`
    : `Your deal with ${counterpart?.name || counterpart?.email || "buyer"}`;

  const canGoToCheckout =
    !isCancelled && !isPaidOrComplete && (isParticipant || isAdmin);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      {/* HEADER */}
      <header className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
              Deal room · {dealTypeLabel}
            </p>
            <h1 className="text-2xl font-semibold text-white">
              {pageTitle}
            </h1>
          </div>

          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${statusColorClasses}`}
          >
            {deal.status.replace("_", " ")}
          </span>
        </div>

        <p className="text-xs text-neutral-400">
          Deal ID:{" "}
          <span className="font-mono text-neutral-300">
            {deal.id}
          </span>
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,2fr)]">
        {/* צד שמאל – פרטי העסקה + CTA */}
        <div className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-950/90 p-5">
          <h2 className="text-sm font-semibold text-neutral-100">
            Deal summary
          </h2>

          <div className="space-y-2 text-sm text-neutral-300">
            <p>
              Your role:{" "}
              <span className="font-semibold text-neutral-100">
                {roleLabel}
              </span>
            </p>
            <p>
              Deal type:{" "}
              <span className="font-semibold text-neutral-100">
                {dealTypeLabel}
              </span>
            </p>
            <p>
              Counterparty:{" "}
              <span className="font-semibold text-neutral-100">
                {counterpart?.name ||
                  counterpart?.email ||
                  "User"}
              </span>
            </p>
            <p>
              Agreed price:{" "}
              <span className="font-semibold text-yellow-300">
                {deal.totalPrice != null
                  ? `${deal.currency || "USD"} ${deal.totalPrice.toLocaleString()}`
                  : "Not specified"}
              </span>
            </p>
            <p className="text-xs text-neutral-500">
              Created at:{" "}
              {new Date(deal.createdAt).toLocaleString("en-GB")}
            </p>
          </div>

          {/* הודעת סטטוס לפי מצב התשלום */}
          <div className="mt-3 space-y-2 rounded-xl border border-neutral-800 bg-black/70 p-4 text-xs text-neutral-300">
            {isCancelled ? (
              <>
                <p className="font-semibold text-red-300">
                  This deal has been cancelled.
                </p>
                <p className="text-neutral-400">
                  In a future phase, admins will be able to review and
                  manage disputes or cancellations from the admin
                  console.
                </p>
              </>
            ) : isPaidOrComplete ? (
              <>
                <p className="font-semibold text-green-300">
                  Payment marked as complete (demo).
                </p>
                <p className="text-neutral-400">
                  In the full product this would indicate that funds
                  have cleared via the payment/escrow provider. For
                  now it&apos;s a simulation for demos and internal
                  flows.
                </p>
              </>
            ) : isPendingPayment ? (
              <>
                <p className="font-semibold text-yellow-300">
                  Awaiting payment.
                </p>
                <p className="text-neutral-400">
                  A deal has been created and the listing is
                  reserved. The next step is to complete payment in
                  the checkout flow.
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold text-neutral-100">
                  Next step: payment
                </p>
                <p className="text-neutral-400">
                  In the full product this step would redirect the
                  buyer to a payment or escrow provider. Here we use a
                  demo checkout screen that simply marks the deal as{" "}
                  <span className="font-semibold text-yellow-300">
                    PAID
                  </span>{" "}
                  in the database.
                </p>
              </>
            )}
          </div>

          {/* CTA ל־Checkout (דמו) */}
          {canGoToCheckout && (
            <div className="mt-3">
              <Link
                href={`/checkout/${deal.id}`}
                className="inline-flex w-full items-center justify-center rounded-full bg-yellow-500/90 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-400"
              >
                Go to checkout (demo)
              </Link>
            </div>
          )}

          {/* קישור חזרה ל־Account */}
          <div className="mt-2 text-xs text-neutral-500">
            <Link
              href="/account"
              className="text-neutral-300 underline-offset-2 hover:text-yellow-300 hover:underline"
            >
              Back to my dashboard
            </Link>
          </div>
        </div>

        {/* צד ימין – פרטי הבקשה / הצעה / פריט */}
        <div className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-950/90 p-5">
          <h2 className="text-sm font-semibold text-neutral-100">
            {isRequestBasedDeal
              ? "Underlying request & offer"
              : isListingBasedDeal
              ? "Linked listing details"
              : "Deal context"}
          </h2>

          <div className="space-y-3 text-xs text-neutral-300">
            {/* בקשת הקונה – עבור פלואו Request/Offer */}
            {deal.request && (
              <div className="rounded-xl border border-neutral-800 bg-black/70 p-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                  Buyer request
                </p>
                <p className="mt-1 text-sm font-semibold text-neutral-100">
                  {deal.request.title}
                </p>
                {deal.request.description && (
                  <p className="mt-1 text-xs text-neutral-300">
                    {deal.request.description}
                  </p>
                )}
                <p className="mt-2 text-[11px] text-neutral-500">
                  Budget:{" "}
                  {deal.request.budgetMax
                    ? `${deal.request.currency || "USD"} ${deal.request.budgetMax.toLocaleString()}`
                    : "Not specified"}
                </p>
              </div>
            )}

            {/* ההצעה שהתקבלה – פלואו Request/Offer */}
            {deal.offer && (
              <div className="rounded-xl border border-neutral-800 bg-black/70 p-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                  Accepted offer
                </p>
                {deal.offer.description && (
                  <p className="mt-1 text-xs text-neutral-300">
                    {deal.offer.description}
                  </p>
                )}
                <p className="mt-2 text-[11px] text-neutral-500">
                  Offered price:{" "}
                  {deal.offer.price != null
                    ? `${deal.currency || "USD"} ${deal.offer.price.toLocaleString()}`
                    : "Not specified"}
                </p>
              </div>
            )}

            {/* פריט מקושר – גם ב-Request/Offer וגם ב-Marketplace */}
            {deal.item && (
              <div className="rounded-xl border border-neutral-800 bg-black/70 p-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                  {deal.item.saleType === "DIRECT"
                    ? "Marketplace listing"
                    : "Auction lot"}
                </p>
                <p className="mt-1 text-sm font-semibold text-neutral-100">
                  {deal.item.title}
                </p>

                {deal.item.category && (
                  <p className="text-[11px] text-neutral-400">
                    {deal.item.category}
                  </p>
                )}

                <p className="mt-2 text-[11px] text-neutral-500">
                  Listing status:{" "}
                  <span className="font-semibold text-neutral-200">
                    {deal.item.status}
                  </span>
                </p>

                <p className="mt-2 text-[11px] text-neutral-500">
                  Created at:{" "}
                  {new Date(
                    deal.item.createdAt,
                  ).toLocaleString("en-GB")}
                </p>

                {/* קישור לפריט עצמו לפי סוג המכירה */}
                <div className="mt-3">
                  {deal.item.saleType === "DIRECT" ? (
                    <Link
                      href={`/marketplace/${deal.item.id}`}
                      className="inline-flex items-center text-[11px] font-semibold text-yellow-300 underline-offset-2 hover:underline"
                    >
                      View marketplace listing →
                    </Link>
                  ) : (
                    <Link
                      href={`/auctions/${deal.item.id}`}
                      className="inline-flex items-center text-[11px] font-semibold text-yellow-300 underline-offset-2 hover:underline"
                    >
                      View auction lot →
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* אם אין כלום – מסר עדין */}
            {!deal.request && !deal.offer && !deal.item && (
              <p className="text-[11px] text-neutral-500">
                This deal is not linked to a request or listing yet.
                In future phases, admins will be able to attach
                additional context to special deals.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
