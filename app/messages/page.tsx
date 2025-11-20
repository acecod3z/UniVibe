"use client";

import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Search } from "lucide-react";

const MOCK_CHATS = [
    {
        id: 1,
        user: { name: "Sarah Jenkins", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop", verified: true },
        lastMessage: "See you at the library! 📚",
        time: "2m",
        unread: 2,
    },
    {
        id: 2,
        user: { name: "David Chen", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop", verified: true },
        lastMessage: "Did you get the notes?",
        time: "1h",
        unread: 0,
    },
    {
        id: 3,
        user: { name: "CS Study Group", avatar: "", verified: false, isGroup: true },
        lastMessage: "Alex: Who's bringing pizza? 🍕",
        time: "3h",
        unread: 5,
    },
];

export default function MessagesPage() {
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
                            placeholder="Search messages..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                    </div>

                    <div className="space-y-1">
                        {MOCK_CHATS.map((chat) => (
                            <div key={chat.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white dark:hover:bg-slate-900 transition-colors cursor-pointer">
                                <div className="relative">
                                    <Avatar src={chat.user.avatar} fallback={chat.user.name[0]} size="lg" />
                                    {chat.user.verified && (
                                        <Badge variant="verified" className="absolute -bottom-1 -right-1 h-4 w-4 p-0 rounded-full flex items-center justify-center border-2 border-slate-50 dark:border-slate-950" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <h3 className="font-bold truncate">{chat.user.name}</h3>
                                        <span className="text-xs text-slate-500">{chat.time}</span>
                                    </div>
                                    <p className={`text-sm truncate ${chat.unread > 0 ? "font-bold text-slate-900 dark:text-white" : "text-slate-500"}`}>
                                        {chat.lastMessage}
                                    </p>
                                </div>

                                {chat.unread > 0 && (
                                    <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center text-[10px] font-bold text-white">
                                        {chat.unread}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <BottomNav />
        </div>
    );
}
