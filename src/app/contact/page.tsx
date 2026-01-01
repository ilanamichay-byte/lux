import Link from "next/link";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export const metadata = {
    title: "Contact Us | LUX AUCTION",
    description: "Contact LUX AUCTION - The National Jewelry Exchange for support and inquiries",
};

export default function ContactPage() {
    return (
        <div className="mx-auto max-w-4xl px-4 py-12">
            <div className="mb-8">
                <Link
                    href="/"
                    className="text-xs text-neutral-500 hover:text-yellow-400"
                >
                    ← Back to Home
                </Link>
            </div>

            <h1 className="mb-4 text-3xl font-bold text-white">Contact Us</h1>
            <p className="mb-12 text-neutral-400">
                Have questions? We're here to help. Reach out to our team.
            </p>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Contact Info */}
                <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-white">Get in Touch</h2>

                    <div className="space-y-4">
                        <div className="flex items-start gap-4 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-500">
                                <Mail className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">Email</p>
                                <a href="mailto:support@luxauction.com" className="text-sm text-yellow-400 hover:underline">
                                    support@luxauction.com
                                </a>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-500">
                                <Phone className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">Phone</p>
                                <a href="tel:+972-3-000-0000" className="text-sm text-neutral-300">
                                    +972-3-000-0000
                                </a>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-500">
                                <MapPin className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">Address</p>
                                <p className="text-sm text-neutral-300">
                                    Diamond Exchange District<br />
                                    Ramat Gan, Israel
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-500">
                                <Clock className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">Business Hours</p>
                                <p className="text-sm text-neutral-300">
                                    Sunday - Thursday: 9:00 AM - 6:00 PM<br />
                                    Friday: 9:00 AM - 2:00 PM
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
                    <h2 className="mb-6 text-lg font-semibold text-white">Send us a Message</h2>

                    <form className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-neutral-200">
                                Name
                            </label>
                            <input
                                type="text"
                                required
                                className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/40 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-yellow-400"
                                placeholder="Your name"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-neutral-200">
                                Email
                            </label>
                            <input
                                type="email"
                                required
                                className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/40 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-yellow-400"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-neutral-200">
                                Subject
                            </label>
                            <select className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/40 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-yellow-400">
                                <option value="general">General Inquiry</option>
                                <option value="support">Technical Support</option>
                                <option value="seller">Seller Application</option>
                                <option value="dispute">Order Dispute</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-neutral-200">
                                Message
                            </label>
                            <textarea
                                required
                                rows={4}
                                className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/40 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-yellow-400 resize-none"
                                placeholder="How can we help you?"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full rounded-full bg-yellow-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-yellow-400 transition-colors"
                        >
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
