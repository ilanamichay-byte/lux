
import { cn } from "@/lib/utils";

interface OrderSummaryProps {
    item: {
        title: string;
        image?: string | null;
        price: number;
        currency?: string;
    };
    className?: string;
}

export function OrderSummary({ item, className }: OrderSummaryProps) {
    const currency = item.currency || "USD";

    // Mock calculations
    const shipping = 50;
    const tax = item.price * 0.17; // 17% VAT
    const total = item.price + shipping + tax;

    return (
        <div className={cn("rounded-2xl border border-neutral-800 bg-neutral-950/50 p-6 backdrop-blur-sm", className)}>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-neutral-500">Order Summary</h3>

            <div className="flex gap-4">
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-900 border border-neutral-800">
                    {item.image && <img src={item.image} alt={item.title} className="h-full w-full object-cover" />}
                </div>
                <div>
                    <h4 className="font-medium text-white line-clamp-2">{item.title}</h4>
                    <p className="mt-1 text-sm text-yellow-500 font-semibold">{currency} {item.price.toLocaleString()}</p>
                </div>
            </div>

            <div className="my-6 h-px bg-neutral-800" />

            <div className="space-y-2 text-sm">
                <div className="flex justify-between text-neutral-400">
                    <span>Subtotal</span>
                    <span>{currency} {item.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                    <span>Shipping</span>
                    <span>{currency} {shipping}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                    <span>Tax (17%)</span>
                    <span>{currency} {tax.toLocaleString()}</span>
                </div>
            </div>

            <div className="my-6 h-px bg-neutral-800" />

            <div className="flex justify-between items-center">
                <span className="font-semibold text-white">Total</span>
                <span className="text-xl font-bold text-yellow-500">{currency} {total.toLocaleString()}</span>
            </div>
        </div>
    );
}
