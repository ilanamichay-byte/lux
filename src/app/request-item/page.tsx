// src/app/request-item/page.tsx
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

async function createRequestAction(formData: FormData) {
  "use server";

  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  const buyerId = (session.user as any).id as string;

  const title = formData.get("title")?.toString().trim() || "";
  const description = formData.get("description")?.toString().trim() || "";
  const category = formData.get("category")?.toString().trim() || "";
  const currency = formData.get("currency")?.toString().trim() || "USD";
  const budgetStr = formData.get("budgetMax")?.toString().trim() || "";

  const budgetMax = budgetStr ? parseInt(budgetStr, 10) : null;

  if (!title) {
    // אפשר להרחיב אחר כך ל־form state; לעכשיו פשוט לא ליצור
    return;
  }

  await prisma.request.create({
    data: {
      title,
      description: description || null,
      category: category || null,
      currency,
      budgetMax: budgetMax ?? undefined,
      buyerId,
    },
  });

  redirect("/requested-items");
}

export default async function RequestItemPage() {
  const session = await auth();

  // לפי האפיון – אורח לא יכול לפתוח בקשות, רק לצפות → נזרוק ל־Sign In
  if (!session?.user) {
    redirect("/sign-in");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-wide">
        Request a specific piece
      </h1>
      <p className="mt-2 text-sm text-neutral-400">
        Tell verified sellers what you&apos;re looking for – style, metal,
        stones, budget. They&apos;ll respond with matching pieces.
      </p>

      <form action={createRequestAction} className="mt-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-neutral-200">
            Title
          </label>
          <input
            name="title"
            required
            className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/40 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-yellow-400"
            placeholder="Vintage diamond engagement ring, art deco style"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-200">
            Description
          </label>
          <textarea
            name="description"
            rows={4}
            className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/40 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-yellow-400"
            placeholder="Share as many details as you can – metal, stone size, brand, certification, etc."
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-neutral-200">
              Max budget
            </label>
            <input
              name="budgetMax"
              type="number"
              min={0}
              className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/40 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-yellow-400"
              placeholder="8000"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-200">
              Currency
            </label>
            <input
              name="currency"
              defaultValue="USD"
              className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/40 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-yellow-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-200">
            Category
          </label>
          <input
            name="category"
            className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/40 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-yellow-400"
            placeholder="Engagement ring, bracelet, watch, etc."
          />
        </div>

        <button className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-yellow-500 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-400">
          Publish request
        </button>
      </form>
    </div>
  );
}
