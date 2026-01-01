import Link from "next/link";

export const metadata = {
    title: "Terms of Service | LUX AUCTION",
    description: "Terms of Service for LUX AUCTION - The National Jewelry Exchange",
};

export default function TermsPage() {
    return (
        <div className="mx-auto max-w-3xl px-4 py-12">
            <div className="mb-8">
                <Link
                    href="/"
                    className="text-xs text-neutral-500 hover:text-yellow-400"
                >
                    ← Back to Home
                </Link>
            </div>

            <h1 className="mb-8 text-3xl font-bold text-white">Terms of Service</h1>

            <div className="prose prose-invert prose-neutral max-w-none">
                <p className="text-neutral-400 leading-relaxed">
                    Last updated: January 1, 2026
                </p>

                <section className="mt-8 space-y-4">
                    <h2 className="text-xl font-semibold text-white">1. Acceptance of Terms</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        By accessing and using LUX AUCTION ("the Platform"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, you must not use our Platform.
                    </p>
                </section>

                <section className="mt-8 space-y-4">
                    <h2 className="text-xl font-semibold text-white">2. Platform Description</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        LUX AUCTION is an online marketplace for luxury jewelry, diamonds, and timepieces. We provide a platform connecting verified sellers with buyers through both auction and direct-purchase mechanisms.
                    </p>
                </section>

                <section className="mt-8 space-y-4">
                    <h2 className="text-xl font-semibold text-white">3. User Accounts</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.
                    </p>
                </section>

                <section className="mt-8 space-y-4">
                    <h2 className="text-xl font-semibold text-white">4. Auction Rules</h2>
                    <ul className="list-disc pl-6 text-neutral-300 space-y-2">
                        <li>All bids are binding and cannot be retracted once placed.</li>
                        <li>The highest bidder at the end of the auction period is obligated to complete the purchase.</li>
                        <li>Anti-sniping protection may extend auctions when bids are placed near closing time.</li>
                        <li>The platform reserves the right to cancel any auction at its discretion.</li>
                    </ul>
                </section>

                <section className="mt-8 space-y-4">
                    <h2 className="text-xl font-semibold text-white">5. Payment & Fees</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        Buyers agree to pay the winning bid amount plus any applicable taxes and shipping costs. Sellers agree to pay platform commission fees as specified in their seller agreement. All payments are processed through our secure payment partners.
                    </p>
                </section>

                <section className="mt-8 space-y-4">
                    <h2 className="text-xl font-semibold text-white">6. Authenticity Guarantee</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        All items on LUX AUCTION are verified for authenticity by our expert gemologists. We stand behind every sale with our authenticity guarantee.
                    </p>
                </section>

                <section className="mt-8 space-y-4">
                    <h2 className="text-xl font-semibold text-white">7. Limitation of Liability</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        LUX AUCTION shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Platform. Our total liability shall not exceed the amount you paid for the specific transaction in question.
                    </p>
                </section>

                <section className="mt-8 space-y-4">
                    <h2 className="text-xl font-semibold text-white">8. Contact</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        For questions about these Terms, please contact us at{" "}
                        <a href="mailto:legal@luxauction.com" className="text-yellow-400 hover:underline">
                            legal@luxauction.com
                        </a>
                    </p>
                </section>
            </div>
        </div>
    );
}
