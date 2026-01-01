
import Link from "next/link";
import { StatCard } from "./stat-card";
import { Users, FileText, DollarSign, ShieldCheck } from "lucide-react";

interface AdminDashboardProps {
    stats: {
        totalUsers: number;
        totalRequests: number;
        totalDeals: number;
    } | null;
}

export function AdminDashboard({ stats }: AdminDashboardProps) {
    if (!stats) return null;

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={Users}
                    className="border-blue-500/20 bg-blue-500/5"
                />
                <StatCard
                    title="Total Requests"
                    value={stats.totalRequests}
                    icon={FileText}
                />
                <StatCard
                    title="Total Deals"
                    value={stats.totalDeals}
                    icon={DollarSign}
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Link href="/admin/users" className="group rounded-xl border border-neutral-800 bg-neutral-950/50 p-6 transition-colors hover:border-yellow-500/50 hover:bg-neutral-900">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-500 group-hover:bg-yellow-500/20">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Verification Center</h3>
                            <p className="text-xs text-neutral-400">Review seller applications and documents</p>
                        </div>
                    </div>
                </Link>
                <div className="rounded-xl border border-neutral-800 bg-neutral-950/50 p-6 opacity-50">
                    <div>
                        <h3 className="font-semibold text-white">System Logs</h3>
                        <p className="text-xs text-neutral-400">View platform activity (Coming Soon)</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
