"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { BottomNav } from "@/components/BottomNav";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft, MapPin, GraduationCap, Building2, Link as LinkIcon, ThumbsUp, ThumbsDown, UserPlus, UserCheck, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

type Profile = {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    website: string | null;
    degree: string | null;
    university_id: string | null;
    country: string | null;
    state: string | null;
    verification_status: string;
    vibe_score: number;
};

export default function PublicProfilePage() {
    const params = useParams();
    const router = useRouter();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);

            if (user?.id === params.id) {
                router.push('/profile');
                return;
            }

            // Fetch Profile
            const { data: profileData, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', params.id)
                .single();

            if (error) {
                console.error("Error fetching profile:", error);
                setLoading(false);
                return;
            }

            setProfile(profileData);

            // Fetch Follow Status
            if (user) {
                const { data: followData } = await supabase
                    .from('follows')
                    .select('*')
                    .eq('follower_id', user.id)
                    .eq('following_id', params.id)
                    .single();
                setIsFollowing(!!followData);

                // Fetch Vote Status
                const { data: voteData } = await supabase
                    .from('vibe_votes')
                    .select('vote_type')
                    .eq('voter_id', user.id)
                    .eq('target_id', params.id)
                    .single();
                if (voteData) setUserVote(voteData.vote_type as 'up' | 'down');
            }

            // Fetch Counts
            const { count: followers } = await supabase
                .from('follows')
                .select('*', { count: 'exact', head: true })
                .eq('following_id', params.id);
            setFollowersCount(followers || 0);

            const { count: following } = await supabase
                .from('follows')
                .select('*', { count: 'exact', head: true })
                .eq('follower_id', params.id);
            setFollowingCount(following || 0);

            setLoading(false);
        };

        if (params.id) {
            fetchData();
        }
    }, [params.id, router]);

    const handleFollow = async () => {
        if (!currentUser) {
            console.error("No current user found");
            alert("You must be logged in to follow.");
            return;
        }
        if (!profile) {
            console.error("No profile found");
            return;
        }
        const supabase = createClient();

        if (isFollowing) {
            const { error } = await supabase
                .from('follows')
                .delete()
                .eq('follower_id', currentUser.id)
                .eq('following_id', profile.id);

            if (error) {
                console.error("Error unfollowing:", error);
                alert(`Error unfollowing: ${error.message}`);
            } else {
                setIsFollowing(false);
                setFollowersCount(prev => prev - 1);
            }
        } else {
            const { error } = await supabase
                .from('follows')
                .insert({ follower_id: currentUser.id, following_id: profile.id });

            if (error) {
                console.error("Error following:", error);
                alert(`Error following: ${error.message}`);
            } else {
                setIsFollowing(true);
                setFollowersCount(prev => prev + 1);
            }
        }
    };

    const handleVote = async (type: 'up' | 'down') => {
        if (!currentUser || !profile) return;
        const supabase = createClient();

        // Optimistic update
        const previousVote = userVote;
        const previousScore = profile.vibe_score;

        let newScore = previousScore;
        if (previousVote === type) {
            // Remove vote
            setUserVote(null);
            newScore = type === 'up' ? newScore - 1 : newScore + 1;
            setProfile({ ...profile, vibe_score: newScore });

            await supabase.from('vibe_votes').delete().eq('voter_id', currentUser.id).eq('target_id', profile.id);
            // Decrement/Increment score in DB (RPC or manual update needed, doing manual for now)
            await supabase.rpc('update_vibe_score', { row_id: profile.id, score_delta: type === 'up' ? -1 : 1 });

        } else {
            // Change or Add vote
            setUserVote(type);
            if (previousVote) {
                // Changing vote (e.g. up to down: -1 -1 = -2)
                newScore = type === 'up' ? newScore + 2 : newScore - 2;
                await supabase.from('vibe_votes').update({ vote_type: type }).eq('voter_id', currentUser.id).eq('target_id', profile.id);
                await supabase.rpc('update_vibe_score', { row_id: profile.id, score_delta: type === 'up' ? 2 : -2 });
            } else {
                // New vote
                newScore = type === 'up' ? newScore + 1 : newScore - 1;
                await supabase.from('vibe_votes').insert({ voter_id: currentUser.id, target_id: profile.id, vote_type: type });
                await supabase.rpc('update_vibe_score', { row_id: profile.id, score_delta: type === 'up' ? 1 : -1 });
            }
            setProfile({ ...profile, vibe_score: newScore });
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!profile) return <div className="min-h-screen flex items-center justify-center">User not found</div>;

    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 pb-20">
            <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-4 flex items-center gap-4">
                <Link href="/search">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                </Link>
                <h1 className="text-lg font-bold truncate">{profile.username}</h1>
            </header>

            <main>
                <div className="relative h-32 bg-gradient-to-r from-violet-500 to-fuchsia-500"></div>
                <div className="px-4 pb-4">
                    <div className="relative -mt-16 mb-4 flex justify-between items-end">
                        <Avatar
                            src={profile.avatar_url || undefined}
                            fallback={profile.username[0]?.toUpperCase()}
                            size="xl"
                            className="w-32 h-32 border-4 border-white dark:border-slate-900"
                        />
                        <div className="flex gap-2 mb-2">
                            {isFollowing && (
                                <Link href={`/messages/${profile.id}`}>
                                    <Button variant="secondary" size="sm" className="gap-2">
                                        <MessageSquare className="w-4 h-4" />
                                        Message
                                    </Button>
                                </Link>
                            )}
                            <Button
                                variant={isFollowing ? "outline" : "primary"}
                                size="sm"
                                onClick={handleFollow}
                                className="gap-2"
                            >
                                {isFollowing ? (
                                    <>
                                        <UserCheck className="w-4 h-4" />
                                        Following
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-4 h-4" />
                                        Follow
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {profile.full_name || profile.username}
                                </h1>
                                {profile.verification_status === 'verified' && <Badge variant="verified" />}
                            </div>
                            <p className="text-slate-500">@{profile.username}</p>
                        </div>

                        {/* Vibe Score */}
                        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                            <div className="flex-1">
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Vibe Score</p>
                                <p className={`text-2xl font-black ${profile.vibe_score >= 0 ? 'text-violet-500' : 'text-red-500'}`}>
                                    {profile.vibe_score > 0 ? '+' : ''}{profile.vibe_score}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleVote('up')}
                                    className={`p-2 rounded-full transition-colors ${userVote === 'up' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400'}`}
                                >
                                    <ThumbsUp className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={() => handleVote('down')}
                                    className={`p-2 rounded-full transition-colors ${userVote === 'down' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400'}`}
                                >
                                    <ThumbsDown className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-6 py-4 border-y border-slate-100 dark:border-slate-800">
                            <div className="text-center">
                                <div className="font-bold text-lg text-slate-900 dark:text-white">{followersCount}</div>
                                <div className="text-xs text-slate-500">Followers</div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-lg text-slate-900 dark:text-white">{followingCount}</div>
                                <div className="text-xs text-slate-500">Following</div>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                            {profile.degree && (
                                <div className="flex items-center gap-2">
                                    <GraduationCap className="w-4 h-4 text-slate-400" />
                                    <span>{profile.degree}</span>
                                </div>
                            )}
                            {profile.university_id && (
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-slate-400" />
                                    <span>University Student</span>
                                </div>
                            )}
                            {(profile.country || profile.state) && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-slate-400" />
                                    <span>{[profile.state, profile.country].filter(Boolean).join(", ")}</span>
                                </div>
                            )}
                            {profile.website && (
                                <div className="flex items-center gap-2">
                                    <LinkIcon className="w-4 h-4 text-slate-400" />
                                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-violet-500 hover:underline">
                                        {profile.website.replace(/^https?:\/\//, '')}
                                    </a>
                                </div>
                            )}
                        </div>

                        {profile.bio && (
                            <div className="pt-2">
                                <p className="leading-relaxed">{profile.bio}</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <BottomNav />
        </div>
    );
}
