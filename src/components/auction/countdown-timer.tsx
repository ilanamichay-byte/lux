
"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
    endDate: Date;
    className?: string;
}

export function CountdownTimer({ endDate, className }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
        expired: boolean;
    } | null>(null);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = new Date(endDate).getTime() - new Date().getTime();

            if (difference <= 0) {
                return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
            }

            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
                expired: false,
            };
        };

        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [endDate]);

    if (!timeLeft) return <div className="h-8 w-32 animate-pulse rounded bg-neutral-800" />;

    if (timeLeft.expired) {
        return (
            <div className={cn("text-sm font-semibold text-red-500", className)}>
                Auction Ended
            </div>
        );
    }

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <TimeUnit value={timeLeft.days} label="d" />
            <span className="text-neutral-600">:</span>
            <TimeUnit value={timeLeft.hours} label="h" />
            <span className="text-neutral-600">:</span>
            <TimeUnit value={timeLeft.minutes} label="m" />
            <span className="text-neutral-600">:</span>
            <TimeUnit value={timeLeft.seconds} label="s" urgent />
        </div>
    );
}

function TimeUnit({
    value,
    label,
    urgent,
}: {
    value: number;
    label: string;
    urgent?: boolean;
}) {
    return (
        <div className="flex flex-col items-center">
            <span
                className={cn(
                    "font-mono text-xl font-bold leading-none",
                    urgent && value < 10 ? "text-red-500" : "text-white"
                )}
            >
                {value.toString().padStart(2, "0")}
            </span>
            <span className="text-[9px] uppercase text-neutral-500">{label}</span>
        </div>
    );
}
