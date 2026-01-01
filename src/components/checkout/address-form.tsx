
import { cn } from "@/lib/utils";
import { useState } from "react";

// Simplified Input for now if not exists
function StyledInput({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-neutral-500">{label}</label>
            <input
                className="w-full rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-2.5 text-sm text-white placeholder-neutral-600 outline-none transition-colors focus:border-yellow-500/50 focus:bg-neutral-900"
                {...props}
            />
        </div>
    );
}

interface AddressFormProps {
    onSubmit: (data: any) => void;
    initialData?: any;
    className?: string;
}

export function AddressForm({ onSubmit, initialData, className }: AddressFormProps) {
    const [formData, setFormData] = useState(initialData || {
        fullName: "",
        street: "",
        city: "",
        zip: "",
        country: "Israel"
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
            <div className="space-y-4">
                <StyledInput
                    label="Full Name"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. John Doe"
                    required
                />
                <StyledInput
                    label="Street Address"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    placeholder="e.g. Rothschild Blvd 1"
                    required
                />
                <div className="grid grid-cols-2 gap-4">
                    <StyledInput
                        label="City"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Tel Aviv"
                        required
                    />
                    <StyledInput
                        label="Zip Code"
                        name="zip"
                        value={formData.zip}
                        onChange={handleChange}
                        placeholder="12345"
                        required
                    />
                </div>
                <StyledInput
                    label="Country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    disabled
                />
            </div>

            <button
                type="submit"
                className="w-full rounded-full bg-yellow-500 py-3 text-sm font-bold text-black transition-transform hover:bg-yellow-400 active:scale-95"
            >
                Continue to Payment
            </button>
        </form>
    );
}
