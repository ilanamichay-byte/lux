"use client";

import { Check, Trash2, X } from "lucide-react";
import { markNotificationAsRead, deleteNotification } from "./actions";
import { useTransition } from "react";

interface NotificationCardProps {
    notification: {
        id: string;
        title: string;
        message: string;
        type: string;
        link?: string | null;
        read: boolean;
        createdAt: Date;
    };
}

export function NotificationCard({ notification }: NotificationCardProps) {
    const [isPending, startTransition] = useTransition();

    const handleMarkAsRead = () => {
        if (notification.read) return;
        startTransition(() => {
            markNotificationAsRead(notification.id);
        });
    };

    const handleDelete = () => {
        startTransition(() => {
            deleteNotification(notification.id);
        });
    };

    const typeColors = {
        SUCCESS: "border-green-500/30 bg-green-500/5",
        WARNING: "border-orange-500/30 bg-orange-500/5",
        ERROR: "border-red-500/30 bg-red-500/5",
        INFO: "border-blue-500/30 bg-blue-500/5",
    };

    const borderColor = notification.read
        ? "border-neutral-800 bg-neutral-900/40"
        : (typeColors[notification.type as keyof typeof typeColors] || "border-yellow-500/30 bg-yellow-500/5");

    return (
        <div
            className={`relative flex flex-col gap-1 rounded-xl border p-4 transition-opacity ${borderColor} ${isPending ? "opacity-50" : ""} ${notification.read ? "text-neutral-400" : "text-neutral-100"}`}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold">{notification.title}</span>
                        {!notification.read && (
                            <span className="h-2 w-2 rounded-full bg-yellow-500" />
                        )}
                    </div>
                    <p className="mt-1 text-sm">{notification.message}</p>
                    {notification.link && (
                        <a
                            href={notification.link}
                            onClick={handleMarkAsRead}
                            className="mt-2 inline-block text-xs text-yellow-500 hover:underline"
                        >
                            View Details →
                        </a>
                    )}
                </div>

                <div className="flex items-center gap-1">
                    {!notification.read && (
                        <button
                            onClick={handleMarkAsRead}
                            disabled={isPending}
                            className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-800 hover:text-white transition-colors"
                            title="Mark as read"
                        >
                            <Check className="h-4 w-4" />
                        </button>
                    )}
                    <button
                        onClick={handleDelete}
                        disabled={isPending}
                        className="rounded-full p-1.5 text-neutral-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <span className="mt-2 text-[10px] uppercase tracking-wider text-neutral-500">
                {new Date(notification.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                })}
            </span>
        </div>
    );
}

interface NotificationHeaderActionsProps {
    hasUnread: boolean;
    hasNotifications: boolean;
}

export function NotificationHeaderActions({ hasUnread, hasNotifications }: NotificationHeaderActionsProps) {
    const [isPending, startTransition] = useTransition();

    const handleMarkAllAsRead = async () => {
        const { markAllNotificationsAsRead } = await import("./actions");
        startTransition(() => {
            markAllNotificationsAsRead();
        });
    };

    const handleDeleteAll = async () => {
        if (!confirm("Are you sure you want to delete all notifications?")) return;
        const { deleteAllNotifications } = await import("./actions");
        startTransition(() => {
            deleteAllNotifications();
        });
    };

    if (!hasNotifications) return null;

    return (
        <div className="flex items-center gap-2">
            {hasUnread && (
                <button
                    onClick={handleMarkAllAsRead}
                    disabled={isPending}
                    className="rounded-full border border-neutral-700 px-3 py-1.5 text-xs text-neutral-300 hover:border-yellow-500 hover:text-yellow-400 transition-colors disabled:opacity-50"
                >
                    <Check className="mr-1 inline h-3 w-3" />
                    Mark all read
                </button>
            )}
            <button
                onClick={handleDeleteAll}
                disabled={isPending}
                className="rounded-full border border-neutral-700 px-3 py-1.5 text-xs text-neutral-300 hover:border-red-500 hover:text-red-400 transition-colors disabled:opacity-50"
            >
                <Trash2 className="mr-1 inline h-3 w-3" />
                Clear all
            </button>
        </div>
    );
}
