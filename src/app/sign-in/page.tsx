// src/app/sign-in/page.tsx
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// 🔐 Server action – Sign In
async function signInAction(formData: FormData) {
  "use server";

  const email = formData.get("email")?.toString().trim().toLowerCase();
  const password = formData.get("password")?.toString() || "";

  if (!email || !password) {
    return;
  }

  await signIn("credentials", {
    redirect: true,
    redirectTo: "/",
    // הקרדנציאלס שיגיעו ל-authorize
    // @ts-expect-error – credentials חופשיים
    email,
    password,
  });
}

// 🆕 Server action – Register (Sign Up)
async function registerAction(formData: FormData) {
  "use server";

  const name = formData.get("name")?.toString().trim() || null;
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const password = formData.get("password")?.toString() || "";

  if (!email || !password) {
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // TODO: להחזיר הודעת שגיאה אמיתית בעתיד
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      role: "BUYER", // ברירת מחדל – לקוח. בהמשך נוסיף מסלול למוכרים.
    },
  });

  // התחברות אוטומטית אחרי רישום
  await signIn("credentials", {
    redirect: true,
    redirectTo: "/",
    // @ts-expect-error – credentials
    email,
    password,
  });
}

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/"); // אם כבר מחובר – אין טעם להראות את הדף הזה
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem-4rem)] max-w-4xl flex-col items-center justify-center px-4 py-12">
      {/* הכותרת הקיימת שלך */}
      <div className="mb-10 text-center">
        <h1 className="text-2xl font-semibold tracking-wide">
          Sign In / Register
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          In the MVP this will be a simple role selector. Later נבנה מערכת
          הרשמה מלאה עם לקוח / מוכר פרטי / מוכר בורסה מאומת.
        </p>
      </div>

      {/* שני כרטיסים – התחברות + הרשמה */}
      <div className="grid w-full gap-6 md:grid-cols-2">
        {/* Sign In */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
          <h2 className="text-sm font-semibold text-white">
            Existing account
          </h2>
          <p className="mt-1 text-xs text-neutral-400">
            Sign in with your Lux Auction email and password.
          </p>

          <form action={signInAction} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-200">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/40 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-yellow-400"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-200">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/40 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-yellow-400"
                placeholder="••••••••"
              />
            </div>

            <button className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-yellow-500 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-400">
              Sign in
            </button>
          </form>
        </div>

        {/* Register */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
          <h2 className="text-sm font-semibold text-white">
            New to Lux Auction?
          </h2>
          <p className="mt-1 text-xs text-neutral-400">
            Create a buyer account. You can upgrade to seller / verified
            exchange seller later.
          </p>

          <form action={registerAction} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-200">
                Name
              </label>
              <input
                name="name"
                className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/40 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-yellow-400"
                placeholder="Full name (optional)"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-200">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/40 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-yellow-400"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-200">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/40 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-yellow-400"
                placeholder="At least 6 characters"
              />
            </div>

            <button className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-yellow-500 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-400">
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
