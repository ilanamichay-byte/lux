// src/app/seller/list-item/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { isSellerRole, type UserRole } from "@/lib/roles";
import type { SaleType } from "@prisma/client";
import { uploadImage } from "@/lib/upload-image";
import { ImageUploadPreview } from "@/components/seller/image-upload-preview";

async function createItemAction(formData: FormData) {
  "use server";

  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  const userId = (session.user as any).id as string | undefined;
  if (!userId) {
    redirect("/sign-in");
  }

  // לוודא לפי ה־DB שהוא באמת מוכר (ולא איזה session ישן)
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  const role = (dbUser?.role as UserRole | undefined) ?? "BUYER";
  if (!isSellerRole(role)) {
    redirect("/become-seller");
  }

  const title = formData.get("title")?.toString().trim() ?? "";
  const category = formData.get("category")?.toString().trim() ?? "";
  const description = formData.get("description")?.toString().trim() ?? "";

  const saleTypeRaw = formData.get("saleType")?.toString() ?? "DIRECT";
  const saleType = (saleTypeRaw === "AUCTION" ? "AUCTION" : "DIRECT") as SaleType;

  const startingPriceStr = formData.get("startingPrice")?.toString().trim() ?? "";
  const buyNowPriceStr = formData.get("buyNowPrice")?.toString().trim() ?? "";
  const auctionEndStr = formData.get("auctionEnd")?.toString().trim() ?? "";

  const imageFile = formData.get("image") as File | null;

  // ✅ במקום return שקט – מחזירים שגיאה לטופס
  if (!title) {
    redirect("/seller/list-item?error=TITLE_REQUIRED");
  }

  const startingPrice = startingPriceStr ? parseInt(startingPriceStr, 10) : null;
  const buyNowPrice = buyNowPriceStr ? parseInt(buyNowPriceStr, 10) : null;

  // ✅ חוק מוצר: מרקטפלייס (DIRECT) חייב מחיר
  if (saleType === "DIRECT") {
    if (buyNowPrice == null || Number.isNaN(buyNowPrice) || buyNowPrice <= 0) {
      redirect("/seller/list-item?error=PRICE_REQUIRED");
    }
  }

  const auctionEnd = auctionEndStr ? new Date(auctionEndStr) : null;

  // בניית data לפי ה־schema של Item
  const data: any = {
    title,
    saleType,
    sellerId: userId,
  };

  if (imageFile && imageFile.size > 0) {
    try {
      const imageUrl = await uploadImage(imageFile);
      data.mainImageUrl = imageUrl;
    } catch (error) {
      console.error("Failed to upload image:", error);
      // בשלב MVP ממשיכים בלי תמונה
    }
  }

  if (category) data.category = category;
  if (description) data.description = description;

  if (saleType === "AUCTION") {
    if (startingPrice != null) data.startingPrice = startingPrice;
    if (auctionEnd) data.auctionEnd = auctionEnd;
    if (buyNowPrice != null) data.buyNowPrice = buyNowPrice; // אופציונלי גם באוקשיין
  } else {
    // DIRECT
    // buyNowPrice כבר מאומת כחובה > 0
    data.buyNowPrice = buyNowPrice;
  }

  const created = await prisma.item.create({ data });

  if (saleType === "AUCTION") {
    redirect(`/auctions/${created.id}`);
  } else {
    redirect(`/marketplace`);
  }
}

export default async function SellerListItemPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const error = sp?.error;

  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  const userId = (session.user as any).id as string | undefined;
  if (!userId) {
    redirect("/sign-in");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, name: true, email: true },
  });

  const role = (dbUser?.role as UserRole | undefined) ?? "BUYER";
  if (!isSellerRole(role)) {
    redirect("/become-seller");
  }

  const displayName = dbUser?.name || dbUser?.email || "Lux Auction seller";

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-8">
      {/* כותרת למוכר */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
        <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
          Seller workspace
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-white">List a new item</h1>
        <p className="mt-2 text-xs text-neutral-400">
          You&apos;re listing as{" "}
          <span className="font-semibold text-neutral-100">{displayName}</span>. Choose
          whether this piece will go to the live auction floor or directly to the
          marketplace.
        </p>
      </div>

      {/* ✅ הודעות שגיאה ידידותיות */}
      {error === "PRICE_REQUIRED" && (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-5 py-4 text-sm text-red-200">
          חובה להזין מחיר עבור מוצר Direct buy (marketplace).
          <div className="mt-1 text-xs text-red-200/80">
            הכנס Direct price גדול מ־0 ונסה שוב.
          </div>
        </div>
      )}

      {error === "TITLE_REQUIRED" && (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-5 py-4 text-sm text-red-200">
          חובה להזין כותרת (Title) למוצר.
        </div>
      )}

      {/* טופס יצירת אייטם */}
      <form
        action={createItemAction}
        className="space-y-6 rounded-2xl border border-neutral-800 bg-neutral-950 p-6"
      >
        {/* סוג מכירה */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
            Sale type
          </label>
          <p className="mt-1 text-[11px] text-neutral-500">
            Choose how this piece will be offered on the exchange.
          </p>

          <div className="mt-3 inline-flex rounded-full bg-black/60 p-1 text-xs">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-neutral-300 hover:text-yellow-200">
              <input
                type="radio"
                name="saleType"
                value="AUCTION"
                className="h-3 w-3 accent-yellow-400"
                defaultChecked
              />
              <span>Live auction</span>
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-neutral-300 hover:text-yellow-200">
              <input
                type="radio"
                name="saleType"
                value="DIRECT"
                className="h-3 w-3 accent-yellow-400"
              />
              <span>Direct buy (marketplace)</span>
            </label>
          </div>
        </div>

        {/* תמונה - Client Component Wrapper */}
        <ImageUploadPreview />

        {/* בסיס הפריט */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-neutral-200">Title</label>
            <input
              name="title"
              required
              className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/40 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-yellow-500"
              placeholder="3.02 ct GIA certified round brilliant diamond ring"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-200">Category</label>
            <input
              name="category"
              className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/40 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-yellow-500"
              placeholder="Ring / Necklace / Watch"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-200">
              Short description
            </label>
            <input
              name="description"
              className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/40 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-yellow-500"
              placeholder="18K white gold, VS2, F color, signed piece…"
            />
          </div>
        </div>

        {/* פרמטרים כספיים ותזמון */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* לאוקשיין */}
          <div>
            <label className="block text-xs font-medium text-neutral-200">
              Starting price (auction)
            </label>
            <input
              name="startingPrice"
              type="number"
              min={0}
              className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/40 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-yellow-500"
              placeholder="10000"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-neutral-200">
              Auction end (date &amp; time)
            </label>
            <input
              name="auctionEnd"
              type="datetime-local"
              className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/40 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-yellow-500"
            />
          </div>

          {/* למרקטפלייס */}
          <div>
            <label className="block text-xs font-medium text-neutral-200">
              Direct price (marketplace)
            </label>
            <input
              name="buyNowPrice"
              type="number"
              min={0}
              className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/40 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-yellow-500"
              placeholder="15000"
            />
          </div>
        </div>

        <p className="text-[11px] text-neutral-500">
          In the full product, you&apos;ll be able to upload certification, media and
          more technical specs. For the MVP we&apos;re focusing on title, category and
          pricing.
        </p>

        <button className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-yellow-500 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-400">
          List item
        </button>
      </form>
    </div>
  );
}
