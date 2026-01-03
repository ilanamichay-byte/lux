import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Bell } from "lucide-react";
import { NotificationCard, NotificationHeaderActions } from "./notification-card";

export const metadata = {
    title: "Notifications | LUX AUCTION",
    description: "View your notifications on LUX AUCTION",
};

export default async function NotificationsPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/sign-in");
    }

    const userId = (session.user as any).id;

    // Fetch notifications
    const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50,
    });

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <div className="mx-auto max-w-4xl px-4 py-8">
            {/* Page Header */}
            <div className="mb-8 border-b border-neutral-800 pb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-semibold text-white">Notifications</h1>
                        {unreadCount > 0 && (
                            <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-2.5 py-0.5 text-xs font-medium text-amber-300">
                                {unreadCount} new
                            </span>
                        )}
                    </div>
                    <NotificationHeaderActions
                        hasUnread={unreadCount > 0}
                        hasNotifications={notifications.length > 0}
                    />
                </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
                {notifications.map((notification) => (
                    <NotificationCard key={notification.id} notification={notification} />
                ))}

                {/* Empty State */}
                {notifications.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-900/80 border border-neutral-800">
                            <Bell className="h-10 w-10 text-neutral-600" />
                        </div>
                        <h2 className="text-xl font-medium text-white">No notifications yet</h2>
                        <p className="mt-2 max-w-sm text-sm text-neutral-500">
                            When you receive notifications about bids, auctions, and account activity, they'll appear here.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
