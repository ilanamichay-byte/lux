
"use client";

import { Heart } from "lucide-react";
import { useState, useTransition } from "react";
import { toggleWishlist } from "@/app/actions/wishlist";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
    itemId: string;
    initialState?: boolean;
    className?: string;
}

export function WishlistButton({ itemId, initialState = false, className }: WishlistButtonProps) {
    const [isWishlisted, setIsWishlisted] = useState(initialState);
    const [isPending, startTransition] = useTransition();

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        startTransition(async () => {
            const result = await toggleWishlist(itemId);
            if (!result.error) {
                setIsWishlisted(result.added ?? false);
            }
        });
    };

    return (
        <button
            onClick={handleClick}
            disabled={isPending}
            className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border transition-all",
                isWishlisted
                    ? "border-red-500/50 bg-red-500/20 text-red-400 hover:bg-red-500/30"
                    : "border-neutral-700 bg-neutral-900/50 text-neutral-400 hover:border-red-500/50 hover:text-red-400",
                isPending && "opacity-50 cursor-not-allowed",
                className
            )}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
            <Heart
                className={cn("h-4 w-4", isWishlisted && "fill-current")}
                strokeWidth={1.5}
            />
        </button>
    );
}
