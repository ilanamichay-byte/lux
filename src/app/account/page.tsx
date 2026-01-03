
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
        <div className="border-b border-neutral-800 pb-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
            Account overview
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white">
            {displayName}
          </h1>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {/* Role Badge - semantic colors */}
          <span className={`
            inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[0.15em] font-medium
            ${isAdmin
              ? "bg-purple-500/10 text-purple-300 border border-purple-500/30"
              : isSeller
                ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                : "bg-neutral-800 text-neutral-300 border border-neutral-700"
            }
          `}>
            <span className={`h-1.5 w-1.5 rounded-full ${isAdmin ? "bg-purple-400" : isSeller ? "bg-emerald-400" : "bg-neutral-500"
              }`} />
            {isAdmin ? "Admin" : isSeller ? "Seller" : "Buyer"}
          </span>

          {/* Seller Status Badge */}
          {dbUser?.sellerStatus && (
            <span className={`
              inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[0.15em]
              ${dbUser.sellerStatus === "APPROVED"
                ? "bg-green-500/10 text-green-300 border border-green-500/30"
                : dbUser.sellerStatus === "PENDING"
                  ? "bg-amber-500/10 text-amber-300 border border-amber-500/30"
                  : dbUser.sellerStatus === "REJECTED"
                    ? "bg-red-500/10 text-red-300 border border-red-500/30"
                    : "bg-neutral-800 text-neutral-400 border border-neutral-700"
              }
            `}>
              <span className={`h-1.5 w-1.5 rounded-full ${dbUser.sellerStatus === "APPROVED" ? "bg-green-400" :
                  dbUser.sellerStatus === "PENDING" ? "bg-amber-400 animate-pulse" :
                    dbUser.sellerStatus === "REJECTED" ? "bg-red-400" : "bg-neutral-500"
                }`} />
              {dbUser.sellerStatus.toLowerCase()}
            </span>
          )}

          {/* Join date */}
          {dbUser?.createdAt && (
            <span className="text-[11px] text-neutral-500">
              Member since {new Date(dbUser.createdAt).toLocaleDateString("en-GB", {
                month: "short",
                year: "numeric"
              })}
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
