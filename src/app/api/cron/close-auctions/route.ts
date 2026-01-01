
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

// Vercel Cron usually sends a specific header, or we can use a secret key query param
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        // Security: Verify cron secret to prevent unauthorized access
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        // Check Vercel Cron header OR authorization header
        const isVercelCron = request.headers.get('x-vercel-cron') === '1';
        const isValidSecret = cronSecret && authHeader === `Bearer ${cronSecret}`;

        if (!isVercelCron && !isValidSecret) {
            console.warn('[CRON] Unauthorized access attempt to close-auctions');
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const now = new Date();

        // 1. Find auctions that have ended but are still marked as PUBLISHED
        const endedAuctions = await prisma.item.findMany({
            where: {
                saleType: "AUCTION",
                status: "PUBLISHED",
                auctionEnd: {
                    lte: now,
                },
            },
            include: {
                bids: {
                    orderBy: { amount: "desc" },
                    take: 1,
                },
                seller: true,
            },
        });

        const results = [];

        for (const item of endedAuctions) {
            // Check if there are bids
            const winnerBid = item.bids[0];

            if (winnerBid) {
                // WON: Create Deal, Mark Sold
                const deal = await prisma.$transaction(async (tx) => {
                    // 1. Update status to SOLD
                    await tx.item.update({
                        where: { id: item.id },
                        data: { status: "SOLD" },
                    });

                    // 2. Create Deal
                    const createdDeal = await tx.deal.create({
                        data: {
                            buyerId: winnerBid.bidderId,
                            sellerId: item.sellerId,
                            itemId: item.id,
                            status: "PENDING_PAYMENT",
                            totalPrice: winnerBid.amount,
                            currency: item.currency,
                        },
                    });

                    return createdDeal;
                });

                results.push({ id: item.id, dealId: deal.id, status: "SOLD", winner: winnerBid.bidderId });

                // Notify Winner - use correct deal.id for checkout link
                await createNotification({
                    userId: winnerBid.bidderId,
                    title: "You Won!",
                    message: `Congratulations! You won the auction for "${item.title}". Proceed to checkout.`,
                    type: "SUCCESS",
                    link: `/checkout/${deal.id}`
                });

                // Notify Seller
                await createNotification({
                    userId: item.sellerId,
                    title: "Auction Ended",
                    message: `Your auction for "${item.title}" ended with a winning bid of ${item.currency} ${winnerBid.amount}.`,
                    type: "INFO",
                    link: `/account/listings`
                });

            } else {
                // NO BIDS: Mark as UNSOLD/HIDDEN or keep PUBLISHED but Expired?
                // Let's mark as HIDDEN or a new status "EXPIRED" if we had it.
                // For now, let's just leave it PUBLISHED but it will show "Ended" in UI.
                // Or better, change status to HIDDEN so it doesn't clutter active.
                /*
                await prisma.item.update({
                    where: { id: item.id },
                    data: { status: "HIDDEN" }
                });
                */
                // Actually, usually you want to notify seller to Relist.
                results.push({ id: item.id, status: "NO_BIDS" });

                await createNotification({
                    userId: item.sellerId,
                    title: "Auction Ended",
                    message: `Your auction for "${item.title}" ended with no bids.`,
                    type: "WARNING",
                    link: `/account/listings`
                });
            }
        }

        return NextResponse.json({
            success: true,
            processed: endedAuctions.length,
            details: results
        });

    } catch (error) {
        console.error("Cron Error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
