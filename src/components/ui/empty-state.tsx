
import { cn } from "@/lib/utils";
import { Package, Search, Bell, ShoppingCart, FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        href: string;
    };
    className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center py-16 px-4 text-center", className)}>
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-900 border border-neutral-800">
                {icon || <Package className="h-8 w-8 text-neutral-600" />}
            </div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            {description && (
                <p className="mt-2 max-w-sm text-sm text-neutral-500">{description}</p>
            )}
            {action && (
                <Button asChild className="mt-6" variant="secondary">
                    <Link href={action.href}>{action.label}</Link>
                </Button>
            )}
        </div>
    );
}

// Pre-configured Empty States
export function NoResultsEmpty() {
    return (
        <EmptyState
            icon={<Search className="h-8 w-8 text-neutral-600" />}
            title="No Results Found"
            description="Try adjusting your search or filters to find what you're looking for."
            action={{ label: "Clear Filters", href: "/search" }}
        />
    );
}

export function NoNotificationsEmpty() {
    return (
        <EmptyState
            icon={<Bell className="h-8 w-8 text-neutral-600" />}
            title="No Notifications"
            description="You're all caught up! New activity will appear here."
        />
    );
}

export function EmptyCartState() {
    return (
        <EmptyState
            icon={<ShoppingCart className="h-8 w-8 text-neutral-600" />}
            title="Your Cart is Empty"
            description="Browse our marketplace to find exceptional pieces."
            action={{ label: "Explore Auctions", href: "/auctions" }}
        />
    );
}

export function NoListingsEmpty() {
    return (
        <EmptyState
            icon={<FileText className="h-8 w-8 text-neutral-600" />}
            title="No Listings Yet"
            description="Start selling by listing your first item."
            action={{ label: "List an Item", href: "/seller/list-item" }}
        />
    );
}
