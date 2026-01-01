"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function markNotificationAsRead(notificationId: string) {
    const session = await auth();
    if (!session?.user) {
        return { error: "Not authenticated" };
    }

    const userId = (session.user as any).id;

    // Verify the notification belongs to the user
    const notification = await prisma.notification.findFirst({
        where: {
            id: notificationId,
            userId: userId,
        },
    });

    if (!notification) {
        return { error: "Notification not found" };
    }

    await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true },
    });

    revalidatePath("/notifications");
    return { success: true };
}

export async function markAllNotificationsAsRead() {
    const session = await auth();
    if (!session?.user) {
        return { error: "Not authenticated" };
    }

    const userId = (session.user as any).id;

    await prisma.notification.updateMany({
        where: {
            userId: userId,
            read: false,
        },
        data: { read: true },
    });

    revalidatePath("/notifications");
    revalidatePath("/"); // Header notification count
    return { success: true };
}

export async function deleteNotification(notificationId: string) {
    const session = await auth();
    if (!session?.user) {
        return { error: "Not authenticated" };
    }

    const userId = (session.user as any).id;

    // Verify the notification belongs to the user
    const notification = await prisma.notification.findFirst({
        where: {
            id: notificationId,
            userId: userId,
        },
    });

    if (!notification) {
        return { error: "Notification not found" };
    }

    await prisma.notification.delete({
        where: { id: notificationId },
    });

    revalidatePath("/notifications");
    return { success: true };
}

export async function deleteAllNotifications() {
    const session = await auth();
    if (!session?.user) {
        return { error: "Not authenticated" };
    }

    const userId = (session.user as any).id;

    await prisma.notification.deleteMany({
        where: { userId: userId },
    });

    revalidatePath("/notifications");
    revalidatePath("/");
    return { success: true };
}
