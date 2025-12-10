
import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/auctions");

  return (
    <div className="bg-gradient-to-b from-black via-neutral-950 to-black">
      <section className="mx-auto max-w-6xl px-4 py-20">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-yellow-400">
          The Art of Luxury Trading
        </p>

        <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight md:text-5xl">
          Israel&apos;s premier hybrid exchange for diamonds, fine jewelry,
          and rare timepieces.
        </h1>

        <p className="mt-4 max-w-xl text-sm text-neutral-300 md:text-base">
          Discover live auctions and curated collections from verified
          exchange members. Bid in real time or buy instantly with
          complete confidence.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href="/auctions"
            className="rounded-md bg-yellow-500 px-6 py-2 text-sm font-semibold text-black hover:bg-yellow-400"
          >
            BROWSE AUCTIONS
          </a>
          <a
            href="/sign-in"
            className="rounded-md border border-neutral-600 px-6 py-2 text-sm font-semibold text-neutral-50 hover:border-yellow-500"
          >
            SELL WITH US
          </a>
        </div>
      </section>
    </div>
  );
}
