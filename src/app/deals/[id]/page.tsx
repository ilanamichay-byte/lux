import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { isAdminRole, type UserRole } from "@/lib/roles";

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

  const counterpart =
    userId === deal.buyerId ? deal.seller : deal.buyer;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <header className="space-y-1">
        <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
          Deal room
        </p>
        <h1 className="text-2xl font-semibold text-white">
          Transaction between buyer and seller
        </h1>
        <p className="text-sm text-neutral-400">
          Deal ID:{" "}
          <span className="font-mono text-neutral-300">
            {deal.id}
          </span>
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,2fr)]">
        {/* צד שמאל – פרטי העסקה */}
        <div className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-950/90 p-5">
          <h2 className="text-sm font-semibold text-neutral-100">
            Deal summary
          </h2>

          <div className="space-y-2 text-sm text-neutral-300">
            <p>
              Status:{" "}
              <span className="font-semibold text-yellow-300">
                {deal.status}
              </span>
            </p>
            <p>
              Role:{" "}
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

          <div className="mt-4 space-y-2 rounded-xl border border-neutral-800 bg-black/70 p-4 text-xs text-neutral-300">
            <p className="font-semibold text-neutral-100">
              Next steps (MVP)
            </p>
            <p>
              In the full product this room will handle payment,
              compliance and messaging between buyer and seller.
            </p>
            <p className="text-neutral-400">
              For now this confirms that an offer has been accepted and
              a deal has been opened. You can use this view to present
              the flow to partners and investors.
            </p>
          </div>
        </div>

        {/* צד ימין – פרטי הבקשה / הצעה / פריט */}
        <div className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-950/90 p-5">
          <h2 className="text-sm font-semibold text-neutral-100">
            Underlying request & offer
          </h2>

          <div className="space-y-2 text-xs text-neutral-300">
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

            <div className="rounded-xl border border-neutral-800 bg-black/70 p-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                Accepted offer
              </p>
              {deal.offer && (
                <>
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
                </>
              )}
            </div>

            {deal.item && (
              <div className="rounded-xl border border-neutral-800 bg-black/70 p-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                  Linked listing
                </p>
                <p className="mt-1 text-sm font-semibold text-neutral-100">
                  {deal.item.title}
                </p>
                {deal.item.category && (
                  <p className="text-[11px] text-neutral-400">
                    {deal.item.category}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
