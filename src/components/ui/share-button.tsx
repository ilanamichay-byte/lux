
"use client";

import { Share2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
    title: string;
    text?: string;
    url?: string;
    className?: string;
}

export function ShareButton({ title, text, url, className }: ShareButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
        const shareData = {
            title,
            text: text || `Check out ${title} on Lux Auction`,
            url: shareUrl,
        };

        // Try native share first
        if (typeof navigator !== "undefined" && navigator.share) {
            try {
                await navigator.share(shareData);
                return;
            } catch (err) {
                // User cancelled or error, fall back to copy
            }
        }

        // Fallback: copy to clipboard
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    return (
        <button
            onClick={handleShare}
            className={cn(
                "flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900/50 px-4 py-2 text-sm text-neutral-300 transition-all hover:border-neutral-600 hover:text-white",
                className
            )}
            aria-label="Share this item"
        >
            <Share2 className="h-4 w-4" />
            {copied ? "Copied!" : "Share"}
        </button>
    );
}
