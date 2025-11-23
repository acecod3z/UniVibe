"use client";

import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

interface ChatPreview {
    userId: string;
    name: string;
    avatar: string;
    lastMessage: string;
    time: string;
    verified: boolean;
}

export default function MessagesPage() {
    const [chats, setChats] = useState<ChatPreview[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // Fetch messages where user is sender or receiver
                const { data: messages, error } = await supabase
                    .from('messages')
                    .select(`
                        *,
                        sender:profiles!sender_id(id, full_name, avatar_url, is_verified),
                        receiver:profiles!receiver_id(id, full_name, avatar_url, is_verified)
                    `)
                    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                const processedChats = new Map<string, ChatPreview>();

                messages?.forEach((msg: any) => {
                    const otherUser = msg.sender_id === user.id ? msg.receiver : msg.sender;
                    // Skip if we already have this user (since we ordered by time desc, first one is latest)
                    if (!processedChats.has(otherUser.id)) {
                        processedChats.set(otherUser.id, {
                            userId: otherUser.id,
                            name: otherUser.full_name || 'Unknown User',
                            avatar: otherUser.avatar_url || '',
                            verified: otherUser.is_verified,
                            lastMessage: msg.content,
                            time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        });
                    }
                });

                setChats(Array.from(processedChats.values()));
            } catch (error) {
                console.error('Error fetching chats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchChats();
    }, []);

    // Search Logic
    useEffect(() => {
        const searchUsers = async () => {
            if (!searchQuery.trim()) {
                setSearchResults([]);
                setIsSearching(false);
                return;
            }

            setIsSearching(true);
            const { data: { user } } = await supabase.auth.getUser();

            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, username, avatar_url, is_verified')
                .ilike('username', `%${searchQuery}%`)
                .neq('id', user?.id || '')
                .limit(5);

            if (!error && data) {
                setSearchResults(data);
            }
            setIsSearching(false);
        };

        const timeoutId = setTimeout(searchUsers, 500);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            <TopBar />

            <main className="max-w-lg mx-auto">
                <div className="p-4">
                    <h1 className="text-2xl font-bold mb-4">Messages</h1>

                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search users to chat..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                    </div>

                    <div className="space-y-1">
                        {searchQuery ? (
                            // Search Results
                            <>
                                <h3 className="text-xs font-bold text-slate-500 uppercase mb-2 px-2">Search Results</h3>
                                {isSearching ? (
                                    <div className="text-center text-slate-500 py-4">Searching...</div>
                                ) : searchResults.length === 0 ? (
                                    <div className="text-center text-slate-500 py-4">No users found</div>
                                ) : (
                                    searchResults.map((user) => (
                                        <Link href={`/messages/${user.id}`} key={user.id}>
                                            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white dark:hover:bg-slate-900 transition-colors cursor-pointer">
                                                <div className="relative">
                                                    <Avatar src={user.avatar_url} fallback={user.username[0]} size="lg" />
                                                    {user.is_verified && (
                                                        <Badge variant="verified" className="absolute -bottom-1 -right-1 h-4 w-4 p-0 rounded-full flex items-center justify-center border-2 border-slate-50 dark:border-slate-950" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold truncate">{user.full_name || user.username}</h3>
                                                    <p className="text-sm text-slate-500">@{user.username}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </>
                        ) : (
                            // Existing Chats
                            <>
                                {loading ? (
                                    <div className="text-center text-slate-500 py-4">Loading chats...</div>
                                ) : chats.length === 0 ? (
                                    <div className="text-center text-slate-500 py-4">No messages yet</div>
                                ) : (
                                    chats.map((chat) => (
                                        <Link href={`/messages/${chat.userId}`} key={chat.userId}>
                                            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white dark:hover:bg-slate-900 transition-colors cursor-pointer">
                                                <div className="relative">
                                                    <Avatar src={chat.avatar} fallback={chat.name[0]} size="lg" />
                                                    {chat.verified && (
                                                        <Badge variant="verified" className="absolute -bottom-1 -right-1 h-4 w-4 p-0 rounded-full flex items-center justify-center border-2 border-slate-50 dark:border-slate-950" />
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-0.5">
                                                        <h3 className="font-bold truncate">{chat.name}</h3>
                                                        <span className="text-xs text-slate-500">{chat.time}</span>
                                                    </div>
                                                    <p className="text-sm truncate text-slate-500">
                                                        {chat.lastMessage}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>

            <BottomNav />
        </div>
    );
}
