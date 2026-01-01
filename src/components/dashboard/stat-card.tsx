
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    trendUp?: boolean;
    className?: string;
}

export function StatCard({ title, value, icon: Icon, trend, trendUp, className }: StatCardProps) {
    return (
        <div className={cn("rounded-xl border border-neutral-800 bg-neutral-950/50 p-6 backdrop-blur-sm", className)}>
            <div className="flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">{title}</p>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-neutral-400">
                    <Icon className="h-4 w-4" />
                </div>
            </div>
            <div className="mt-4">
                <h3 className="text-2xl font-bold text-white">{value}</h3>
                {trend && (
                    <p className={cn("mt-1 text-xs font-medium", trendUp ? "text-green-400" : "text-red-400")}>
                        {trendUp ? "↑" : "↓"} {trend}
                    </p>
                )}
            </div>
        </div>
    );
}
