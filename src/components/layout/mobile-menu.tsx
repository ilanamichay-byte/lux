
"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Gavel, ShoppingBag, Search, HelpCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function MobileMenu({ isLoggedIn }: { isLoggedIn: boolean }) {
    const [isOpen, setIsOpen] = useState(false);

    // Prevent scroll when menu is open
    if (typeof window !== "undefined") {
        if (isOpen) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "unset";
    }

    const links = [
        { href: "/auctions", label: "Active Auctions", icon: Gavel },
        { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
        { href: "/search", label: "Search Items", icon: Search },
        { href: "/how-it-works", label: "How It Works", icon: HelpCircle },
    ];

    return (
        <div className="lg:hidden">
            <button
                onClick={() => setIsOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-900 hover:text-white"
            >
                <Menu className="h-5 w-5" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 right-0 z-[70] w-[280px] border-l border-neutral-800 bg-neutral-950 p-6 shadow-2xl"
                        >
                            <div className="mb-8 flex items-center justify-between">
                                <span className="text-sm font-bold tracking-widest text-white">MENU</span>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="rounded-full bg-neutral-900 p-2 text-neutral-400 hover:text-white"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <nav className="space-y-6">
                                <div className="space-y-2">
                                    {links.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-900 hover:text-yellow-400"
                                        >
                                            <link.icon className="h-4 w-4" />
                                            {link.label}
                                        </Link>
                                    ))}
                                </div>

                                <div className="h-px bg-neutral-800" />

                                <div className="space-y-4">
                                    {!isLoggedIn && (
                                        <div className="grid gap-3">
                                            <Button asChild variant="secondary" className="w-full justify-start gap-3">
                                                <Link href="/sign-in" onClick={() => setIsOpen(false)}>
                                                    Sign In
                                                </Link>
                                            </Button>
                                            <Button asChild className="w-full justify-start gap-3 bg-yellow-500 text-black hover:bg-yellow-400">
                                                <Link href="/sign-up" onClick={() => setIsOpen(false)}>
                                                    Create Account
                                                </Link>
                                            </Button>
                                        </div>
                                    )}

                                    <div className="mt-4 space-y-2">
                                        <Link href="/terms" className="block text-xs text-neutral-500 hover:text-white">Terms of Service</Link>
                                        <Link href="/privacy" className="block text-xs text-neutral-500 hover:text-white">Privacy Policy</Link>
                                    </div>
                                </div>
                            </nav>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
