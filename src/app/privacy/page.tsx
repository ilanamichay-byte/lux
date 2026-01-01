import Link from "next/link";

export const metadata = {
    title: "Privacy Policy | LUX AUCTION",
    description: "Privacy Policy for LUX AUCTION - The National Jewelry Exchange",
};

export default function PrivacyPage() {
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

            <h1 className="mb-8 text-3xl font-bold text-white">Privacy Policy</h1>

            <div className="prose prose-invert prose-neutral max-w-none">
                <p className="text-neutral-400 leading-relaxed">
                    Last updated: January 1, 2026
                </p>

                <section className="mt-8 space-y-4">
                    <h2 className="text-xl font-semibold text-white">1. Information We Collect</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        We collect information you provide directly to us, including:
                    </p>
                    <ul className="list-disc pl-6 text-neutral-300 space-y-2">
                        <li>Account information (name, email, password)</li>
                        <li>Transaction data (bids, purchases, sales)</li>
                        <li>Communication preferences</li>
                        <li>Identity verification documents (for sellers)</li>
                    </ul>
                </section>

                <section className="mt-8 space-y-4">
                    <h2 className="text-xl font-semibold text-white">2. How We Use Your Information</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        We use the information we collect to:
                    </p>
                    <ul className="list-disc pl-6 text-neutral-300 space-y-2">
                        <li>Provide, maintain, and improve our services</li>
                        <li>Process transactions and send related information</li>
                        <li>Send you technical notices, updates, and security alerts</li>
                        <li>Respond to your comments, questions, and requests</li>
                        <li>Detect, investigate, and prevent fraudulent transactions</li>
                    </ul>
                </section>

                <section className="mt-8 space-y-4">
                    <h2 className="text-xl font-semibold text-white">3. Information Sharing</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
                    </p>
                    <ul className="list-disc pl-6 text-neutral-300 space-y-2">
                        <li>With your consent</li>
                        <li>To comply with legal obligations</li>
                        <li>To protect the rights and safety of our users</li>
                        <li>With service providers who assist our operations</li>
                    </ul>
                </section>

                <section className="mt-8 space-y-4">
                    <h2 className="text-xl font-semibold text-white">4. Data Security</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        We implement industry-standard security measures to protect your personal information, including encryption, secure servers, and regular security audits.
                    </p>
                </section>

                <section className="mt-8 space-y-4">
                    <h2 className="text-xl font-semibold text-white">5. Your Rights</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        You have the right to:
                    </p>
                    <ul className="list-disc pl-6 text-neutral-300 space-y-2">
                        <li>Access your personal data</li>
                        <li>Request correction of inaccurate data</li>
                        <li>Request deletion of your data</li>
                        <li>Opt out of marketing communications</li>
                    </ul>
                </section>

                <section className="mt-8 space-y-4">
                    <h2 className="text-xl font-semibold text-white">6. Cookies</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        We use cookies and similar tracking technologies to enhance your experience on our Platform. You can control cookies through your browser settings.
                    </p>
                </section>

                <section className="mt-8 space-y-4">
                    <h2 className="text-xl font-semibold text-white">7. Contact Us</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        For privacy-related inquiries, please contact us at{" "}
                        <a href="mailto:privacy@luxauction.com" className="text-yellow-400 hover:underline">
                            privacy@luxauction.com
                        </a>
                    </p>
                </section>
            </div>
        </div>
    );
}
