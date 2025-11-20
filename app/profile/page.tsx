"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PostCard } from "@/components/PostCard";
import { Settings, Grid, Bookmark, Heart, MapPin, Link as LinkIcon } from "lucide-react";

interface Profile {
    username: string;
    full_name: string;
    avatar_url: string;
    degree: string;
    country: string;
    state: string;
    universities: {
        name: string;
    };
    vibe_score: number;
}

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState<"posts" | "saved" | "likes">("posts");
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select(`
                        username,
                        full_name,
                        avatar_url,
                        degree,
                        country,
                        state,
                        vibe_score,
                        universities (
                            name
                        )
                    `)
                    .eq('id', user.id)
                    .single();

                if (data) {
                    setProfile(data as any);
                }
            }
            setLoading(false);
        };
        fetchProfile();
    }, []);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500">Loading profile...</div>;
    }

    if (!profile) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500">Profile not found</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            <TopBar />

            <main className="max-w-lg mx-auto">
                <div className="bg-white dark:bg-slate-900 pb-4 mb-2">
                    <div className="h-32 bg-gradient-to-r from-teal-400 to-violet-500 relative">
                        <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white hover:bg-white/20">
                            <Settings className="w-6 h-6" />
                        </Button>
                    </div>

                    <div className="px-4 relative">
                        <div className="absolute -top-12 left-4">
                            <Avatar
                                src={profile.avatar_url || undefined}
                                size="xl"
                                className="w-24 h-24 border-4 border-white dark:border-slate-900"
                            />
                        </div>

                        <div className="pt-14 flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-1 mb-1">
                                    <h1 className="text-2xl font-bold">{profile.full_name || profile.username}</h1>
                                    <Badge variant="verified" className="h-5 w-5 p-0 rounded-full flex items-center justify-center" />
                                </div>
                                <p className="text-slate-500 dark:text-slate-400">@{profile.username} • {profile.universities?.name}</p>
                            </div>
                            <Button className="rounded-full px-6" onClick={() => window.location.href = "/profile/edit"}>Edit Profile</Button>
                        </div>

                        <div className="mt-4 space-y-2">
                            <p className="text-slate-700 dark:text-slate-300">
                                {profile.degree} student.
                            </p>

                            <div className="flex items-center gap-4 text-sm text-slate-500">
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>{profile.state}, {profile.country}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 mt-6 border-t border-slate-100 dark:border-slate-800 pt-4">
                            <div className="text-center ml-auto">
                                <div className="font-bold text-lg text-amber-500">{profile.vibe_score || 0}</div>
                                <div className="text-xs text-slate-500">Vibe Score</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-8 text-center text-slate-500">
                    <p>No posts yet</p>
                </div>
            </main>

            <BottomNav />
        </div>
    );
}
