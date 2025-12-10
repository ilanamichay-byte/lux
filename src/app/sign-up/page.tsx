import { signIn } from "@/auth";

async function signInAction(formData: FormData) {
  "use server";

  const email = formData.get("email")?.toString().trim().toLowerCase();
  const password = formData.get("password")?.toString() || "";

  if (!email || !password) return;

  await signIn("credentials", {
    redirectTo: "/",
    redirect: true,
    // @ts-expect-error – credentials חופשיים
    email,
    password,
  });
}

export default function SignInPage() {
  return (
    <div className="mx-auto mt-10 max-w-md rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
      <h1 className="text-xl font-semibold text-white">Sign in</h1>
      <p className="mt-1 text-sm text-neutral-400">
        Use your Lux Auction email and password.
      </p>

      <form action={signInAction} className="mt-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-neutral-200">
            Email
          </label>
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/40 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-blue-500"
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
            className="mt-1 w-full rounded-lg border border-neutral-700 bg-black/40 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-blue-500"
          />
        </div>

        <button className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-yellow-500 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-400">
          Sign in
        </button>
      </form>
    </div>
  );
}
