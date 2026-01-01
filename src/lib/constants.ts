
// Site-wide constants for Lux Auction

export const SITE_NAME = "Lux Auction";
export const SITE_TAGLINE = "The National Jewelry Exchange";
export const SITE_DESCRIPTION = "Israel's premier hybrid exchange for diamonds, fine jewelry, and rare timepieces.";

export const CURRENCY_DEFAULT = "USD";

export const AUCTION_ANTI_SNIPE_MINUTES = 5;
export const AUCTION_MIN_BID_INCREMENT = 1;

export const CATEGORIES = [
    "Diamonds",
    "Rings",
    "Necklaces",
    "Earrings",
    "Bracelets",
    "Watches",
    "Pendants",
    "Brooches",
    "Cufflinks",
    "Other",
] as const;

export const USER_ROLES = {
    BUYER: "Buyer",
    SELLER: "Seller",
    SELLER_VERIFIED: "Verified Seller",
    ADMIN: "Administrator",
} as const;

export const DEAL_STATUS_LABELS = {
    OPEN: "Open",
    PENDING_PAYMENT: "Awaiting Payment",
    PAID: "Paid",
    CANCELLED: "Cancelled",
    COMPLETE: "Completed",
} as const;

export const NAV_LINKS = [
    { href: "/auctions", label: "Active Auctions" },
    { href: "/marketplace", label: "Marketplace" },
    { href: "/requested-items", label: "Requested Items" },
    { href: "/how-it-works", label: "How It Works" },
] as const;

export const FOOTER_LINKS = {
    legal: [
        { href: "/terms", label: "Terms of Service" },
        { href: "/privacy", label: "Privacy Policy" },
        { href: "/contact", label: "Contact Support" },
    ],
} as const;
