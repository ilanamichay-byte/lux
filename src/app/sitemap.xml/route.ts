
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface SitemapEntry {
    url: string;
    priority: number;
    changefreq: string;
    lastmod?: string;
}

export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://lux-auction.vercel.app";

    // Get all published items
    const items = await prisma.item.findMany({
        where: { status: "PUBLISHED" },
        select: { id: true, createdAt: true, saleType: true },
    });

    const staticPages: SitemapEntry[] = [
        { url: "/", priority: 1.0, changefreq: "daily" },
        { url: "/auctions", priority: 0.9, changefreq: "hourly" },
        { url: "/marketplace", priority: 0.9, changefreq: "daily" },
        { url: "/search", priority: 0.8, changefreq: "daily" },
        { url: "/how-it-works", priority: 0.5, changefreq: "monthly" },
        { url: "/sign-in", priority: 0.3, changefreq: "monthly" },
        { url: "/sign-up", priority: 0.3, changefreq: "monthly" },
    ];

    const itemPages: SitemapEntry[] = items.map((item) => ({
        url: item.saleType === "AUCTION" ? `/auctions/${item.id}` : `/marketplace/${item.id}`,
        priority: 0.7,
        changefreq: "daily",
        lastmod: item.createdAt.toISOString().split("T")[0],
    }));

    const allPages: SitemapEntry[] = [...staticPages, ...itemPages];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
            .map(
                (page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    ${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : ""}
  </url>`
            )
            .join("\n")}
</urlset>`;

    return new NextResponse(sitemap, {
        headers: {
            "Content-Type": "application/xml",
        },
    });
}
