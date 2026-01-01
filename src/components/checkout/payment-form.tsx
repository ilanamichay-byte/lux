
import { cn } from "@/lib/utils";
import { useState } from "react";
import { CreditCard, Lock } from "lucide-react";

interface PaymentFormProps {
    onSubmit: () => void;
    amount: number;
    currency: string;
    isProcessing: boolean;
}

export function PaymentForm({ onSubmit, amount, currency, isProcessing }: PaymentFormProps) {
    const [cardData, setCardData] = useState({
        number: "",
        expiry: "",
        cvc: "",
        name: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // Simple formatting
        if (name === 'number') {
            const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
            const parts = [];
            for (let i = 0; i < v.length; i += 4) {
                parts.push(v.substring(i, i + 4));
            }
            if (parts.length) {
                setCardData({ ...cardData, [name]: parts.join(' ').substr(0, 19) });
            } else {
                setCardData({ ...cardData, [name]: v });
            }
        } else {
            setCardData({ ...cardData, [name]: value });
        }
    };

    return (
        <div className="space-y-8">
            {/* Visual Card */}
            <div className="relative mx-auto h-48 w-80 transform transition-transform hover:scale-105">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-neutral-800 via-neutral-900 to-black p-6 shadow-2xl border border-white/10">
                    <div className="flex justify-between">
                        <div className="text-white/20">
                            <CreditCard className="h-8 w-8" />
                        </div>
                        <div className="text-xs font-bold tracking-widest text-white/40">LUX PAY</div>
                    </div>

                    <div className="mt-8">
                        <div className="text-xl font-mono tracking-widest text-white drop-shadow-md">
                            {cardData.number || "**** **** **** ****"}
                        </div>
                    </div>

                    <div className="mt-8 flex justify-between">
                        <div>
                            <p className="text-[9px] uppercase tracking-wider text-white/40">Card Holder</p>
                            <p className="font-medium text-white">{cardData.name || "YOUR NAME"}</p>
                        </div>
                        <div>
                            <p className="text-[9px] uppercase tracking-wider text-white/40">Expires</p>
                            <p className="font-medium text-white">{cardData.expiry || "MM/YY"}</p>
                        </div>
                    </div>
                </div>
                {/* Glow effect */}
                <div className="absolute -inset-1 -z-10 rounded-2xl bg-yellow-500/20 blur-xl"></div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-xs uppercase tracking-wider text-neutral-500">Card Number</label>
                    <input
                        name="number"
                        placeholder="0000 0000 0000 0000"
                        value={cardData.number}
                        onChange={handleChange}
                        className="w-full mt-1.5 rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-2.5 text-sm text-white placeholder-neutral-600 outline-none focus:border-yellow-500/50 focus:bg-neutral-900 font-mono"
                    />
                </div>

                <div>
                    <label className="text-xs uppercase tracking-wider text-neutral-500">Card Holder Name</label>
                    <input
                        name="name"
                        placeholder="Name on card"
                        value={cardData.name}
                        onChange={handleChange}
                        className="w-full mt-1.5 rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-2.5 text-sm text-white placeholder-neutral-600 outline-none focus:border-yellow-500/50 focus:bg-neutral-900"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs uppercase tracking-wider text-neutral-500">Expiry Date</label>
                        <input
                            name="expiry"
                            placeholder="MM/YY"
                            value={cardData.expiry}
                            onChange={handleChange}
                            className="w-full mt-1.5 rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-2.5 text-sm text-white placeholder-neutral-600 outline-none focus:border-yellow-500/50 focus:bg-neutral-900"
                        />
                    </div>
                    <div>
                        <label className="text-xs uppercase tracking-wider text-neutral-500">CVC</label>
                        <div className="relative">
                            <input
                                name="cvc"
                                placeholder="123"
                                value={cardData.cvc}
                                onChange={handleChange}
                                className="w-full mt-1.5 rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-2.5 text-sm text-white placeholder-neutral-600 outline-none focus:border-yellow-500/50 focus:bg-neutral-900"
                            />
                            <Lock className="absolute right-3 top-1/2 mt-0.5 h-3 w-3 -translate-y-1/2 text-neutral-500" />
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={onSubmit}
                disabled={isProcessing}
                className="w-full rounded-full bg-gradient-to-r from-yellow-500 to-yellow-400 py-3 text-sm font-bold text-black shadow-lg shadow-yellow-500/20 transition-all hover:scale-[1.02] hover:shadow-yellow-500/30 disabled:opacity-70 disabled:hover:scale-100"
            >
                {isProcessing ? "Processing Secure Payment..." : `Pay ${currency} ${amount.toLocaleString()}`}
            </button>
        </div>
    );
}
