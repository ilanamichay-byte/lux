
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { CheckoutWizard } from "./checkout-wizard";

export default async function CheckoutPage({
    params,
}: {
    params: Promise<{ dealId: string }>;
}) {
    const { dealId } = await params;
    const session = await auth();

    if (!session?.user) {
        redirect("/sign-in");
    }

    const deal = await prisma.deal.findUnique({
        where: { id: dealId },
        include: {
            item: true,
            buyer: true,
            seller: true,
        },
    });

    if (!deal) {
        notFound();
    }

    // Verify the user is the buyer
    if (deal.buyerId !== (session.user as any).id) {
        return <div className="p-10 text-center">You are not authorized to view this order.</div>;
    }

    // If already paid, redirect or show receipt (handled in dashboard usually, but fine here)
    if (deal.status === 'PAID' || deal.status === 'COMPLETE') {
        // You could also render the "Success" state of the wizard directly or a receipt page
        // For now, let's just let the user see the Wizard in "success" state or similar, 
        // but Wizard defaults to shipping.
        // Let's redirect to dashboard for simplicity as per previous logic, OR show a receipt.
        // Previous logic showed success message if param present.
        // We can just show the dashboard.
        redirect("/account/bids");
    }

    return (
        <div className="mx-auto max-w-5xl px-4 py-8">
            <h1 className="mb-8 text-2xl font-semibold text-white">Checkout</h1>
            <CheckoutWizard deal={deal} user={session.user} />
        </div>
    );
}
