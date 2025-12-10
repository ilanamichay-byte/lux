import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import {
  isSellerRole,
  isAdminRole,
  type UserRole,
} from "@/lib/roles";

/**
 * Seller: submit offer on a buyer request
 */
async function submitOffer(formData: FormData) {
  "use server";

  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  const user = session.user as any;
  const sellerId = user.id as string | undefined;
  const role = (user.role as UserRole | undefined) ?? "BUYER";

  if (!sellerId) {
    redirect("/sign-in");
  }

  if (!isSellerRole(role)) {
    redirect("/become-seller");
  }

  const requestId = formData.get("requestId")?.toString();
  const priceStr = formData.get("price")?.toString().trim() ?? "";
  const description =
    formData.get("description")?.toString().trim() ?? "";
  const currency = formData.get("currency")?.toString().trim() || "USD";

  if (!requestId) {
    return;
  }

  const price = priceStr ? parseInt(priceStr, 10) : null;

  const existing = await prisma.request.findUnique({
    where: { id: requestId },
  });
  if (!existing) {
    redirect("/requested-items");
  }

  await prisma.offer.create({
    data: {
      description: description || null,
      price: price ?? undefined,
      requestId,
      sellerId,
      // currency אפשר להוסיף בעתיד כעמודה ב-Offer
    },
  });

  redirect(`/requested-items/${requestId}`);
}

/**
 * Buyer/Admin: accept a specific offer → create Deal
 */
async function acceptOfferAction(formData: FormData) {
  "use server";

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

  const requestId = formData.get("requestId")?.toString();
  const offerId = formData.get("offerId")?.toString();

  if (!requestId || !offerId) {
    return;
  }

  // נביא את הבקשה (לוודא בעלות) ואת ההצעה (לוודא שייכות ולקבל seller/price)
  const [request, offer] = await Promise.all([
    prisma.request.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        buyerId: true,
        status: true,
        currency: true,
      },
    }),
    prisma.offer.findUnique({
      where: { id: offerId },
      select: {
        id: true,
        requestId: true,
        sellerId: true,
        price: true,
      },
    }),
  ]);

  if (!request || !offer || offer.requestId !== request.id) {
    redirect("/requested-items");
  }

  const isAdmin = isAdminRole(role);
  const isBuyerOwner = request.buyerId === userId;

  if (!isBuyerOwner && !isAdmin) {
    redirect(`/requested-items/${requestId}`);
  }

  if (
    request.status === "OFFER_ACCEPTED" ||
    request.status === "CLOSED" ||
    request.status === "CANCELLED"
  ) {
    redirect(`/requested-items/${requestId}`);
  }

  // טרנזקציה: לעדכן סטטוסים + ליצור Deal
  const deal = await prisma.$transaction(async (tx) => {
    // ההצעה שנבחרה
    await tx.offer.updateMany({
      where: {
        id: offerId,
        requestId,
      },
      data: {
        status: "ACCEPTED",
      },
    });

    // שאר ההצעות (PENDING) → DECLINED
    await tx.offer.updateMany({
      where: {
        requestId,
        id: { not: offerId },
        status: "PENDING",
      },
      data: {
        status: "DECLINED",
      },
    });

    // עדכון הבקשה
    await tx.request.update({
      where: { id: requestId },
      data: {
        status: "OFFER_ACCEPTED",
        chosenOfferId: offerId,
      },
    });

    // יצירת Deal
    const created = await tx.deal.create({
      data: {
        buyerId: request.buyerId,
        sellerId: offer.sellerId,
        requestId: request.id,
        offerId: offer.id,
        status: "OPEN",
        totalPrice: offer.price ?? null,
        currency: request.currency ?? "USD",
      },
    });

    return created;
  });

  // מעכשיו – נשלח את הקונה/אדמין לעמוד העסקה
  redirect(`/deals/${deal.id}`);
}

export default async function RequestDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const session = await auth();
  const currentUser = session?.user as any | undefined;
  const currentUserId = currentUser?.id as string | undefined;
  const currentRole = (currentUser?.role as UserRole | undefined) ?? "BUYER";

  const isAdmin = isAdminRole(currentRole);

  const request = await prisma.request.findUnique({
    where: { id },
    include: {
      buyer: true,
      offers: {
        include: { seller: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!request) {
    notFound();
  }

  const isBuyerOwner =
    !!currentUserId && currentUserId === request.buyerId;

  const canAcceptOffers =
    (isBuyerOwner || isAdmin) &&
    !["OFFER_ACCEPTED", "CLOSED", "CANCELLED"].includes(
      request.status as string
    );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 md:flex-row">
      {/* צד שמאל – פרטי הבקשה + הצעות */}
      <div className="flex-1 space-y-4 rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
        <p className="text-[11px] uppercase tracking-wide text-neutral-400">
          {request.category || "Category"}
        </p>
        <h1 className="text-2xl font-semibold">{request.title}</h1>

        {request.description && (
          <p className="text-sm text-neutral-200">
            {request.description}
          </p>
        )}

        <div className="mt-4 space-y-1 text-sm text-neutral-300">
          <p>
            Budget:{" "}
            <span className="font-semibold text-neutral-50">
              {request.budgetMax
                ? `${
                    request.currency || "USD"
                  } ${request.budgetMax.toLocaleString()}`
                : "Not specified"}
            </span>{" "}
          </p>
          <p className="text-xs text-neutral-500">
            Buyer:{" "}
            {request.buyer?.name ||
              request.buyer?.email ||
              "Unknown"}
          </p>
          <p className="text-[11px] text-neutral-500">
            Request status:{" "}
            <span className="uppercase tracking-[0.18em] text-neutral-300">
              {request.status}
            </span>
          </p>
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-semibold text-neutral-100">
            Offers from sellers
          </h2>
          {request.offers.length === 0 && (
            <p className="mt-2 text-xs text-neutral-500">
              No offers yet. Sellers will respond as they find matching
              inventory.
            </p>
          )}

          <div className="mt-3 space-y-3">
            {request.offers.map((offer) => {
              const isAccepted = offer.status === "ACCEPTED";
              const isDeclined = offer.status === "DECLINED";

              return (
                <div
                  key={offer.id}
                  className="rounded-xl border border-neutral-800 bg-black/40 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-xs text-neutral-400">
                        Seller:{" "}
                        <span className="text-neutral-100">
                          {offer.seller?.name ||
                            offer.seller?.email ||
                            "Unknown"}
                        </span>
                      </p>

                      {offer.price != null && (
                        <p className="text-xs text-yellow-300">
                          Proposed price:{" "}
                          {request.currency || "USD"}{" "}
                          {offer.price.toLocaleString()}
                        </p>
                      )}

                      {offer.description && (
                        <p className="mt-1 text-xs text-neutral-200">
                          {offer.description}
                        </p>
                      )}

                      <p className="mt-1 text-[10px] text-neutral-500">
                        Submitted:{" "}
                        {new Date(
                          offer.createdAt
                        ).toLocaleString("en-GB")}
                      </p>
                    </div>

                    {/* Status / Action */}
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={[
                          "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                          isAccepted
                            ? "bg-green-500/15 text-green-300 border border-green-500/50"
                            : isDeclined
                            ? "bg-red-500/10 text-red-300 border border-red-500/40"
                            : "bg-neutral-900 text-neutral-300 border border-neutral-700",
                        ].join(" ")}
                      >
                        {offer.status}
                      </span>

                      {canAcceptOffers && offer.status === "PENDING" && (
                        <form action={acceptOfferAction}>
                          <input
                            type="hidden"
                            name="requestId"
                            value={request.id}
                          />
                          <input
                            type="hidden"
                            name="offerId"
                            value={offer.id}
                          />
                          <button className="rounded-full bg-yellow-500 px-3 py-1 text-[11px] font-semibold text-black hover:bg-yellow-400">
                            Accept offer
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {request.chosenOfferId && (
              <p className="mt-2 text-[11px] text-green-300">
                An offer has been accepted for this request. A dedicated
                deal has been opened for buyer and seller to complete
                the transaction.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* צד ימין – טופס הגשת הצעה */}
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
        <h2 className="text-sm font-semibold text-neutral-100">
          I have a matching item
        </h2>
        <p className="mt-1 text-xs text-neutral-400">
          Describe your piece and propose a price. The buyer will see
          your offer in their dashboard.
        </p>

        <form action={submitOffer} className="mt-4 space-y-4">
          <input type="hidden" name="requestId" value={request.id} />

          <div>
            <label className="block text-xs font-medium text-neutral-200">
              Description of your item / proposal
            </label>
            <textarea
              name="description"
              rows={4}
              className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/40 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-blue-500"
              placeholder="Describe the piece, specs, condition, certification, etc."
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-neutral-200">
                Proposed price
              </label>
              <input
                name="price"
                type="number"
                min={0}
                className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/40 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-blue-500"
                placeholder={
                  request.budgetMax?.toString() || "8000"
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-200">
                Currency
              </label>
              <input
                name="currency"
                defaultValue={request.currency || "USD"}
                className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/40 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">
            Submit Offer
          </button>
        </form>
      </div>
    </div>
  );
}
