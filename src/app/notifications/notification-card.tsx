"use client";

import { Check, Trash2 } from "lucide-react";
import { markNotificationAsRead, deleteNotification } from "./actions";
import { useTransition } from "react";
import { formatRelativeTime } from "@/lib/utils";

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

    // Type-based left border colors for visual hierarchy
    const typeBorderColors = {
        SUCCESS: "border-l-green-500",
        WARNING: "border-l-amber-500",
        ERROR: "border-l-red-500",
        INFO: "border-l-blue-500",
    };

    // Background colors by type (subtle)
    const typeBackgrounds = {
        SUCCESS: "bg-green-500/5",
        WARNING: "bg-amber-500/5",
        ERROR: "bg-red-500/5",
        INFO: "bg-blue-500/5",
    };

    const leftBorder = notification.read
        ? "border-l-neutral-700"
        : (typeBorderColors[notification.type as keyof typeof typeBorderColors] || "border-l-amber-400");

    const bgColor = notification.read
        ? "bg-neutral-900/40"
        : (typeBackgrounds[notification.type as keyof typeof typeBackgrounds] || "bg-amber-500/5");

    return (
        <div
            className={`
                relative flex flex-col gap-2 rounded-xl border border-neutral-800 
                border-l-4 ${leftBorder} ${bgColor}
                p-4 transition-all duration-200
                ${isPending ? "opacity-50 pointer-events-none" : ""} 
                ${notification.read
                    ? "shadow-none"
                    : "shadow-[0_0_15px_rgba(0,0,0,0.3)]"
                }
            `}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    {/* Title with unread indicator */}
                    <div className="flex items-center gap-2">
                        <span className={`
                            ${notification.read
                                ? "font-medium text-neutral-400"
                                : "font-semibold text-white"
                            }
                        `}>
                            {notification.title}
                        </span>
                        {!notification.read && (
                            <span className="flex-shrink-0 h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                        )}
                    </div>

                    {/* Message */}
                    <p className={`
                        mt-1 text-sm leading-relaxed
                        ${notification.read ? "text-neutral-500" : "text-neutral-300"}
                    `}>
                        {notification.message}
                    </p>

                    {/* Action link */}
                    {notification.link && (
                        <a
                            href={notification.link}
                            onClick={handleMarkAsRead}
                            className="mt-2 inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition-colors"
                        >
                            View Details
                            <span className="text-[10px]">→</span>
                        </a>
                    )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1 flex-shrink-0">
                    {!notification.read && (
                        <button
                            onClick={handleMarkAsRead}
                            disabled={isPending}
                            className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-800 hover:text-white transition-colors"
                            title="Mark as read"
                            aria-label="Mark notification as read"
                        >
                            <Check className="h-4 w-4" />
                        </button>
                    )}
                    <button
                        onClick={handleDelete}
                        disabled={isPending}
                        className="rounded-full p-1.5 text-neutral-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                        title="Delete"
                        aria-label="Delete notification"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Relative timestamp */}
            <span className={`
                text-[10px] uppercase tracking-wider
                ${notification.read ? "text-neutral-600" : "text-neutral-500"}
            `}>
                {formatRelativeTime(notification.createdAt)}
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
                    className="rounded-full border border-neutral-700 px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:border-neutral-500 hover:text-white disabled:opacity-50"
                    aria-label="Mark all notifications as read"
                >
                    <Check className="mr-1.5 inline h-3 w-3" />
                    Mark all read
                </button>
            )}
            <button
                onClick={handleDeleteAll}
                disabled={isPending}
                className="rounded-full border border-neutral-700 px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:border-red-500/50 hover:text-red-400 disabled:opacity-50"
                aria-label="Delete all notifications"
            >
                <Trash2 className="mr-1.5 inline h-3 w-3" />
                Clear all
            </button>
        </div>
    );
}
