
import { prisma } from "@/lib/prisma";

export type NotificationType = "INFO" | "SUCCESS" | "WARNING" | "ERROR";

export async function createNotification({
    userId,
    title,
    message,
    type = "INFO",
    link,
}: {
    userId: string;
    title: string;
    message: string;
    type?: NotificationType;
    link?: string;
}) {
    try {
        const notification = await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type,
                link,
            },
        });
        return notification;
    } catch (error) {
        console.error("Failed to create notification:", error);
        // Silent fail to not break main flow
        return null;
    }
}
