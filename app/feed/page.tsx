"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { PostCard } from "@/components/PostCard";
import { ComposerModal } from "@/components/ComposerModal";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

// Mock Data
const MOCK_POSTS = [
    {
        id: 1,
        author: {
            name: "Sarah Jenkins",
            handle: "sarah_j",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
            uni: "Stanford",
            verified: true,
        },
        content: {
            text: "Just finished my final project for CS101! 🚀 It's been a crazy semester but so worth it. Who else is pulling an all-nighter at the library?",
            image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&h=600&fit=crop",
            timestamp: "2h ago",
            likes: 124,
            comments: 18,
        },
    },
    {
        id: 2,
        author: {
            name: "David Chen",
            handle: "dchen_99",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
            uni: "MIT",
            verified: true,
        },
        content: {
            text: "Anyone know if the campus gym is open during the break? Need to burn off some exam stress.",
            timestamp: "4h ago",
            likes: 45,
            comments: 7,
        },
    },
    {
        id: 3,
        author: {
            name: "Campus Events",
            handle: "events_official",
            avatar: "",
            uni: "Universal",
            verified: true,
        },
        content: {
            text: "📢 Don't miss the Spring Mixer this Friday at the Quad! Free food and live music starting at 5PM.",
            image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop",
            timestamp: "5h ago",
            likes: 892,
            comments: 56,
        },
    },
];

export default function FeedPage() {
    const [activeTab, setActiveTab] = useState<"following" | "explore">("following");
    const [isComposerOpen, setIsComposerOpen] = useState(false);
    const [posts, setPosts] = useState(MOCK_POSTS);
    const [isLoading, setIsLoading] = useState(false);

    // Infinite scroll simulation
    const loadMore = () => {
        setIsLoading(true);
        setTimeout(() => {
            setPosts((prev) => [...prev, ...MOCK_POSTS.map(p => ({ ...p, id: Math.random() }))]);
            setIsLoading(false);
        }, 1500);
    };

    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && !isLoading) {
                loadMore();
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isLoading]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            <TopBar />

            <div className="sticky top-14 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <div className="flex">
                    <button
                        onClick={() => setActiveTab("following")}
                        className={`flex-1 py-3 text-sm font-bold transition-colors relative ${activeTab === "following" ? "text-slate-900 dark:text-white" : "text-slate-500"
                            }`}
                    >
                        Following
                        {activeTab === "following" && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("explore")}
                        className={`flex-1 py-3 text-sm font-bold transition-colors relative ${activeTab === "explore" ? "text-slate-900 dark:text-white" : "text-slate-500"
                            }`}
                    >
                        Explore
                        {activeTab === "explore" && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-400" />
                        )}
                    </button>
                </div>
            </div>

            <main className="max-w-lg mx-auto pt-4">
                {posts.map((post) => (
                    <PostCard key={post.id} {...post} />
                ))}

                {isLoading && (
                    <div className="flex justify-center py-4">
                        <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
            </main>

            <div className="fixed bottom-20 right-4 z-30 md:hidden">
                <Button
                    onClick={() => setIsComposerOpen(true)}
                    className="h-14 w-14 rounded-full shadow-lg shadow-violet-500/30 bg-gradient-to-r from-teal-400 to-violet-500 p-0"
                >
                    <Plus className="h-8 w-8 text-white" />
                </Button>
            </div>

            <BottomNav />
            <ComposerModal isOpen={isComposerOpen} onClose={() => setIsComposerOpen(false)} />
        </div>
    );
}
