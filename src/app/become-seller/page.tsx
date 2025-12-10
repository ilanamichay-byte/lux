// src/app/become-seller/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { isSellerRole, type SellerStatus, type UserRole } from "@/lib/roles";

function sellerStatusLabel(status: SellerStatus | string | null | undefined) {
  switch (status) {
    case "PENDING":
      return "Pending approval";
    case "APPROVED":
      return "Approved";
    case "REJECTED":
      return "Rejected";
    default:
      return "None";
  }
}

// פעולה: שליחת בקשה להיות מוכר (לא משנה role!)
async function requestSellerAccessAction() {
  "use server";

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
    select: { role: true, sellerStatus: true },
  });

  const role = (dbUser?.role as UserRole | undefined) ?? "BUYER";
  const sellerStatus =
    (dbUser?.sellerStatus as SellerStatus | undefined) ?? "NONE";

  // אם הוא כבר מוכר – אין מה לעשות
  if (isSellerRole(role)) {
    redirect("/requested-items");
  }

  // אם כבר יש בקשה ממתינה – לא משנים כלום
  if (sellerStatus === "PENDING") {
    redirect("/become-seller");
  }

  // בקשה חדשה / בקשה מחדש → מסמנים כ-PENDING
  await prisma.user.update({
    where: { id: userId },
    data: {
      sellerStatus: "PENDING",
    },
  });

  redirect("/become-seller");
}

export default async function BecomeSellerPage() {
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
    select: { role: true, sellerStatus: true, name: true, email: true },
  });

  const role = (dbUser?.role as UserRole | undefined) ?? "BUYER";
  const sellerStatus =
    (dbUser?.sellerStatus as SellerStatus | undefined) ?? "NONE";

  const displayName =
    dbUser?.name || dbUser?.email || "Lux Auction account";

  // אם כבר מוכר בפועל – אין טעם להיות בעמוד הזה
  if (isSellerRole(role)) {
    redirect("/requested-items");
  }

  const statusText = sellerStatusLabel(sellerStatus);

  const canRequest =
    sellerStatus === "NONE" || sellerStatus === "REJECTED";

  const buttonLabel =
    sellerStatus === "REJECTED"
      ? "Request seller access again"
      : "Request seller access";

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-wide">
        Become a seller
      </h1>
      <p className="mt-2 text-sm text-neutral-400">
        In the full product, we&apos;ll verify identity, documents, and
        exchange membership. In the MVP this is a manual approval by an
        admin.
      </p>

      <div className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-4">
        <div>
          <p className="text-sm text-neutral-200">
            Signed in as{" "}
            <span className="font-semibold">{displayName}</span>
          </p>
          <p className="mt-1 text-xs text-neutral-400">
            Role: <span className="font-mono">{role}</span>
          </p>
          <p className="mt-1 text-xs text-neutral-400">
            Seller status:{" "}
            <span className="font-mono">
              {statusText} ({sellerStatus})
            </span>
          </p>
        </div>

        {sellerStatus === "PENDING" ? (
          <div className="rounded-xl border border-yellow-500/40 bg-yellow-500/5 px-4 py-3 text-xs text-neutral-100">
            Your request to become a seller is{" "}
            <span className="font-semibold text-yellow-300">
              pending admin review
            </span>
            . Once approved, your account will be upgraded and you&apos;ll be
            able to respond to buyer requests.
          </div>
        ) : (
          <div className="rounded-xl border border-neutral-800 bg-black/40 px-4 py-3 text-xs text-neutral-200">
            As a seller you&apos;ll be able to respond to buyer requests and
            list items for sale and auction. An admin must approve your
            request before you can start selling.
          </div>
        )}

        {canRequest && (
          <form action={requestSellerAccessAction} className="pt-2">
            <button className="inline-flex w-full items-center justify-center rounded-full bg-yellow-500 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-400">
              {buttonLabel}
            </button>
          </form>
        )}

        {sellerStatus === "PENDING" && (
          <p className="pt-1 text-[11px] text-neutral-500">
            You can close this page. Check back later or wait for a
            notification once your account is approved.
          </p>
        )}
      </div>
    </div>
  );
}
