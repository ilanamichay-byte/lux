
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatRelativeTime, formatPrice } from "@/lib/format";
import { EmptyState } from "@/components/ui/empty-state";
import { Receipt, ExternalLink } from "lucide-react";

export default async function OrderHistoryPage() {
    const session = await auth();
    if (!session?.user) redirect("/sign-in");

    const userId = (session.user as any).id;

    // Get all deals where user is the buyer and status is PAID or COMPLETE
    const orders = await prisma.deal.findMany({
        where: {
            buyerId: userId,
            status: { in: ["PAID", "COMPLETE"] }
        },
        include: {
            item: true,
            seller: { select: { name: true, email: true } }
        },
        orderBy: { createdAt: "desc" }
    });

    return (
        <div className="mx-auto max-w-4xl py-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Order History</h1>
                <p className="text-sm text-neutral-500">Your past purchases and transactions</p>
            </div>

            {orders.length === 0 ? (
                <EmptyState
                    icon={<Receipt className="h-8 w-8 text-neutral-600" />}
                    title="No Orders Yet"
                    description="Your purchase history will show up here once you've completed a transaction."
                    action={{ label: "Browse Auctions", href: "/auctions" }}
                />
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className="flex gap-4 rounded-xl border border-neutral-800 bg-neutral-950 p-4"
                        >
                            {/* Image */}
                            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-900">
                                {order.item?.mainImageUrl && (
                                    <img src={order.item.mainImageUrl} alt="" className="h-full w-full object-cover" />
                                )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-white truncate">{order.item?.title || "Item"}</h3>
                                <p className="text-xs text-neutral-500">
                                    Sold by {order.seller?.name || order.seller?.email || "Seller"}
                                </p>
                                <p className="mt-1 text-sm font-semibold text-yellow-500">
                                    {formatPrice(order.totalPrice, order.currency || "USD")}
                                </p>
                            </div>

                            {/* Status & Date */}
                            <div className="text-right flex-shrink-0">
                                <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${order.status === "COMPLETE"
                                        ? "bg-green-500/20 text-green-400"
                                        : "bg-yellow-500/20 text-yellow-400"
                                    }`}>
                                    {order.status === "COMPLETE" ? "Delivered" : "Paid"}
                                </span>
                                <p className="mt-2 text-[10px] text-neutral-500">
                                    {formatRelativeTime(order.createdAt)}
                                </p>
                                <Link
                                    href={`/deals/${order.id}`}
                                    className="mt-2 inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-white"
                                >
                                    View <ExternalLink className="h-3 w-3" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
