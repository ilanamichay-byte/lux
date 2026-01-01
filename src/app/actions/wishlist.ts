
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleWishlist(itemId: string) {
    const session = await auth();
    if (!session?.user) return { error: "Please sign in" };

    const userId = (session.user as any).id;

    // Check if already in wishlist
    const existing = await prisma.wishlist.findUnique({
        where: {
            userId_itemId: { userId, itemId }
        }
    });

    if (existing) {
        // Remove from wishlist
        await prisma.wishlist.delete({
            where: { id: existing.id }
        });
        revalidatePath(`/auctions/${itemId}`);
        revalidatePath(`/marketplace/${itemId}`);
        return { added: false };
    } else {
        // Add to wishlist
        await prisma.wishlist.create({
            data: { userId, itemId }
        });
        revalidatePath(`/auctions/${itemId}`);
        revalidatePath(`/marketplace/${itemId}`);
        return { added: true };
    }
}

export async function getWishlistStatus(itemId: string): Promise<boolean> {
    const session = await auth();
    if (!session?.user) return false;

    const userId = (session.user as any).id;

    const existing = await prisma.wishlist.findUnique({
        where: {
            userId_itemId: { userId, itemId }
        }
    });

    return !!existing;
}
