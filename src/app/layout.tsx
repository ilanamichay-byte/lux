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

const inter = Inter({ subsets: ["latin"] });

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

  const displayName =
    (user?.name as string | undefined) ||
    (user?.email as string | undefined) ||
    "Account";

  // אם זה אדמין – נספור כמה בקשות SELLER ממתינות
  let pendingSellerCount: number | null = null;
  if (isAdminRole(role)) {
    pendingSellerCount = await prisma.user.count({
      where: { sellerStatus: "PENDING" },
    });
  }

  const isLoggedIn = !!session?.user;
  const isSeller = isSellerRole(role);
  const isAdmin = isAdminRole(role);

  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-black text-white antialiased`}
      >
        <div className="relative flex min-h-screen flex-col bg-[#030307]">
          {/* רקע עדין */}
          <div className="pointer-events-none fixed inset-0 -z-10">
            <div className="absolute -left-32 top-0 h-64 w-64 rounded-full bg-yellow-500/5 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-blue-500/5 blur-3xl" />
          </div>

          {/* HEADER */}
          <header className="border-b border-neutral-900/80 bg-black/90 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
              {/* Logo + Title */}
              <Link href="/auctions" className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-500/15 shadow-[0_0_25px_rgba(234,179,8,0.25)]">
                  <span className="text-lg text-yellow-400">♦</span>
                </div>
                <div className="leading-tight">
                  <div className="text-sm font-semibold tracking-[0.22em] text-white">
                    <span className="mr-1">LUX</span>
                    <span className="text-yellow-400">AUCTION</span>
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
                    The National Jewelry Exchange
                  </div>
                </div>
              </Link>

              {/* Nav ראשי – אתר כללי */}
              <nav className="flex items-center gap-6 text-xs font-medium tracking-wide">
                <Link
                  href="/auctions"
                  className="text-neutral-300 hover:text-yellow-300"
                >
                  ACTIVE AUCTIONS
                </Link>
                <Link
                  href="/marketplace"
                  className="text-neutral-300 hover:text-yellow-300"
                >
                  MARKETPLACE
                </Link>
                <Link
                  href="/requested-items"
                  className="text-neutral-300 hover:text-yellow-300"
                >
                  REQUESTED ITEMS
                </Link>
                <Link
                  href="/request-item"
                  className="text-neutral-300 hover:text-yellow-300"
                >
                  REQUEST ITEM
                </Link>
                <Link
                  href="/how-it-works"
                  className="text-neutral-300 hover:text-yellow-300"
                >
                  HOW IT WORKS
                </Link>

                {/* Icons placeholders */}
                <button
                  aria-label="Notifications"
                  className="rounded-full bg-neutral-900 px-2 py-1 text-xs text-neutral-300"
                >
                  🔔
                </button>
                <Link
                  href="/cart"
                  aria-label="Cart"
                  className="rounded-full bg-neutral-900 px-3 py-1 text-xs text-neutral-300"
                >
                  🛒
                </Link>

                {/* Auth area */}
                {isLoggedIn ? (
                  <div className="flex items-center gap-2">
                    {/* ACCOUNT – לכל משתמש מחובר */}
                    <Link
                      href="/account"
                      className="rounded-full border border-neutral-700/80 bg-gradient-to-r from-neutral-900/80 to-neutral-950/80 px-3 py-1.5 text-[10px] font-semibold text-neutral-200 hover:border-yellow-400 hover:text-yellow-200"
                    >
                      ACCOUNT
                    </Link>

                    {/* ADMIN – רק למי שהוא אדמין, עם באדג' לפנדינג */}
                    {isAdmin && (
                      <Link
                        href="/admin/users"
                        className="relative rounded-full border border-yellow-500/70 bg-black/80 px-3 py-1.5 text-[10px] font-semibold text-yellow-300 hover:border-yellow-400 hover:text-yellow-200"
                      >
                        ADMIN
                        {pendingSellerCount && pendingSellerCount > 0 && (
                          <span className="ml-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-yellow-500 text-[9px] font-bold text-black px-1">
                            {pendingSellerCount}
                          </span>
                        )}
                      </Link>
                    )}

                    {/* אם עדיין לא מוכר – כפתור Become Seller */}
                    {!isSeller && (
                      <Link
                        href="/become-seller"
                        className="rounded-full border border-yellow-500/60 bg-black/80 px-3 py-1.5 text-[10px] font-semibold text-yellow-300 hover:border-yellow-400 hover:text-yellow-200"
                      >
                        BECOME A SELLER
                      </Link>
                    )}

                    {/* Sign out */}
                    <form
                      action={async () => {
                        "use server";
                        await signOut({ redirectTo: "/" });
                      }}
                    >
                      <button className="rounded-md bg-yellow-500 px-4 py-1.5 text-xs font-semibold text-black hover:bg-yellow-400">
                        {displayName} · SIGN OUT
                      </button>
                    </form>
                  </div>
                ) : (
                  <Link
                    href="/sign-in"
                    className="rounded-md bg-yellow-500 px-4 py-1.5 text-xs font-semibold text-black hover:bg-yellow-400"
                  >
                    SIGN IN
                  </Link>
                )}
              </nav>
            </div>

            {/* Role Bar – משתנה לפי סוג המשתמש */}
            {isLoggedIn && (
              <div className="border-t border-neutral-900/70 bg-gradient-to-r from-neutral-950/95 via-black/95 to-neutral-950/95">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2">
                  {/* צד שמאל – טקסט תפקיד */}
                  <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                    <span className="inline-flex h-6 min-w-[6px] rounded-full bg-yellow-500/70" />
                    <div>
                      <p className="uppercase tracking-[0.18em] text-neutral-400">
                        {isAdmin
                          ? "ADMIN CONSOLE"
                          : isSeller
                          ? "SELLER WORKSPACE"
                          : "BUYER WORKSPACE"}
                      </p>
                      <p className="text-[10px] text-neutral-500">
                        {isAdmin
                          ? "Review sellers, roles and platform health."
                          : isSeller
                          ? "Respond to high-intent buyers and manage your deals."
                          : "Browse, request and close deals on luxury pieces."}
                      </p>
                    </div>
                  </div>

                  {/* צד ימין – ניווט לפי Role */}
                  <div className="flex flex-wrap items-center justify-end gap-2 text-[11px]">
                    {/* Buyer role nav */}
                    {!isSeller && !isAdmin && (
                      <>
                        <Link
                          href="/account"
                          className="rounded-full bg-neutral-900/80 px-3 py-1 text-neutral-200 hover:bg-neutral-800 hover:text-yellow-200"
                        >
                          Buyer dashboard
                        </Link>
                        <Link
                          href="/requested-items"
                          className="rounded-full bg-neutral-900/60 px-3 py-1 text-neutral-300 hover:bg-neutral-800 hover:text-yellow-200"
                        >
                          Open requests
                        </Link>
                        <Link
                          href="/request-item"
                          className="rounded-full bg-yellow-500/90 px-3 py-1 text-black hover:bg-yellow-400"
                        >
                          New request
                        </Link>
                      </>
                    )}

                    {/* Seller role nav */}
                    {isSeller && !isAdmin && (
                      <>
                        <Link
                          href="/account"
                          className="rounded-full bg-neutral-900/80 px-3 py-1 text-neutral-200 hover:bg-neutral-800 hover:text-yellow-200"
                        >
                          Seller dashboard
                        </Link>
                        <Link
                          href="/requested-items"
                          className="rounded-full bg-neutral-900/60 px-3 py-1 text-neutral-300 hover:bg-neutral-800 hover:text-yellow-200"
                        >
                          Respond to buyer requests
                        </Link>
                        <Link
                          href="/seller/list-item"
                          className="rounded-full bg-yellow-500/90 px-3 py-1 text-[11px] font-semibold text-black hover:bg-yellow-400"
                        >
                          List item
                        </Link>
                      </>
                    )}

                    {/* Admin role nav */}
                    {isAdmin && (
                      <>
                        <Link
                          href="/admin/users"
                          className="rounded-full bg-neutral-900/80 px-3 py-1 text-neutral-200 hover:bg-neutral-800 hover:text-yellow-200"
                        >
                          Admin dashboard
                        </Link>
                        <Link
                          href="/admin/users"
                          className="rounded-full bg-neutral-900/60 px-3 py-1 text-neutral-300 hover:bg-neutral-800 hover:text-yellow-200"
                        >
                          Seller approvals
                          {pendingSellerCount && pendingSellerCount > 0 && (
                            <span className="ml-1 inline-flex min-w-[16px] items-center justify-center rounded-full bg-yellow-500 text-[9px] font-bold text-black px-1">
                              {pendingSellerCount}
                            </span>
                          )}
                        </Link>
                        <button
                          type="button"
                          className="cursor-not-allowed rounded-full bg-neutral-900/40 px-3 py-1 text-neutral-500"
                          title="More admin tools coming soon"
                        >
                          Moderation (soon)
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </header>

          {/* MAIN */}
          <main className="flex-1">
            <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
          </main>

          {/* FOOTER */}
          <footer className="border-t border-neutral-900/80 bg-black/95 py-6 text-xs text-neutral-400">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4">
              <span>LUX AUCTION – The National Jewelry Exchange</span>
              <div className="flex gap-4">
                <Link href="/terms" className="hover:text-yellow-300">
                  Terms
                </Link>
                <Link href="/privacy" className="hover:text-yellow-300">
                  Privacy
                </Link>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
