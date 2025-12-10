// src/app/admin/users/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { UserRole, SellerStatus } from "@/lib/roles";

const ROLE_OPTIONS: UserRole[] = [
  "BUYER",
  "SELLER",
  "SELLER_VERIFIED",
  "ADMIN",
];

// Server Action לעדכון role + sellerStatus
async function updateUserRole(formData: FormData) {
  "use server";

  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  const currentUserId = (session.user as any).id as string | undefined;
  if (!currentUserId) {
    redirect("/sign-in");
  }

  // לוודא שזה באמת אדמין ב-DB
  const currentDbUser = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: { role: true },
  });

  if (currentDbUser?.role !== "ADMIN") {
    redirect("/");
  }

  const userId = formData.get("userId")?.toString();
  const role = formData.get("role")?.toString() as UserRole | undefined;

  if (!userId || !role) {
    return;
  }

  // שלא תוריד לעצמך בטעות ADMIN
  if (userId === currentUserId && role !== "ADMIN") {
    return;
  }

  // נעדכן גם את ה-sellerStatus לפי ה-role החדש
  let newSellerStatus: SellerStatus | undefined;

  if (role === "SELLER" || role === "SELLER_VERIFIED") {
    newSellerStatus = "APPROVED";
  } else if (role === "BUYER") {
    newSellerStatus = "NONE";
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      role,
      ...(newSellerStatus
        ? { sellerStatus: newSellerStatus }
        : {}),
    },
  });

  redirect("/admin/users");
}

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  const currentUserId = (session.user as any).id as string | undefined;
  if (!currentUserId) {
    redirect("/sign-in");
  }

  const currentDbUser = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: { role: true, email: true, name: true },
  });

  if (currentDbUser?.role !== "ADMIN") {
    redirect("/");
  }

  const adminDisplayName =
    currentDbUser.name || currentDbUser.email || "Admin";

  // נטען את כל המשתמשים (כולל sellerStatus)
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      sellerStatus: true,
      createdAt: true,
    },
  });

  const pendingUsers = users.filter(
    (u) => u.sellerStatus === "PENDING"
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-6">
      {/* כותרת הדשבורד */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
            Admin
          </p>
          <h1 className="text-xl font-semibold text-white">
            User &amp; role management
          </h1>
          <p className="mt-1 text-xs text-neutral-400">
            Signed in as{" "}
            <span className="font-semibold">{adminDisplayName}</span> · ADMIN
          </p>
        </div>
        <div className="text-right text-[11px] text-neutral-500 space-y-1">
          <p>Total users: {users.length}</p>
          <p>
            Pending seller requests:{" "}
            <span className="font-semibold text-yellow-300">
              {pendingUsers.length}
            </span>
          </p>
        </div>
      </div>

      {/* 🔔 קטע ראשון – בקשות להיות מוכר */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4 md:p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">
            Pending seller requests
          </h2>
          <p className="text-[11px] text-neutral-500">
            Users who clicked &quot;Become a seller&quot; and await approval.
          </p>
        </div>

        {pendingUsers.length === 0 ? (
          <p className="mt-2 text-xs text-neutral-500">
            No pending seller requests at the moment.
          </p>
        ) : (
          <div className="space-y-2">
            {pendingUsers.map((u) => (
              <div
                key={u.id}
                className="rounded-xl border border-neutral-800 bg-black/40 px-4 py-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1 text-[11px]">
                  <p className="text-neutral-100">
                    {u.name || "—"}{" "}
                    <span className="text-neutral-500">({u.email})</span>
                  </p>
                  <p className="text-neutral-400">
                    Current role:{" "}
                    <span className="font-mono">{u.role}</span>
                  </p>
                  <p className="text-neutral-500">
                    Seller status:{" "}
                    <span className="font-mono">{u.sellerStatus}</span>{" "}
                    · Created:{" "}
                    {new Date(u.createdAt).toLocaleDateString("en-GB")}
                  </p>
                </div>

                <form
                  action={updateUserRole}
                  className="mt-2 flex items-center gap-2 md:mt-0"
                >
                  <input type="hidden" name="userId" value={u.id} />
                  <select
                    name="role"
                    defaultValue={u.role}
                    className="rounded-md border border-neutral-700 bg-black/60 px-2 py-1 text-[11px] text-neutral-100 outline-none focus:border-yellow-400"
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <button className="rounded-full bg-yellow-500 px-3 py-1 text-[11px] font-semibold text-black hover:bg-yellow-400">
                    Save
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* קטע שני – כל המשתמשים (כלי ניהול כללי) */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4 md:p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">
            All users
          </h2>
          <p className="text-[11px] text-neutral-500">
            Full list – for rare cases and audits. Day to day, use the
            &quot;Pending&quot; section above.
          </p>
        </div>

        {users.length === 0 ? (
          <p className="text-xs text-neutral-500">No users yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-800 text-[11px] text-neutral-500">
                  <th className="py-2 pr-3 text-left">User</th>
                  <th className="py-2 px-3 text-left">Email</th>
                  <th className="py-2 px-3 text-left">Role</th>
                  <th className="py-2 px-3 text-left">Seller status</th>
                  <th className="py-2 px-3 text-left">Created</th>
                  <th className="py-2 pl-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isCurrentAdmin = u.id === currentUserId;

                  return (
                    <tr
                      key={u.id}
                      className="border-b border-neutral-900/60 hover:bg-black/40"
                    >
                      <td className="py-2 pr-3 align-middle text-[11px] text-neutral-100">
                        {u.name || "—"}
                      </td>
                      <td className="py-2 px-3 align-middle text-[11px] text-neutral-300">
                        {u.email}
                      </td>
                      <td className="py-2 px-3 align-middle text-[11px] font-mono text-neutral-300">
                        {u.role}
                      </td>
                      <td className="py-2 px-3 align-middle text-[11px] font-mono text-neutral-500">
                        {u.sellerStatus}
                      </td>
                      <td className="py-2 px-3 align-middle text-[11px] text-neutral-500">
                        {new Date(u.createdAt).toLocaleDateString("en-GB")}
                      </td>
                      <td className="py-2 pl-3 align-middle text-right">
                        {isCurrentAdmin ? (
                          <span className="text-[10px] text-neutral-500">
                            You (ADMIN)
                          </span>
                        ) : (
                          <form
                            action={updateUserRole}
                            className="flex items-center justify-end gap-2"
                          >
                            <input
                              type="hidden"
                              name="userId"
                              value={u.id}
                            />
                            <select
                              name="role"
                              defaultValue={u.role}
                              className="rounded-md border border-neutral-700 bg-black/60 px-2 py-1 text-[11px] text-neutral-100 outline-none focus:border-yellow-400"
                            >
                              {ROLE_OPTIONS.map((r) => (
                                <option key={r} value={r}>
                                  {r}
                                </option>
                              ))}
                            </select>
                            <button className="rounded-full bg-yellow-500 px-3 py-1 text-[11px] font-semibold text-black hover:bg-yellow-400">
                              Save
                            </button>
                          </form>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
