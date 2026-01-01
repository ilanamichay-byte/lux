
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
    images?: string[];
    title: string;
}

export function ProductGallery({ images = [], title }: ProductGalleryProps) {
    // Mock multiple images if only one provided, for demo
    const displayImages = images.length > 0 ? images : ["/placeholder.jpg"];

    // In a real app we'd have multiple images. 
    // For this MVP, if we only have one mainImageUrl, we might want to fake thumbnails or just show one.
    // Let's assume we might get an array later.

    const [selectedIndex, setSelectedIndex] = useState(0);

    return (
        <div className="flex flex-col gap-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
                <AnimatePresence mode="wait">
                    <motion.img
                        key={selectedIndex}
                        src={displayImages[selectedIndex]}
                        alt={title}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="h-full w-full object-cover"
                    />
                </AnimatePresence>

                {displayImages.length === 0 && (
                    <div className="flex h-full w-full items-center justify-center text-neutral-700">
                        NO IMAGE AVAILABLE
                    </div>
                )}
            </div>

            {displayImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {displayImages.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedIndex(idx)}
                            className={cn(
                                "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border transition-all",
                                selectedIndex === idx
                                    ? "border-primary ring-2 ring-primary/20"
                                    : "border-neutral-800 opacity-60 hover:opacity-100"
                            )}
                        >
                            <img src={img} alt="" className="h-full w-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
