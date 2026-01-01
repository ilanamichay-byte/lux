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
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-white">Notifications</h1>
                    {unreadCount > 0 && (
                        <span className="rounded-full bg-yellow-500 px-2 py-0.5 text-xs font-bold text-black">
                            {unreadCount} new
                        </span>
                    )}
                </div>
                <NotificationHeaderActions
                    hasUnread={unreadCount > 0}
                    hasNotifications={notifications.length > 0}
                />
            </div>

            <div className="space-y-3">
                {notifications.map((notification) => (
                    <NotificationCard key={notification.id} notification={notification} />
                ))}

                {notifications.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-900">
                            <Bell className="h-8 w-8 text-neutral-600" />
                        </div>
                        <h2 className="text-lg font-medium text-white">No notifications</h2>
                        <p className="mt-1 text-sm text-neutral-500">
                            When you receive notifications, they'll appear here.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
