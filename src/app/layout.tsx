// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  isSellerRole,
  isAdminRole,
  type UserRole,
} from "@/lib/roles";

import { Toaster } from "sonner";
import { Bell, ShoppingCart, User, LogOut } from "lucide-react";
import { HeaderSearch } from "@/components/search/header-search";
import { MobileMenu } from "@/components/layout/mobile-menu";

const inter = Inter({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "LUX AUCTION – The National Jewelry Exchange",
  description:
    "Israel's premier hybrid exchange for diamonds, fine jewelry, and rare timepieces.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user as any | undefined;
  const role = (user?.role as UserRole | undefined) ?? "BUYER";

  const isLoggedIn = !!user;
  const isSeller = isSellerRole(role);
  const isAdmin = isAdminRole(role);
  const isBuyer = role === "BUYER";
  const isVerifiedSeller = role === "SELLER_VERIFIED";

  const displayName =
    (user?.name as string | undefined) ||
    (user?.email as string | undefined) ||
    "Account";

  let pendingSellerCount: number | null = null;
  if (isAdmin) {
    pendingSellerCount = await prisma.user.count({
      where: { sellerStatus: "PENDING" },
    });
  }

  let unreadNotificationsCount = 0;

  if (isLoggedIn && prisma.notification) {
    try {
      unreadNotificationsCount = await prisma.notification.count({
        where: {
          userId: user.id,
          read: false
        }
      });
    } catch (e) {
      console.error("Failed to fetch notifications count:", e);
    }
  }

  const showCartIcon = isBuyer || isAdmin;

  return (
    <html lang="en">
      <body className={`${inter.className} ${inter.variable} bg-background text-foreground antialiased`}>
        <div className="relative flex min-h-screen flex-col bg-background">
          <Toaster position="bottom-right" theme="dark" />
          {/* Background Ambient */}
          <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
            <div className="absolute -left-32 top-0 h-64 w-64 rounded-full bg-primary/5 blur-3xl opacity-50" />
            <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-blue-500/5 blur-3xl opacity-30" />
          </div>

          {/* HEADER */}
          <header className="sticky top-0 z-50 border-b border-neutral-900/80 bg-black/90 backdrop-blur-md">
            <div className="mx-auto flex h-20 max-w-7xl items-center gap-6 px-4 lg:px-8">
              {/* לוגו */}
              <div className="flex min-w-[220px] flex-shrink-0 items-center gap-4">
                <Link href="/" className="group flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-yellow-500/20 bg-yellow-500/10 shadow-[0_0_15px_rgba(234,179,8,0.15)] transition-all group-hover:bg-yellow-500/20 group-hover:shadow-[0_0_25px_rgba(234,179,8,0.3)]">
                    <span className="text-xl text-yellow-400">♦</span>
                  </div>

                  <div className="flex flex-col">
                    <div className="leading-none text-lg font-bold tracking-[0.25em] text-white">
                      <span>LUX</span>
                      <span className="ml-1 text-yellow-500">AUCTION</span>
                    </div>
                    <div className="mt-1 hidden text-[9px] uppercase tracking-[0.22em] text-neutral-500 md:block">
                      THE NATIONAL JEWELRY EXCHANGE
                    </div>
                  </div>
                </Link>
              </div>

              {/* ניווט אמצעי */}
              <nav className="hidden flex-1 items-center justify-center gap-6 text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-400 lg:flex">
                <Link
                  href="/auctions"
                  className="whitespace-nowrap transition-colors hover:text-white"
                >
                  Active Auctions
                </Link>
                <Link
                  href="/marketplace"
                  className="whitespace-nowrap transition-colors hover:text-white"
                >
                  Marketplace
                </Link>
                <Link
                  href="/requested-items"
                  className="whitespace-nowrap transition-colors hover:text-white"
                >
                  Requested Items
                </Link>
                <Link
                  href="/how-it-works"
                  className="whitespace-nowrap transition-colors hover:text-white"
                >
                  How It Works
                </Link>
              </nav>

              <HeaderSearch className="mr-4" />

              {/* צד ימין */}
              <div className="flex min-w-[220px] flex-shrink-0 items-center justify-end gap-2 md:gap-6">

                {/* Mobile Menu */}
                <MobileMenu isLoggedIn={isLoggedIn} />

                <div className="flex items-center gap-2 border-r border-neutral-800 pr-2 md:pr-6">
                  <Link
                    href="/notifications"
                    className="relative flex h-9 w-9 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-900 hover:text-white"
                  >
                    <Bell className="h-4 w-4" strokeWidth={1.5} />
                    {unreadNotificationsCount > 0 && (
                      <span className="absolute right-0 top-0 flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500"></span>
                      </span>
                    )}
                  </Link>

                  {showCartIcon && (
                    <Link
                      href="/cart"
                      className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-900 hover:text-white"
                    >
                      <ShoppingCart className="h-4 w-4" strokeWidth={1.5} />
                    </Link>
                  )}
                </div>

                {isLoggedIn ? (
                  <div className="flex items-center gap-3">
                    <div className="hidden gap-2 md:flex">
                      {isAdmin && (
                        <Link
                          href="/admin/users"
                          className="rounded-full border border-yellow-500/50 px-3 py-1.5 text-[10px] font-bold tracking-wider text-yellow-500 hover:bg-yellow-500/10"
                        >
                          ADMIN
                          {pendingSellerCount !== null &&
                            pendingSellerCount > 0 && (
                              <span className="ml-2 rounded-sm bg-yellow-500 px-1.5 text-[9px] font-bold text-black">
                                {pendingSellerCount}
                              </span>
                            )}
                        </Link>
                      )}

                      {!isBuyer && !isVerifiedSeller && !isAdmin && (
                        <Link
                          href="/become-verified"
                          className="rounded-full border border-yellow-500/50 px-3 py-1.5 text-[10px] font-bold tracking-wider text-yellow-500 hover:bg-yellow-500/10"
                        >
                          BECOME VERIFIED
                        </Link>
                      )}
                    </div>

                    <Link
                      href="/account"
                      className="flex items-center gap-3 pl-2 transition-opacity hover:opacity-80"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-600 bg-gradient-to-br from-neutral-700 to-neutral-900 text-xs font-bold text-white">
                        <User className="h-4 w-4" strokeWidth={1.5} />
                      </div>
                      <span className="hidden max-w-[100px] truncate text-xs font-medium text-neutral-200 md:block">
                        {displayName}
                      </span>
                    </Link>

                    <form
                      action={async () => {
                        "use server";
                        await signOut({ redirectTo: "/" });
                      }}
                    >
                      <button className="ml-2 hidden text-neutral-500 hover:text-white md:block">
                        <LogOut className="h-4 w-4" strokeWidth={1.5} />
                      </button>
                    </form>
                  </div>
                ) : (
                  <Link
                    href="/sign-in"
                    className="rounded-full bg-yellow-500 px-5 py-2 text-xs font-bold tracking-wide text-black transition-colors hover:bg-yellow-400"
                  >
                    SIGN IN
                  </Link>
                )}
              </div>
            </div>

            {/* ROLE BAR */}
            {isLoggedIn && (
              <div className="border-t border-neutral-800/50 bg-neutral-950/50 backdrop-blur-sm">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 lg:px-8">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
                      {isAdmin
                        ? "Admin Console"
                        : isSeller
                          ? "Seller Workspace"
                          : "Buyer Workspace"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] font-medium text-neutral-400">
                    {isSeller && !isAdmin && (
                      <Link
                        href="/seller/list-item"
                        className="flex items-center gap-1 hover:text-yellow-400"
                      >
                        + List Item
                      </Link>
                    )}
                    <Link
                      href="/account"
                      className="rounded-full bg-neutral-900/80 px-3 py-1 text-[11px] text-neutral-200 hover:bg-neutral-800 hover:text-yellow-200"
                    >
                      Dashboard
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </header>

          {/* MAIN */}
          <main className="flex-1">
            <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
              {children}
            </div>
          </main>

          {/* FOOTER */}
          <footer className="border-t border-neutral-900 bg-black py-12 text-xs text-neutral-500">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 md:flex-row">
              <div className="flex flex-col items-center gap-2 md:items-start">
                <div className="font-bold tracking-widest text-white">
                  LUX AUCTION
                </div>
                <div className="text-[10px] uppercase tracking-wider">
                  The National Jewelry Exchange
                </div>
                <div className="mt-1">By Zvika &amp; Amichay Ilan</div>
              </div>

              <div className="flex gap-6">
                <Link
                  href="/terms"
                  className="transition-colors hover:text-white"
                >
                  Terms of Service
                </Link>
                <Link
                  href="/privacy"
                  className="transition-colors hover:text-white"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/contact"
                  className="transition-colors hover:text-white"
                >
                  Contact Support
                </Link>
              </div>

              <div className="text-neutral-600">
                &copy; {new Date().getFullYear()} Lux Auction. All rights
                reserved.
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
