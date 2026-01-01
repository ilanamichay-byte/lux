
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
            {/* Decorative Diamond */}
            <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-yellow-500/20 bg-yellow-500/5">
                <span className="text-5xl text-yellow-400">♦</span>
            </div>

            <h1 className="bg-gradient-to-br from-white via-white to-neutral-500 bg-clip-text text-6xl font-bold text-transparent">
                404
            </h1>

            <p className="mt-4 text-xl font-medium text-neutral-300">
                This piece couldn't be found
            </p>

            <p className="mt-2 max-w-md text-sm text-neutral-500">
                The page you're looking for may have been moved, sold, or doesn't exist in our collection.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="luxury">
                    <Link href="/">Return Home</Link>
                </Button>
                <Button asChild variant="outline" className="border-neutral-800 text-white hover:bg-neutral-900">
                    <Link href="/auctions">Browse Auctions</Link>
                </Button>
            </div>

            {/* Subtle branding */}
            <p className="mt-16 text-[10px] uppercase tracking-[0.3em] text-neutral-700">
                Lux Auction · The National Jewelry Exchange
            </p>
        </div>
    );
}
