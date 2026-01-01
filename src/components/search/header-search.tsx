
"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, FormEvent, useEffect } from "react";
import { cn } from "@/lib/utils";

export function HeaderSearch({ className }: { className?: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get("q") || "");
    const [isFocused, setIsFocused] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    // Sync state with URL
    useEffect(() => {
        setQuery(searchParams.get("q") || "");
    }, [searchParams]);

    // Load recent searches on mount
    useEffect(() => {
        const saved = localStorage.getItem("lux_recent_searches");
        if (saved) {
            setRecentSearches(JSON.parse(saved));
        }
    }, []);

    const handleSearch = (e: FormEvent, term?: string) => {
        e.preventDefault();
        const finalQuery = term || query;
        if (finalQuery.trim()) {
            // Save to recent
            const updated = [finalQuery.trim(), ...recentSearches.filter(s => s !== finalQuery.trim())].slice(0, 5);
            setRecentSearches(updated);
            localStorage.setItem("lux_recent_searches", JSON.stringify(updated));

            router.push(`/search?q=${encodeURIComponent(finalQuery.trim())}`);
            setIsFocused(false);
        }
    };

    return (
        <div className={cn("relative hidden flex-1 max-w-sm md:block", className)}>
            <form
                onSubmit={handleSearch}
                className={cn(
                    "relative transition-all duration-300",
                    isFocused ? "ring-2 ring-yellow-500/20" : ""
                )}
            >
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                    <input
                        type="text"
                        placeholder="Search for diamonds, watches..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        // Delay blur to allow clicking on dropdown
                        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                        className="w-full rounded-full border border-neutral-800 bg-neutral-900/50 py-2 pl-10 pr-4 text-sm text-white placeholder-neutral-500 outline-none transition-colors focus:border-yellow-500/50 focus:bg-neutral-900"
                    />
                </div>
            </form>

            {isFocused && recentSearches.length > 0 && !query && (
                <div className="absolute top-full mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-950 p-2 shadow-xl">
                    <p className="px-2 py-1 text-[10px] uppercase tracking-wider text-neutral-500">Recent</p>
                    {recentSearches.map(term => (
                        <button
                            key={term}
                            onClick={(e) => handleSearch(e, term)}
                            className="block w-full rounded-lg px-2 py-1.5 text-left text-sm text-neutral-300 hover:bg-neutral-900 hover:text-white"
                        >
                            {term}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
