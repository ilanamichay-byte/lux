// src/app/marketplace/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { UserRole } from "@/lib/roles";

// Server Action – יצירת / שימוש מחדש ב-Deal איכותי ו-redirect ל-Checkout
async function buyNowAction(formData: FormData) {
  "use server";

  const session = await auth();
  const user = session?.user as { id: string; role?: UserRole } | null;

  if (!user?.id) {
    redirect("/sign-in"); // עדכן אם יש לך מסלול אחר
  }

  const itemId = formData.get("itemId");

  if (typeof itemId !== "string" || !itemId) {
    throw new Error("Missing itemId");
  }

  const deal = await prisma.$transaction(async (tx) => {
    // טוענים את הפריט + דילים אקטיביים עליו
    const item = await tx.item.findUnique({
      where: { id: itemId },
      include: {
        deals: {
          where: {
            status: {
              in: ["OPEN", "PENDING_PAYMENT", "PAID"],
            },
          },
          select: {
            id: true,
            buyerId: true,
            status: true,
          },
        },
      },
    });

    if (!item) {
      throw new Error("Item not found");
    }

    if (item.saleType !== "DIRECT") {
      throw new Error("Item is not available for direct sale");
    }

    if (item.status !== "PUBLISHED" && item.status !== "RESERVED") {
      throw new Error("Item is not available for purchase");
    }

    if (item.buyNowPrice == null) {
      throw new Error("Item has no buy-now price defined");
    }

    // אי אפשר לקנות את עצמך
    if (item.sellerId === user.id) {
      throw new Error("Seller cannot buy their own item");
    }

    const activeDeals = item.deals;

    // האם כבר יש עסקה אקטיבית *לאותו קונה*?
    const existingForBuyer = activeDeals.find(
      (d) => d.buyerId === user.id && d.status !== "PAID",
    );

    if (existingForBuyer) {
      // מוודאים שהפריט מסומן RESERVED
      if (item.status !== "RESERVED") {
        await tx.item.update({
          where: { id: item.id },
          data: { status: "RESERVED" },
        });
      }

      // אם העסקה עוד ב-OPEN – מקדמים ל-PENDING_PAYMENT
      if (existingForBuyer.status === "OPEN") {
        await tx.deal.update({
          where: { id: existingForBuyer.id },
          data: { status: "PENDING_PAYMENT" },
        });
      }

      // מחזירים את ה-Deal הקיים
      return tx.deal.findUnique({
        where: { id: existingForBuyer.id },
      });
    }

    // אם יש עסקה אקטיבית על הפריט למישהו אחר – חוסמים
    const activeForOthers = activeDeals.find(
      (d) => d.buyerId !== user.id && d.status !== "COMPLETE" && d.status !== "CANCELLED",
    );

    if (activeForOthers) {
      throw new Error("Item already has an active or paid deal");
    }

    // יוצרים Deal חדש תקין
    const createdDeal = await tx.deal.create({
      data: {
        buyer: {
          connect: { id: user.id },
        },
        seller: {
          connect: { id: item.sellerId },
        },
        item: {
          connect: { id: item.id },
        },
        totalPrice: item.buyNowPrice,
        currency: item.currency ?? "USD",
        status: "PENDING_PAYMENT", // יצאנו לצ'קאאוט, מחכים לתשלום
      },
    });

    // מסמנים את הפריט כ-RESERVED
    await tx.item.update({
      where: { id: item.id },
      data: {
        status: "RESERVED",
      },
    });

    return createdDeal;
  });

  if (!deal) {
    throw new Error("Failed to create or load deal");
  }

  redirect(`/checkout/${deal.id}`);
}

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
    include: {
      seller: true,
    },
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

  const priceRaw =
    anyItem.buyNowPrice ??
    anyItem.fixedPrice ??
    anyItem.listPrice ??
    anyItem.price ??
    null;

  const price =
    priceRaw != null ? Number(priceRaw) : null;

  const sellerInitial =
    item.seller?.name?.charAt(0) ||
    item.seller?.email?.charAt(0) ||
    "U";

  const sellerName =
    item.seller?.name ||
    item.seller?.email ||
    "Unknown seller";

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
            Marketplace • Direct sale
          </p>

          <h1 className="text-2xl font-semibold text-white">
            {title}
          </h1>

          {description && (
            <p className="text-sm leading-relaxed text-neutral-200">
              {description}
            </p>
          )}

          <div className="mt-4 rounded-xl border border-neutral-800 bg-black/60 px-4 py-3 text-xs text-neutral-400">
            <p>
              In the full marketplace experience this page will show detailed
              specifications, certification, seller vetting status and
              comparable pieces. For now it&apos;s a simplified details view to
              support navigation and flows.
            </p>
          </div>
        </div>

        {/* צד ימין – פאנל קנייה + מוכר */}
        <div className="space-y-4">
          <div className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-950/90 p-6">
            <h2 className="text-sm font-semibold text-white">
              Purchase panel
            </h2>

            <div className="space-y-2 text-sm text-neutral-200">
              {price != null ? (
                <p>
                  Price:{" "}
                  <span className="font-semibold text-yellow-300">
                    {currency} {price.toLocaleString()}
                  </span>
                </p>
              ) : (
                <p className="text-xs text-neutral-400">
                  Price will be defined in the full product.
                </p>
              )}
            </div>

            {/* טופס BUY NOW אמיתי */}
            <form action={buyNowAction} className="mt-4 space-y-2">
              <input type="hidden" name="itemId" value={item.id} />

              <button
                type="submit"
                className="flex w-full items-center justify-center rounded-full bg-yellow-500 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-400 disabled:bg-neutral-700 disabled:text-neutral-300"
                disabled={price == null}
              >
                {price != null
                  ? "Buy now"
                  : "Buy now (price missing)"}
              </button>

              <button
                type="button"
                className="flex w-full items-center justify-center rounded-full border border-neutral-700 bg-black/70 px-4 py-2 text-xs font-semibold text-neutral-300"
                disabled
              >
                Contact seller (coming soon)
              </button>
            </form>

            <p className="pt-2 text-[10px] leading-relaxed text-neutral-500">
              This button either reuses your existing active deal for this item
              or creates a new one in a transaction, reserves the item, and
              redirects you into the checkout flow. No double-selling, no messy
              duplicates.
            </p>
          </div>

          {/* פאנל מוכר */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/90 p-6">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Seller
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-800 text-xs font-semibold uppercase text-neutral-100">
                {sellerInitial}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-neutral-100">
                  {sellerName}
                </span>
                <span className="text-[11px] text-neutral-500">
                  Professional seller on LUX AUCTION
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
