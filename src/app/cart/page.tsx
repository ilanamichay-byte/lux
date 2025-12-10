export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Your Cart</h1>
      <p className="mt-2 text-sm text-neutral-300">
        Your cart is empty.
      </p>
      <a
        href="/marketplace"
        className="mt-4 inline-block text-sm font-medium text-yellow-400 hover:text-yellow-300"
      >
        Browse Marketplace
      </a>
    </div>
  );
}
