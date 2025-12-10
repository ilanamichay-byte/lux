// src/app/account/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  isSellerRole,
  isAdminRole,
  type UserRole,
} from "@/lib/roles";

export default async function AccountPage() {
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

  const isSeller = isSellerRole(role);
  const isAdmin = isAdminRole(role);
  const isBuyerOnly = !isSeller && !isAdmin;

  const displayName =
    (user.name as string | undefined) ||
    (user.email as string | undefined) ||
    "Account";

  // נטען נתונים רלוונטיים לפי Role
  let buyerRequests: any[] = [];
  let dealsAsBuyer: any[] = [];
  let sellerOffers: any[] = [];
  let dealsAsSeller: any[] = [];

  // BUYER – הבקשות והדילים שלו
  if (isBuyerOnly || isAdmin || isSeller) {
    [buyerRequests, dealsAsBuyer] = await Promise.all([
      prisma.request.findMany({
        where: { buyerId: userId },
        orderBy: { createdAt: "desc" },
        include: {
          offers: {
            include: { seller: true },
            orderBy: { createdAt: "desc" },
          },
          deals: true,
        },
      }),
      prisma.deal.findMany({
        where: { buyerId: userId },
        orderBy: { createdAt: "desc" },
        include: {
          seller: true,
          request: true,
          offer: true,
          item: true,
        },
      }),
    ]);
  }

  // SELLER – ההצעות שלו והדילים כסלר
  if (isSeller || isAdmin) {
    [sellerOffers, dealsAsSeller] = await Promise.all([
      prisma.offer.findMany({
        where: { sellerId: userId },
        orderBy: { createdAt: "desc" },
        include: {
          request: {
            include: { buyer: true },
          },
          deal: true,
        },
      }),
      prisma.deal.findMany({
        where: { sellerId: userId },
        orderBy: { createdAt: "desc" },
        include: {
          buyer: true,
          request: true,
          offer: true,
          item: true,
        },
      }),
    ]);
  }

  return (
    <div className="space-y-8">
      {/* כותרת עליונה */}
      <header className="space-y-2 border-b border-neutral-900 pb-4">
        <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
          {isAdmin
            ? "Admin & user overview"
            : isSeller
            ? "Seller & buyer dashboard"
            : "Buyer dashboard"}
        </p>
        <h1 className="text-2xl font-semibold text-white">
          {displayName}
        </h1>
        <p className="text-sm text-neutral-400">
          {isAdmin
            ? "You can see your own deals plus manage the platform from the admin console."
            : isSeller
            ? "Track your incoming requests, offers you sent and deals created with buyers."
            : "Track your requests, offers from sellers and the deals you close on the exchange."}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,2fr)]">
        {/* צד שמאל – Buyer side */}
        <div className="space-y-6">
          {/* בקשות של הקונה */}
          <section className="rounded-2xl border border-neutral-800 bg-neutral-950/90 p-5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-neutral-100">
                  Your requests
                </h2>
                <p className="text-xs text-neutral-400">
                  High-intent buyers submit detailed requests for specific pieces.
                </p>
              </div>
              <Link
                href="/request-item"
                className="rounded-full bg-yellow-500/90 px-3 py-1.5 text-[11px] font-semibold text-black hover:bg-yellow-400"
              >
                New request
              </Link>
            </div>

            {buyerRequests.length === 0 ? (
              <p className="mt-4 text-xs text-neutral-500">
                You haven&apos;t submitted any requests yet. Start by telling
                the exchange what you&apos;re looking for.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {buyerRequests.map((req) => {
                  const offersCount = req.offers.length;
                  const accepted =
                    req.offers.find(
                      (o: any) => o.status === "ACCEPTED"
                    ) ?? null;

                  return (
                    <Link
                      key={req.id}
                      href={`/requested-items/${req.id}`}
                      className="block rounded-xl border border-neutral-800 bg-black/50 px-4 py-3 text-left hover:border-yellow-500/50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                            {req.category || "REQUEST"}
                          </p>
                          <p className="text-sm font-semibold text-neutral-100">
                            {req.title}
                          </p>
                          {req.description && (
                            <p className="line-clamp-2 text-xs text-neutral-300">
                              {req.description}
                            </p>
                          )}
                          <p className="text-[11px] text-neutral-500">
                            Budget:{" "}
                            {req.budgetMax
                              ? `${req.currency || "USD"} ${req.budgetMax.toLocaleString()}`
                              : "Not specified"}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="inline-flex rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-300">
                            {req.status}
                          </span>
                          <span className="text-[11px] text-neutral-400">
                            {offersCount === 0
                              ? "No offers yet"
                              : offersCount === 1
                              ? "1 offer"
                              : `${offersCount} offers`}
                          </span>
                          <span className="text-[10px] text-neutral-500">
                            Created:{" "}
                            {new Date(
                              req.createdAt
                            ).toLocaleString("en-GB")}
                          </span>
                          {accepted && (
                            <span className="mt-1 inline-flex rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-semibold text-green-300">
                              Offer accepted
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* דילים כקונה */}
          <section className="rounded-2xl border border-neutral-800 bg-neutral-950/90 p-5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-neutral-100">
                  Deals as buyer
                </h2>
                <p className="text-xs text-neutral-400">
                  Once you accept an offer, a dedicated deal room is created.
                </p>
              </div>
            </div>

            {dealsAsBuyer.length === 0 ? (
              <p className="mt-4 text-xs text-neutral-500">
                You don&apos;t have any deals yet. Accept an offer on one of
                your requests to open a deal room.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {dealsAsBuyer.map((deal) => (
                  <Link
                    key={deal.id}
                    href={`/deals/${deal.id}`}
                    className="block rounded-xl border border-neutral-800 bg-black/50 px-4 py-3 text-left hover:border-yellow-500/50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                          Deal · Buyer side
                        </p>
                        <p className="text-sm font-semibold text-neutral-100">
                          {deal.request?.title || "Custom buyer request"}
                        </p>
                        {deal.request?.description && (
                          <p className="line-clamp-2 text-xs text-neutral-300">
                            {deal.request.description}
                          </p>
                        )}
                        <p className="text-[11px] text-neutral-500">
                          With seller:{" "}
                          <span className="text-neutral-200">
                            {deal.seller?.name ||
                              deal.seller?.email ||
                              "Seller"}
                          </span>
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="inline-flex rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-300">
                          {deal.status}
                        </span>
                        <span className="text-[11px] text-yellow-300">
                          {deal.totalPrice != null
                            ? `${deal.currency || "USD"} ${deal.totalPrice.toLocaleString()}`
                            : "Price TBD"}
                        </span>
                        <span className="text-[10px] text-neutral-500">
                          Created:{" "}
                          {new Date(
                            deal.createdAt
                          ).toLocaleString("en-GB")}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* צד ימין – Seller / Admin side */}
        <div className="space-y-6">
          {/* אם הוא לא סלר ולא אדמין – קארד Become Seller קצר */}
          {!isSeller && !isAdmin && (
            <section className="rounded-2xl border border-dashed border-yellow-500/60 bg-neutral-950/80 p-5">
              <h2 className="text-sm font-semibold text-neutral-100">
                Become a verified seller
              </h2>
              <p className="mt-1 text-xs text-neutral-400">
                If you also trade professionally, you can apply to join the
                seller side of the exchange and respond to buyer requests.
              </p>
              <Link
                href="/become-seller"
                className="mt-3 inline-flex rounded-full bg-yellow-500/90 px-4 py-1.5 text-[11px] font-semibold text-black hover:bg-yellow-400"
              >
                Apply to become seller
              </Link>
            </section>
          )}

          {(isSeller || isAdmin) && (
            <>
              {/* הצעות שהסלר שלח */}
              <section className="rounded-2xl border border-neutral-800 bg-neutral-950/90 p-5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-semibold text-neutral-100">
                      Offers you sent
                    </h2>
                    <p className="text-xs text-neutral-400">
                      Respond to buyer requests with your inventory and track
                      which offers convert to deals.
                    </p>
                  </div>
                  <Link
                    href="/requested-items"
                    className="rounded-full bg-neutral-900 px-3 py-1.5 text-[11px] text-neutral-200 hover:bg-neutral-800 hover:text-yellow-200"
                  >
                    Browse open requests
                  </Link>
                </div>

                {sellerOffers.length === 0 ? (
                  <p className="mt-4 text-xs text-neutral-500">
                    You haven&apos;t sent any offers yet. Browse buyer
                    requests and respond with matching pieces.
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {sellerOffers.map((offer) => (
                      <Link
                        key={offer.id}
                        href={`/requested-items/${offer.requestId}`}
                        className="block rounded-xl border border-neutral-800 bg-black/50 px-4 py-3 text-left hover:border-yellow-500/50"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                              Offer · {offer.status}
                            </p>
                            <p className="text-sm font-semibold text-neutral-100">
                              {offer.request?.title ||
                                "Buyer request"}
                            </p>
                            {offer.request?.buyer && (
                              <p className="text-[11px] text-neutral-500">
                                Buyer:{" "}
                                <span className="text-neutral-200">
                                  {offer.request.buyer.name ||
                                    offer.request.buyer.email}
                                </span>
                              </p>
                            )}
                            {offer.description && (
                              <p className="line-clamp-2 text-xs text-neutral-300">
                                {offer.description}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span
                              className={[
                                "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                                offer.status === "ACCEPTED"
                                  ? "bg-green-500/15 text-green-300 border border-green-500/50"
                                  : offer.status === "DECLINED"
                                  ? "bg-red-500/10 text-red-300 border border-red-500/40"
                                  : "bg-neutral-900 text-neutral-300 border border-neutral-700",
                              ].join(" ")}
                            >
                              {offer.status}
                            </span>
                            <span className="text-[11px] text-yellow-300">
                              {offer.price != null
                                ? `${offer.request?.currency || "USD"} ${offer.price.toLocaleString()}`
                                : "No price set"}
                            </span>
                            <span className="text-[10px] text-neutral-500">
                              Sent:{" "}
                              {new Date(
                                offer.createdAt
                              ).toLocaleString("en-GB")}
                            </span>
                            {offer.deal && (
                              <span className="mt-1 inline-flex rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-semibold text-blue-300">
                                Deal opened
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>

              {/* דילים כסלר */}
              <section className="rounded-2xl border border-neutral-800 bg-neutral-950/90 p-5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-semibold text-neutral-100">
                      Deals as seller
                    </h2>
                    <p className="text-xs text-neutral-400">
                      Confirmed transactions originating from your offers.
                    </p>
                  </div>
                </div>

                {dealsAsSeller.length === 0 ? (
                  <p className="mt-4 text-xs text-neutral-500">
                    You don&apos;t have any deals as a seller yet. When buyers
                    accept your offers, they will appear here.
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {dealsAsSeller.map((deal) => (
                      <Link
                        key={deal.id}
                        href={`/deals/${deal.id}`}
                        className="block rounded-xl border border-neutral-800 bg-black/50 px-4 py-3 text-left hover:border-yellow-500/50"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                              Deal · Seller side
                            </p>
                            <p className="text-sm font-semibold text-neutral-100">
                              {deal.request?.title ||
                                "Buyer request"}
                            </p>
                            {deal.buyer && (
                              <p className="text-[11px] text-neutral-500">
                                Buyer:{" "}
                                <span className="text-neutral-200">
                                  {deal.buyer.name ||
                                    deal.buyer.email}
                                </span>
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="inline-flex rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-300">
                              {deal.status}
                            </span>
                            <span className="text-[11px] text-yellow-300">
                              {deal.totalPrice != null
                                ? `${deal.currency || "USD"} ${deal.totalPrice.toLocaleString()}`
                                : "Price TBD"}
                            </span>
                            <span className="text-[10px] text-neutral-500">
                              Created:{" "}
                              {new Date(
                                deal.createdAt
                              ).toLocaleString("en-GB")}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>

      {/* לינק קטן לאדמין – למי שיש ROLE אדמין */}
      {isAdmin && (
        <div className="rounded-2xl border border-yellow-500/40 bg-yellow-500/5 p-4 text-[11px] text-neutral-200">
          <p className="font-semibold text-yellow-200">
            Admin tools
          </p>
          <p className="mt-1 text-neutral-300">
            For deeper platform controls, use the dedicated admin console.
          </p>
          <Link
            href="/admin/users"
            className="mt-2 inline-flex rounded-full bg-yellow-500/90 px-3 py-1.5 font-semibold text-black hover:bg-yellow-400"
          >
            Open admin dashboard
          </Link>
        </div>
      )}
    </div>
  );
}
