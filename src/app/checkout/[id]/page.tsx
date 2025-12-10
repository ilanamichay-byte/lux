// src/app/checkout/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { isAdminRole, type UserRole } from "@/lib/roles";

/**
 * Server Action – סימון העסקה כ־PAID (דמו)
 */
async function markAsPaidAction(formData: FormData) {
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

  const dealId = formData.get("dealId")?.toString();
  if (!dealId) {
    return;
  }

  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    select: {
      id: true,
      buyerId: true,
      sellerId: true,
      status: true,
    },
  });

  if (!deal) {
    notFound();
  }

  const isAdmin = isAdminRole(role);
  const isParticipant =
    deal.buyerId === userId || deal.sellerId === userId;

  if (!isParticipant && !isAdmin) {
    redirect("/");
  }

  // אם העסקה כבר סגורה/מבוטלת – לא נעשה כלום
  if (deal.status === "CANCELLED" || deal.status === "COMPLETE") {
    redirect(`/deals/${deal.id}`);
  }

  await prisma.deal.update({
    where: { id: deal.id },
    data: {
      status: "PAID",
    },
  });

  redirect(`/deals/${deal.id}`);
}

export default async function CheckoutPage({
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

  const isAlreadyPaidOrComplete =
    deal.status === "PAID" || deal.status === "COMPLETE";

  const counterpart =
    userId === deal.buyerId ? deal.seller : deal.buyer;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <header className="space-y-1">
        <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
          Checkout (demo)
        </p>
        <h1 className="text-2xl font-semibold text-white">
          Confirm payment for this deal
        </h1>
        <p className="text-sm text-neutral-400">
          In the full version this screen would integrate with a payment
          provider and/or escrow. Here we simulate marking a deal as paid.
        </p>
      </header>

      <section className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-950/90 p-5">
        <h2 className="text-sm font-semibold text-neutral-100">
          Deal summary
        </h2>

        <div className="space-y-2 text-sm text-neutral-300">
          <p>
            Deal ID:{" "}
            <span className="font-mono text-neutral-200">
              {deal.id}
            </span>
          </p>
          <p>
            Your role:{" "}
            <span className="font-semibold text-neutral-100">
              {isAdmin
                ? "Platform admin"
                : userId === deal.buyerId
                ? "Buyer"
                : "Seller"}
            </span>
          </p>
          <p>
            Counterparty:{" "}
            <span className="font-semibold text-neutral-100">
              {counterpart?.name || counterpart?.email || "User"}
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
      </section>

      <section className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-950/90 p-5">
        <h2 className="text-sm font-semibold text-neutral-100">
          Payment simulation
        </h2>

        <p className="text-xs text-neutral-400">
          To keep the MVP simple, we don&apos;t integrate a real
          payment provider yet. Instead, marking this deal as{" "}
          <span className="font-semibold text-yellow-300">PAID</span>{" "}
          simulates a successful payment and lets you walk partners
          through the end-to-end flow.
        </p>

        {isAlreadyPaidOrComplete ? (
          <div className="mt-3 rounded-xl border border-green-500/40 bg-green-500/10 px-4 py-3 text-xs text-green-200">
            <p className="font-semibold">
              Payment already marked as complete.
            </p>
            <p className="mt-1">
              You can return to the deal room to continue the process
              or mark the deal as fully complete through admin tools in
              a future phase.
            </p>
          </div>
        ) : (
          <form action={markAsPaidAction} className="mt-3 space-y-3">
            <input type="hidden" name="dealId" value={deal.id} />

            <div className="rounded-xl border border-neutral-800 bg-black/70 px-4 py-3 text-xs text-neutral-300">
              <p className="font-semibold text-neutral-100">
                Demo action only
              </p>
              <p className="mt-1">
                Pressing the button below will update the deal status
                to{" "}
                <span className="font-semibold text-yellow-300">
                  PAID
                </span>{" "}
                in the database.
              </p>
            </div>

            <button className="inline-flex w-full items-center justify-center rounded-full bg-yellow-500/90 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-400">
              Mark deal as paid (demo)
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
