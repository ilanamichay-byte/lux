
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Format a date as a relative timestamp for user-friendly display
 * Following UX guidelines:
 * - < 1 hour: "Just now" / "X minutes ago"
 * - < 24 hours: "X hours ago"
 * - < 7 days: "DayName at HH:MM"
 * - > 7 days: "MMM DD, YYYY"
 */
export function formatRelativeTime(date: Date | string): string {
    const now = new Date();
    const target = typeof date === 'string' ? new Date(date) : date;
    const diffMs = now.getTime() - target.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
        return "Just now";
    }
    if (diffMinutes < 60) {
        return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
    }
    if (diffHours < 24) {
        return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    }
    if (diffDays < 7) {
        const dayName = target.toLocaleDateString('en-US', { weekday: 'long' });
        const time = target.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        return `${dayName} at ${time}`;
    }

    return target.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}
