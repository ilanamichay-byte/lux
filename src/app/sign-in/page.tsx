// src/app/sign-in/page.tsx
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth, signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { checkRateLimit, RATE_LIMITS, getClientIP } from "@/lib/rate-limit";
import Link from "next/link";

// 🔐 Server action – Sign In
async function signInAction(formData: FormData) {
  "use server";

  const headersList = await headers();
  const ip = getClientIP(headersList);

  // Rate limiting check
  const rateLimitResult = checkRateLimit(ip, 'sign-in', RATE_LIMITS.AUTH);
  if (!rateLimitResult.success) {
    const resetInMinutes = Math.ceil((rateLimitResult.resetAt - Date.now()) / 60000);
    redirect(`/sign-in?error=${encodeURIComponent(`Too many login attempts. Please try again in ${resetInMinutes} minutes.`)}`);
  }

  const email = formData.get("email")?.toString().trim().toLowerCase();
  const password = formData.get("password")?.toString() || "";

  if (!email || !password) {
    redirect("/sign-in?error=" + encodeURIComponent("Please enter both email and password."));
  }

  try {
    await signIn("credentials", {
      redirect: true,
      redirectTo: "/",
      email,
      password,
    });
  } catch (error: any) {
    // NextAuth throws NEXT_REDIRECT for successful redirects
    if (error?.digest?.includes('NEXT_REDIRECT')) {
      throw error;
    }
    redirect("/sign-in?error=" + encodeURIComponent("Invalid email or password."));
  }
}

// 🆕 Server action – Register (Sign Up)
async function registerAction(formData: FormData) {
  "use server";

  const headersList = await headers();
  const ip = getClientIP(headersList);

  // Rate limiting check
  const rateLimitResult = checkRateLimit(ip, 'register', RATE_LIMITS.AUTH);
  if (!rateLimitResult.success) {
    const resetInMinutes = Math.ceil((rateLimitResult.resetAt - Date.now()) / 60000);
    redirect(`/sign-in?error=${encodeURIComponent(`Too many registration attempts. Please try again in ${resetInMinutes} minutes.`)}`);
  }

  const name = formData.get("name")?.toString().trim() || null;
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const password = formData.get("password")?.toString() || "";

  if (!email) {
    redirect("/sign-in?error=" + encodeURIComponent("Please enter an email address."));
  }

  if (!password || password.length < 6) {
    redirect("/sign-in?error=" + encodeURIComponent("Password must be at least 6 characters long."));
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    redirect("/sign-in?error=" + encodeURIComponent("An account with this email already exists. Please sign in."));
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      role: "BUYER",
    },
  });

  // Auto sign-in after registration
  try {
    await signIn("credentials", {
      redirect: true,
      redirectTo: "/",
      email,
      password,
    });
  } catch (error: any) {
    if (error?.digest?.includes('NEXT_REDIRECT')) {
      throw error;
    }
    redirect("/sign-in?error=" + encodeURIComponent("Registration successful, but auto sign-in failed. Please sign in manually."));
  }
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session?.user) {
    redirect("/");
  }

  const params = await searchParams;
  const errorMessage = params?.error;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem-4rem)] max-w-4xl flex-col items-center justify-center px-4 py-12">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-2xl font-semibold tracking-wide">
          Welcome to LUX AUCTION
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          Sign in to your account or create a new one to start bidding.
        </p>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-6 w-full max-w-md rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{decodeURIComponent(errorMessage)}</span>
          </div>
        </div>
      )}

      {/* Two cards – Sign In + Register */}
      <div className="grid w-full gap-6 md:grid-cols-2">
        {/* Sign In */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
          <h2 className="text-sm font-semibold text-white">
            Existing account
          </h2>
          <p className="mt-1 text-xs text-neutral-400">
            Sign in with your email and password.
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
                autoComplete="email"
                className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/40 px-3 py-2 text-sm text-neutral-100 outline-none transition-colors focus:border-yellow-400"
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
                autoComplete="current-password"
                className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/40 px-3 py-2 text-sm text-neutral-100 outline-none transition-colors focus:border-yellow-400"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-yellow-500 px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-yellow-400"
            >
              Sign In
            </button>
          </form>
        </div>

        {/* Register */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
          <h2 className="text-sm font-semibold text-white">
            New to LUX AUCTION?
          </h2>
          <p className="mt-1 text-xs text-neutral-400">
            Create a buyer account. You can upgrade to seller later.
          </p>

          <form action={registerAction} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-200">
                Name
              </label>
              <input
                name="name"
                autoComplete="name"
                className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/40 px-3 py-2 text-sm text-neutral-100 outline-none transition-colors focus:border-yellow-400"
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
                autoComplete="email"
                className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/40 px-3 py-2 text-sm text-neutral-100 outline-none transition-colors focus:border-yellow-400"
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
                autoComplete="new-password"
                className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/40 px-3 py-2 text-sm text-neutral-100 outline-none transition-colors focus:border-yellow-400"
                placeholder="At least 6 characters"
              />
            </div>

            <button
              type="submit"
              className="mt-2 inline-flex w-full items-center justify-center rounded-full border border-yellow-500 bg-transparent px-4 py-2.5 text-sm font-semibold text-yellow-500 transition-colors hover:bg-yellow-500/10"
            >
              Create Account
            </button>
          </form>
        </div>
      </div>

      {/* Footer links */}
      <p className="mt-8 text-center text-xs text-neutral-500">
        By signing in, you agree to our{" "}
        <Link href="/terms" className="text-neutral-400 hover:text-white underline-offset-2 hover:underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-neutral-400 hover:text-white underline-offset-2 hover:underline">
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}
