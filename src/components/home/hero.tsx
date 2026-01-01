
"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Hero() {
    return (
        <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[120px]" />
            </div>

            <div className="relative z-10 flex w-full max-w-5xl flex-col items-center px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mb-6 flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 backdrop-blur-md"
                >
                    <span className="flex h-2 w-2 items-center justify-center">
                        <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-primary opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                    </span>
                    <span className="text-xs font-medium tracking-widest text-primary uppercase">
                        The National Jewelry Exchange
                    </span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="bg-gradient-to-br from-white via-white to-neutral-500 bg-clip-text text-5xl font-bold leading-tight tracking-tight text-transparent sm:text-7xl md:text-8xl"
                >
                    Curated Luxury <br />
                    <span className="font-serif italic text-primary">Auctions</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                    className="mt-6 max-w-2xl text-lg text-neutral-400 md:text-xl"
                >
                    Discover Israel&apos;s premier marketplace for rare diamonds, fine jewelry,
                    and exceptional timepieces. Verified authenticity, guaranteed.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                    className="mt-10 flex flex-col gap-4 sm:flex-row"
                >
                    <Button size="lg" variant="luxury" asChild>
                        <Link href="/auctions">
                            Browse Live Auctions
                        </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="border-neutral-800 bg-transparent text-white hover:bg-neutral-900" asChild>
                        <Link href="/sign-in">
                            Start Selling
                        </Link>
                    </Button>
                </motion.div>
            </div>

            {/* Decorative Grid */}
            <div className="absolute inset-0 -z-10 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        </section>
    );
}
