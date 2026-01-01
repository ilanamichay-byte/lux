
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { User } from "lucide-react";

async function updateProfileAction(formData: FormData) {
    "use server";

    const session = await auth();
    if (!session?.user) redirect("/sign-in");

    const userId = (session.user as any).id;
    const name = formData.get("name")?.toString().trim();

    if (name) {
        await prisma.user.update({
            where: { id: userId },
            data: { name }
        });
    }

    redirect("/account/settings?success=true");
}

export default async function SettingsPage({
    searchParams
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const sp = await searchParams;
    const success = sp.success === "true";

    const session = await auth();
    if (!session?.user) redirect("/sign-in");

    const user = await prisma.user.findUnique({
        where: { id: (session.user as any).id },
        select: { name: true, email: true, role: true, createdAt: true }
    });

    if (!user) redirect("/sign-in");

    return (
        <div className="mx-auto max-w-2xl space-y-8 py-8">
            <div>
                <h1 className="text-2xl font-bold text-white">Account Settings</h1>
                <p className="text-sm text-neutral-500">Manage your profile and preferences</p>
            </div>

            {success && (
                <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-400">
                    Profile updated successfully!
                </div>
            )}

            {/* Profile Section */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
                <h2 className="mb-6 text-lg font-semibold text-white">Profile</h2>

                <form action={updateProfileAction} className="space-y-6">
                    {/* Avatar */}
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30">
                            <User className="h-8 w-8 text-yellow-500" />
                        </div>
                        <div>
                            <p className="text-sm text-neutral-400">Profile Photo</p>
                            <button type="button" className="mt-1 text-xs text-yellow-500 hover:underline">
                                Change Avatar (Coming Soon)
                            </button>
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-xs font-medium uppercase tracking-wider text-neutral-500 mb-2">
                            Display Name
                        </label>
                        <input
                            name="name"
                            defaultValue={user.name || ""}
                            placeholder="Your name"
                            className="w-full rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none focus:border-yellow-500/50"
                        />
                    </div>

                    {/* Email (Read-only) */}
                    <div>
                        <label className="block text-xs font-medium uppercase tracking-wider text-neutral-500 mb-2">
                            Email Address
                        </label>
                        <input
                            value={user.email}
                            disabled
                            className="w-full rounded-lg border border-neutral-800 bg-neutral-900/30 px-4 py-3 text-sm text-neutral-500 cursor-not-allowed"
                        />
                        <p className="mt-1 text-[10px] text-neutral-600">Email cannot be changed</p>
                    </div>

                    <button
                        type="submit"
                        className="rounded-full bg-yellow-500 px-6 py-2.5 text-sm font-semibold text-black hover:bg-yellow-400"
                    >
                        Save Changes
                    </button>
                </form>
            </div>

            {/* Account Info */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
                <h2 className="mb-4 text-lg font-semibold text-white">Account Information</h2>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-neutral-500">Role</span>
                        <span className="text-white capitalize">{user.role.toLowerCase().replace("_", " ")}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-neutral-500">Member Since</span>
                        <span className="text-white">{user.createdAt.toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
                <h2 className="mb-2 text-lg font-semibold text-red-400">Danger Zone</h2>
                <p className="text-sm text-neutral-500 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                </p>
                <button
                    disabled
                    className="rounded-full border border-red-500/50 px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Delete Account (Contact Support)
                </button>
            </div>
        </div>
    );
}
