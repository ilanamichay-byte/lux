
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function NotificationsPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/sign-in");
    }

    // Fetch real notifications safely
    let notifications: any[] = [];
    if (prisma.notification) {
        try {
            notifications = await prisma.notification.findMany({
                where: { userId: session.user.id },
                orderBy: { createdAt: "desc" },
                take: 50,
            });
        } catch (e) {
            console.error("Failed to fetch notifications:", e);
        }
    }

    return (
        <div className="mx-auto max-w-4xl px-4 py-8">
            <h1 className="mb-6 text-2xl font-bold text-white">Notifications</h1>

            <div className="space-y-4">
                {notifications.map((n) => (
                    <div
                        key={n.id}
                        className={`flex flex-col gap-1 rounded-xl border p-4 ${n.read
                            ? "border-neutral-800 bg-neutral-900/40 text-neutral-400"
                            : "border-yellow-500/30 bg-yellow-500/5 text-neutral-100"
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="font-semibold">{n.title}</span>
                            <span className="text-[10px] uppercase tracking-wider text-neutral-500">{n.createdAt.toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm">{n.message}</p>
                        {n.link && (
                            <a href={n.link} className="mt-2 text-xs text-yellow-500 hover:underline">
                                View Details →
                            </a>
                        )}
                    </div>
                ))}

                {notifications.length === 0 && (
                    <p className="text-center text-neutral-500">You have no new notifications.</p>
                )}
            </div>
        </div>
    );
}
