
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AddressForm } from "@/components/checkout/address-form";
import { PaymentForm } from "@/components/checkout/payment-form";
import { OrderSummary } from "@/components/checkout/order-summary";
import { processPaymentAction } from "../actions";
import { CheckCircle2 } from "lucide-react";

interface CheckoutWizardProps {
    deal: any;
    user: any;
}

export function CheckoutWizard({ deal, user }: CheckoutWizardProps) {
    const router = useRouter();
    const [step, setStep] = useState<"shipping" | "payment" | "success">("shipping");
    const [isProcessing, setIsProcessing] = useState(false);

    // In a real app, you'd save this to DB/Local Storage
    const [shippingData, setShippingData] = useState({
        fullName: user.name || "",
        street: "",
        city: "",
        zip: "",
        country: "Israel"
    });

    const handleShippingSubmit = (data: any) => {
        setShippingData(data);
        setStep("payment");
    };

    const handlePaymentSubmit = async () => {
        setIsProcessing(true);
        try {
            const result = await processPaymentAction(deal.id);
            if (result?.success) {
                setStep("success");
                // Optional: trigger confetti here
            }
        } catch (error) {
            console.error("Payment failed", error);
        } finally {
            setIsProcessing(false);
        }
    };

    if (step === "success") {
        return (
            <div className="mx-auto max-w-2xl px-4 py-12 text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20 text-green-500"
                >
                    <CheckCircle2 className="h-10 w-10" />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h1 className="text-3xl font-bold text-white">Payment Successful</h1>
                    <p className="mt-4 text-neutral-400">
                        Thank you for your purchase. We have notified the seller.
                    </p>
                    <div className="mt-8">
                        <button
                            onClick={() => router.push("/account/bids")}
                            className="rounded-full bg-neutral-800 px-8 py-3 text-sm font-semibold text-white hover:bg-neutral-700 hover:text-yellow-400 transition-colors"
                        >
                            Return to My Bids
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
            <div className="space-y-6">
                {/* Steps Indicator */}
                <div className="flex items-center gap-4 text-sm font-medium">
                    <div className={`flex items-center gap-2 ${step === 'shipping' ? 'text-yellow-500' : 'text-green-500'}`}>
                        <div className={`flex h-6 w-6 items-center justify-center rounded-full border ${step === 'shipping' ? 'border-yellow-500 bg-yellow-500/20' : 'border-green-500 bg-green-500/20'}`}>1</div>
                        Shipping
                    </div>
                    <div className="h-px w-8 bg-neutral-800" />
                    <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-yellow-500' : 'text-neutral-500'}`}>
                        <div className={`flex h-6 w-6 items-center justify-center rounded-full border ${step === 'payment' ? 'border-yellow-500 bg-yellow-500/20' : 'border-neutral-800 bg-neutral-900'}`}>2</div>
                        Payment
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {step === "shipping" && (
                        <motion.div
                            key="shipping"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="rounded-xl border border-neutral-800 bg-neutral-950 p-6"
                        >
                            <h2 className="mb-6 text-xl font-bold text-white">Shipping Details</h2>
                            <AddressForm
                                onSubmit={handleShippingSubmit}
                                initialData={shippingData}
                            />
                        </motion.div>
                    )}

                    {step === "payment" && (
                        <motion.div
                            key="payment"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="rounded-xl border border-neutral-800 bg-neutral-950 p-6"
                        >
                            <button
                                onClick={() => setStep("shipping")}
                                className="mb-6 text-xs text-neutral-500 hover:text-white"
                            >
                                ← Back to shipping
                            </button>
                            <h2 className="mb-6 text-xl font-bold text-white">Payment Method</h2>
                            <PaymentForm
                                onSubmit={handlePaymentSubmit}
                                amount={deal.totalPrice || 0}
                                currency={deal.currency || "USD"}
                                isProcessing={isProcessing}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="h-fit sticky top-24">
                <OrderSummary
                    item={{
                        title: deal.item?.title || "Unknown Item",
                        image: deal.item?.mainImageUrl,
                        price: deal.totalPrice || 0,
                        currency: deal.currency
                    }}
                />

                <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-neutral-600">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Secure Checkout powered by LuxPay</span>
                </div>
            </div>
        </div>
    );
}
