import { NotificationSkeleton } from "@/components/ui/skeleton";

export default function NotificationsLoading() {
    return (
        <div className="mx-auto max-w-4xl px-4 py-8">
            <div className="mb-6 h-8 w-40 animate-pulse rounded-lg bg-neutral-800/50" />

            <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <NotificationSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}
