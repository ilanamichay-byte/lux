
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  isSellerRole,
  isAdminRole,
  type UserRole,
} from "@/lib/roles";

import { SellerDashboard } from "@/components/dashboard/seller-view";
import { BuyerDashboard } from "@/components/dashboard/buyer-view";
import { AdminDashboard } from "@/components/dashboard/admin-view";

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

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      role: true,
      sellerStatus: true,
      createdAt: true,
    },
  });

  const displayName =
    dbUser?.name || dbUser?.email || "Lux Auction account";

  // Data Fetching
  let buyerRequests: any[] = [];
  let buyerDeals: any[] = [];
  let buyerBids: any[] = [];
  let sellerItems: any[] = [];
  let sellerDeals: any[] = [];
  let platformStats: {
    totalUsers: number;
    totalRequests: number;
    totalDeals: number;
  } | null = null;

  // BUYER Data
  if (isBuyerOnly) {
    buyerRequests = await prisma.request.findMany({
      where: { buyerId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        offers: {
          include: { seller: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    buyerDeals = await prisma.deal.findMany({
      where: { buyerId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        seller: true,
        request: true,
        offer: true,
        item: true,
      },
    });

    buyerBids = await prisma.bid.findMany({
      where: { bidderId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        item: true,
      },
      take: 10,
    });
  }

  // SELLER Data
  if (isSeller && !isAdmin) {
    sellerItems = await prisma.item.findMany({
      where: { sellerId: userId },
      orderBy: { createdAt: "desc" },
    });

    sellerDeals = await prisma.deal.findMany({
      where: { sellerId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        buyer: true,
        request: true,
        offer: true,
      },
    });
  }

  // ADMIN Data
  if (isAdmin) {
    const [totalUsers, totalRequests, totalDeals] = await Promise.all([
      prisma.user.count(),
      prisma.request.count(),
      prisma.deal.count(),
    ]);
    platformStats = { totalUsers, totalRequests, totalDeals };
  }

  return (
    <div className="space-y-8 py-8">
      {/* User Header Card */}
      <section className="rounded-2xl border border-neutral-800 bg-neutral-950/90 p-6">
        <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
          Account overview
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-white">
          {displayName}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-neutral-300">
          <span className="inline-flex items-center gap-1 rounded-full bg-neutral-900 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-neutral-300">
            Role:{" "}
            <span className="font-semibold text-yellow-300">
              {isAdmin ? "ADMIN" : isSeller ? "SELLER" : "BUYER"}
            </span>
          </span>

          {dbUser?.sellerStatus && (
            <span className="inline-flex items-center gap-1 rounded-full bg-neutral-900 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-neutral-400">
              Seller status:{" "}
              <span
                className={
                  dbUser.sellerStatus === "APPROVED"
                    ? "font-semibold text-green-300"
                    : dbUser.sellerStatus === "PENDING"
                      ? "font-semibold text-yellow-300"
                      : dbUser.sellerStatus === "REJECTED"
                        ? "font-semibold text-red-300"
                        : "font-semibold text-neutral-300"
                }
              >
                {dbUser.sellerStatus}
              </span>
            </span>
          )}

          {dbUser?.createdAt && (
            <span className="text-[11px] text-neutral-500">
              Joined {new Date(dbUser.createdAt).toLocaleDateString("en-GB")}
            </span>
          )}
        </div>
      </section>

      {/* Render Dashboard based on role */}
      {isAdmin && <AdminDashboard stats={platformStats} />}

      {isSeller && !isAdmin && (
        <SellerDashboard
          items={sellerItems}
          deals={sellerDeals}
          sellerStatus={dbUser?.sellerStatus || 'NONE'}
        />
      )}

      {isBuyerOnly && (
        <BuyerDashboard
          requests={buyerRequests}
          deals={buyerDeals}
          bids={buyerBids}
        />
      )}
    </div>
  );
}
