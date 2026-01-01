
"use client";

import { useState, ChangeEvent } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";

export function ImageUploadPreview({ name = "image" }: { name?: string }) {
    const [preview, setPreview] = useState<string | null>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
        }
    };

    const clearImage = () => {
        setPreview(null);
        // Ideally we reset the input, but with standard form submission it's tricky without a ref or controlled state.
        // For MVP, if they clear, they'll just have to select again.
        // A trick is to use a key or ref to reset the input.
    };

    return (
        <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                Item Image
            </label>

            <div className="relative group flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-800 bg-neutral-900/50 hover:border-yellow-500/50 hover:bg-neutral-900 transition-all overflow-hidden">
                {/* Hidden Input */}
                <input
                    name={name}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 z-20 h-full w-full opacity-0 cursor-pointer"
                />

                {preview ? (
                    <div className="relative h-64 w-full bg-black">
                        <img src={preview} alt="Preview" className="h-full w-full object-contain" />
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-2 text-white">
                                <Upload className="h-5 w-5" />
                                <span className="text-sm font-medium">Change Image</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex h-32 flex-col items-center justify-center gap-2 text-neutral-500 group-hover:text-yellow-500 py-8">
                        <ImageIcon className="h-8 w-8" />
                        <span className="text-xs font-medium">Click to upload image</span>
                    </div>
                )}
            </div>
        </div>
    );
}
