
"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { createNotification } from "@/lib/notifications";

export async function processPaymentAction(dealId: string, paymentDetails?: any) {
    if (!dealId) return;

    const deal = await prisma.deal.findUnique({
        where: { id: dealId },
        include: { item: true, seller: true }
    });

    if (!deal) return;

    // In a real app, verify payment here using paymentDetails

    await prisma.deal.update({
        where: { id: dealId },
        data: {
            status: "PAID",
            updatedAt: new Date(),
        },
    });

    // Notify Buyer
    await createNotification({
        userId: deal.buyerId,
        title: "Payment Successful",
        message: `You have successfully paid for ${deal.item?.title || 'your item'}.`,
        type: "SUCCESS",
        link: `/deals/${deal.id}`
    });

    // Notify Seller
    await createNotification({
        userId: deal.sellerId,
        title: "Item Sold!",
        message: `Payment received for ${deal.item?.title || 'your item'}. Please prepare for shipping.`,
        type: "SUCCESS",
        link: `/deals/${deal.id}`
    });

    // Redirect happens in the client component usually, but server actions can redirect too
    // However, for better UX with confetti, we might return success status and let client redirect
    return { success: true };
}
