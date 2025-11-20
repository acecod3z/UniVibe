"use client";

import { useState, useEffect } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Zap, X, MessageCircle, Video, Shield, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const INTERESTS = ["Coding", "Gaming", "Music", "Study", "Fitness", "Art", "Travel", "Foodie"];

export default function MatchPage() {
    const [isSearching, setIsSearching] = useState(false);
    const [matchFound, setMatchFound] = useState(false);
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

    const toggleInterest = (interest: string) => {
        if (selectedInterests.includes(interest)) {
            setSelectedInterests(prev => prev.filter(i => i !== interest));
        } else {
            setSelectedInterests(prev => [...prev, interest]);
        }
    };

    const startSearch = () => {
        setIsSearching(true);
        setMatchFound(false);
        // Simulate search
        setTimeout(() => {
            setIsSearching(false);
            setMatchFound(true);
        }, 3000);
    };

    const skipMatch = () => {
        setMatchFound(false);
        startSearch();
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 flex flex-col">
            <div className="p-4 flex items-center justify-between">
                <h1 className="text-2xl font-heading font-bold bg-gradient-to-r from-teal-400 to-violet-500 bg-clip-text text-transparent">
                    Vibe Match
                </h1>
                <Button variant="ghost" size="icon">
                    <Filter className="w-5 h-5" />
                </Button>
            </div>

            <main className="flex-1 flex flex-col px-4 relative overflow-hidden">
                <AnimatePresence mode="wait">
                    {!isSearching && !matchFound && (
                        <motion.div
                            key="setup"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex-1 flex flex-col items-center justify-center space-y-8"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-3xl" />
                                <div className="relative w-32 h-32 bg-gradient-to-br from-teal-400 to-violet-500 rounded-full flex items-center justify-center shadow-xl shadow-violet-500/30">
                                    <Zap className="w-16 h-16 text-white fill-white" />
                                </div>
                            </div>

                            <div className="text-center space-y-2">
                                <h2 className="text-2xl font-bold">Find your Vibe</h2>
                                <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                                    Connect with students who share your interests. Verified only.
                                </p>
                            </div>

                            <div className="flex flex-wrap justify-center gap-2 max-w-xs">
                                {INTERESTS.map((interest) => (
                                    <button
                                        key={interest}
                                        onClick={() => toggleInterest(interest)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedInterests.includes(interest)
                                                ? "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300 ring-2 ring-violet-500"
                                                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-violet-400"
                                            }`}
                                    >
                                        {interest}
                                    </button>
                                ))}
                            </div>

                            <Button size="lg" className="w-full max-w-xs rounded-full h-14 text-lg" onClick={startSearch}>
                                Start Matching
                            </Button>
                        </motion.div>
                    )}

                    {isSearching && (
                        <motion.div
                            key="searching"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex-1 flex flex-col items-center justify-center space-y-8"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-teal-400/20 rounded-full blur-3xl animate-pulse" />
                                <div className="relative w-32 h-32 rounded-full border-4 border-teal-400 border-t-transparent animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Avatar src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop" className="w-24 h-24 opacity-50" />
                                </div>
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-bold animate-pulse">Looking for a match...</h3>
                                <p className="text-slate-500">Scanning campus network</p>
                            </div>
                        </motion.div>
                    )}

                    {matchFound && (
                        <motion.div
                            key="found"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="flex-1 flex flex-col items-center justify-center space-y-6 w-full max-w-sm mx-auto"
                        >
                            <div className="relative w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                                <div className="h-64 bg-slate-200 dark:bg-slate-800 relative">
                                    <img
                                        src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&h=800&fit=crop"
                                        alt="Match"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-20">
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-2xl font-bold text-white">Alex, 20</h2>
                                            <Badge variant="verified" className="bg-blue-500/90 text-white border-none">Verified</Badge>
                                        </div>
                                        <p className="text-slate-200">Computer Science • UCLA</p>
                                    </div>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="secondary">Gaming</Badge>
                                        <Badge variant="secondary">Coding</Badge>
                                        <Badge variant="secondary">Sci-Fi</Badge>
                                    </div>

                                    <p className="text-slate-600 dark:text-slate-300 text-sm">
                                        "Looking for a duo partner in Valorant or someone to study Algos with!"
                                    </p>

                                    <div className="flex gap-3 pt-2">
                                        <Button variant="outline" size="lg" className="flex-1 rounded-xl border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-red-900/50 dark:hover:bg-red-900/20" onClick={skipMatch}>
                                            <X className="w-6 h-6" />
                                        </Button>
                                        <Button size="lg" className="flex-[2] rounded-xl gap-2 bg-teal-500 hover:bg-teal-600 text-white">
                                            <MessageCircle className="w-5 h-5" />
                                            Say Hi
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <Shield className="w-3 h-3" />
                                <span>Protected by UniVibe SafeChat™</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <BottomNav />
        </div>
    );
}
