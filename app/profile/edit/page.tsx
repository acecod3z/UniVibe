"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { Camera, ChevronLeft, GraduationCap, Building2 } from "lucide-react";

export default function EditProfilePage() {
    const router = useRouter();
    const [avatar, setAvatar] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [username, setUsername] = useState("");
    const [institute, setInstitute] = useState("");
    const [degree, setDegree] = useState("");
    const [country, setCountry] = useState("India");
    const [state, setState] = useState("Uttarakhand");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select(`
                        username,
                        avatar_url,
                        degree,
                        country,
                        state,
                        universities (name)
                    `)
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    setUsername(profile.username || "");
                    setAvatar(profile.avatar_url || null);
                    setDegree(profile.degree || "");
                    setCountry(profile.country || "India");
                    setState(profile.state || "Uttarakhand");
                    setInstitute((profile.universities as any)?.name || "");
                }
            }
            setLoading(false);
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        setLoading(true);
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error("No user found");

            // Upload new avatar if file is selected
            let avatar_url = null;
            if (avatarFile) {
                const fileExt = avatarFile.name.split('.').pop();
                const fileName = `${user.id}/${Date.now()}.${fileExt}`; // FIXED: Add user.id folder

                console.log("Uploading to path:", fileName);

                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(fileName, avatarFile, {
                        upsert: true // Allow overwriting
                    });

                if (uploadError) {
                    console.error("Upload error:", uploadError);
                    alert(`Avatar upload failed: ${uploadError.message}`);
                    throw uploadError;
                }

                const { data } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(fileName);

                avatar_url = data.publicUrl;
                console.log("Avatar uploaded to:", avatar_url);
            }

            const updates: any = {};

            if (username) updates.username = username;
            if (degree) updates.degree = degree;
            if (country) updates.country = country;
            if (state) updates.state = state;
            if (avatar_url) updates.avatar_url = avatar_url;

            console.log("Attempting to update with:", updates);

            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id);

            if (error) {
                console.error("Supabase error details:", error);
                throw error;
            }

            alert("Profile updated successfully!");
            router.push("/profile");
        } catch (error: any) {
            console.error("Error updating profile:", error);
            alert(`Failed to update profile: ${error.message || "Unknown error"}`);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !username) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 p-6 flex flex-col">
            <header className="flex items-center justify-between mb-8">
                <button onClick={() => router.back()} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold">Edit Profile</h1>
                <div className="w-6" />
            </header>

            <main className="flex-1 flex flex-col max-w-md mx-auto w-full">
                <div className="space-y-8">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center">
                        <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-upload')?.click()}>
                            <Avatar
                                src={avatar || undefined}
                                size="xl"
                                className="w-32 h-32 border-4 border-slate-100 dark:border-slate-800"
                            />
                            <div className="absolute bottom-0 right-0 bg-violet-500 text-white p-2 rounded-full shadow-lg border-2 border-white dark:border-slate-900 transition-transform group-hover:scale-110">
                                <Camera className="w-5 h-5" />
                            </div>
                        </div>
                        <input
                            type="file"
                            id="avatar-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const url = URL.createObjectURL(file);
                                    setAvatar(url);
                                    setAvatarFile(file);
                                }
                            }}
                        />
                        <p className="text-sm text-slate-500 mt-3">Tap to change photo</p>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                        <Input
                            label="Username"
                            placeholder="@username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Institute</label>
                            <div className="flex items-center gap-3 p-3 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500">
                                <Building2 className="w-5 h-5" />
                                <span className="flex-1">{institute}</span>
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Verified</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">Institute cannot be changed</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Country</label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950"
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                >
                                    <option value="India">India</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">State</label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950"
                                    value={state}
                                    onChange={(e) => setState(e.target.value)}
                                >
                                    <option value="Uttarakhand">Uttarakhand</option>
                                    <option value="Delhi">Delhi</option>
                                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Degree / Major</label>
                            <div className="relative">
                                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <select
                                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950"
                                    value={degree}
                                    onChange={(e) => setDegree(e.target.value)}
                                >
                                    <option value="" disabled>Select your major</option>
                                    <optgroup label="Engineering & Technology">
                                        <option value="btech_cse">B.Tech - Computer Science & Engineering</option>
                                        <option value="btech_aiml">B.Tech - AI & Machine Learning</option>
                                        <option value="btech_ece">B.Tech - Electronics & Comm.</option>
                                        <option value="btech_mech">B.Tech - Mechanical Engineering</option>
                                        <option value="btech_civil">B.Tech - Civil Engineering</option>
                                        <option value="bca">BCA - Computer Applications</option>
                                        <option value="mca">MCA - Master of Computer Applications</option>
                                    </optgroup>
                                    <optgroup label="Management & Commerce">
                                        <option value="bba">BBA - Business Administration</option>
                                        <option value="bcom">B.Com (Hons)</option>
                                        <option value="mba">MBA</option>
                                    </optgroup>
                                    <optgroup label="Arts, Design & Law">
                                        <option value="ba_hons">B.A. (Hons)</option>
                                        <option value="bdes">B.Des - Design</option>
                                        <option value="llb">B.A. LL.B / B.B.A. LL.B</option>
                                        <option value="bjmc">BJMC - Journalism & Mass Comm</option>
                                    </optgroup>
                                    <optgroup label="Sciences">
                                        <option value="bsc_hons">B.Sc (Hons)</option>
                                        <option value="bsc_agri">B.Sc - Agriculture / Forestry</option>
                                    </optgroup>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 space-y-2">
                        <Button size="lg" className="w-full" onClick={handleSave} isLoading={loading}>
                            Save Changes
                        </Button>
                        <Button size="lg" variant="ghost" className="w-full" onClick={() => router.back()}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
