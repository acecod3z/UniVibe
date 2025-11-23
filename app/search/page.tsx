"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Search, UserPlus, UserCheck } from "lucide-react";
import Link from "next/link";
import { useDebounce } from "@/hooks/use-debounce"; // We might need to create this hook or just use setTimeout

// Simple debounce implementation inside the component for now to avoid extra files if not needed globally yet
function useDebounceValue<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

type Profile = {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
    degree: string | null;
    university_id: string | null;
    verification_status: string;
};

export default function SearchPage() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(false);
    const debouncedQuery = useDebounceValue(query, 500);

    useEffect(() => {
        const searchUsers = async () => {
            if (!debouncedQuery.trim()) {
                setResults([]);
                return;
            }

            setLoading(true);
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            const { data, error } = await supabase
                .from('profiles')
                .select('id, username, full_name, avatar_url, degree, verification_status')
                .ilike('username', `%${debouncedQuery}%`)
                .neq('id', user?.id || '') // Exclude self
                .limit(20);

            if (error) {
                console.error("Error searching users:", error);
            } else {
                setResults(data || []);
            }
            setLoading(false);
        };

        searchUsers();
    }, [debouncedQuery]);

    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 pb-20">
            <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-4">
                <div className="relative max-w-md mx-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search students..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-full py-3 pl-10 pr-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
                        autoFocus
                    />
                </div>
            </header>

            <main className="max-w-md mx-auto p-4 space-y-4">
                {loading && (
                    <div className="text-center py-8 text-slate-500">
                        Searching...
                    </div>
                )}

                {!loading && query && results.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-slate-500">No students found matching "{query}"</p>
                    </div>
                )}

                {!loading && !query && (
                    <div className="text-center py-12">
                        <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500">Search for friends by username</p>
                    </div>
                )}

                <div className="space-y-2">
                    {results.map((profile) => (
                        <Link href={`/profile/${profile.id}`} key={profile.id}>
                            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                                <Avatar src={profile.avatar_url || undefined} fallback={profile.username[0]?.toUpperCase()} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1">
                                        <h3 className="font-bold text-slate-900 dark:text-white truncate">
                                            {profile.full_name || profile.username}
                                        </h3>
                                        {profile.verification_status === 'verified' && (
                                            <Badge variant="verified" size="sm" />
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-500 truncate">@{profile.username}</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-400" />
                            </div>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
}

import { ChevronRight } from "lucide-react";
