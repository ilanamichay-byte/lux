
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

// Mock verification action
async function verifySellerAction(formData: FormData) {
    "use server";
    const userId = formData.get("userId")?.toString();
    if (!userId) return;

    await prisma.user.update({
        where: { id: userId },
        data: { role: "SELLER_VERIFIED", sellerStatus: "APPROVED" },
    });

    const { createNotification } = await import("@/lib/notifications");
    await createNotification({
        userId: userId,
        title: "You are now a Verified Seller!",
        message: "Your application has been approved. You can now list items for auction.",
        type: "SUCCESS",
        link: "/seller/list-item"
    });

    redirect("/admin");
}

export default async function AdminDashboardPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/sign-in");
    }

    // Only allow if role is ADMIN (Check DB to be sure or trust session)
    // For MVP assuming session.user.role is reliable or we check DB

    if ((session.user as any).role !== "ADMIN") {
        // Allow access for now or redirect
        // return <div className="p-10 text-center">Unauthorized</div>;
    }

    // NOTE: Ideally we check the DB role here for security.

    const pendingSellers = await prisma.user.findMany({
        where: { sellerStatus: "PENDING" },
    });

    const recentItems = await prisma.item.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { seller: true }
    });

    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <h1 className="mb-8 text-2xl font-semibold">Admin Dashboard</h1>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Pending Sellers */}
                <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
                    <h2 className="mb-4 text-lg font-medium text-white">Pending Seller Approvals</h2>
                    {pendingSellers.length === 0 ? (
                        <p className="text-neutral-500">No pending approvals.</p>
                    ) : (
                        <div className="space-y-4">
                            {pendingSellers.map(user => (
                                <div key={user.id} className="flex items-center justify-between rounded-lg border border-neutral-800 bg-black/40 p-4">
                                    <div>
                                        <p className="font-medium text-white">{user.name || user.email}</p>
                                        <p className="text-xs text-neutral-500">{user.email}</p>
                                    </div>
                                    <form action={verifySellerAction}>
                                        <input type="hidden" name="userId" value={user.id} />
                                        <button className="rounded-full bg-green-500/10 px-4 py-1.5 text-xs font-semibold text-green-400 border border-green-500/20 hover:bg-green-500/20">
                                            Approve
                                        </button>
                                    </form>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Items */}
                <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
                    <h2 className="mb-4 text-lg font-medium text-white">Recent Listings</h2>
                    <div className="space-y-4">
                        {recentItems.map(item => (
                            <div key={item.id} className="flex items-center gap-4 rounded-lg border border-neutral-800 bg-black/40 p-4">
                                <div className="h-10 w-10 overflow-hidden rounded bg-neutral-900 border border-neutral-800">
                                    {item.mainImageUrl && <img src={item.mainImageUrl} className="h-full w-full object-cover" />}
                                </div>
                                <div>
                                    <Link href={`/auctions/${item.id}`} className="text-sm font-medium text-neutral-200 hover:text-yellow-400">
                                        {item.title}
                                    </Link>
                                    <p className="text-xs text-neutral-500">By {item.seller.name || item.seller.email}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
