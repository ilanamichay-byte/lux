
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
    return (
        <nav
            aria-label="Breadcrumb"
            className={cn("flex items-center gap-1 text-xs text-neutral-500", className)}
        >
            <Link
                href="/"
                className="flex items-center gap-1 hover:text-white transition-colors"
                aria-label="Home"
            >
                <Home className="h-3 w-3" />
            </Link>

            {items.map((item, index) => (
                <span key={index} className="flex items-center gap-1">
                    <ChevronRight className="h-3 w-3" />
                    {item.href ? (
                        <Link
                            href={item.href}
                            className="hover:text-white transition-colors"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-neutral-300">{item.label}</span>
                    )}
                </span>
            ))}
        </nav>
    );
}
