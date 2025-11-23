"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { Logo } from "@/components/ui/Logo";
import { Camera, ChevronRight, GraduationCap, Building2 } from "lucide-react";

export default function CreateProfilePage() {
    const [avatar, setAvatar] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [username, setUsername] = useState("");
    const [institute, setInstitute] = useState("Loading...");
    const [degree, setDegree] = useState("");
    const [studentId, setStudentId] = useState("");
    const [country, setCountry] = useState("India");
    const [state, setState] = useState("Uttarakhand");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserUniversity = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user?.email) {
                const domain = user.email.split('@')[1];
                const { data: uni } = await supabase
                    .from('universities')
                    .select('name')
                    .eq('domain', domain)
                    .single();

                if (uni) {
                    setInstitute(uni.name);
                } else {
                    setInstitute("Unknown University");
                }
            }
            setLoading(false);
        };
        fetchUserUniversity();
    }, []);

    const handleComplete = async () => {
        setLoading(true);
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error("No user found");

            // Set password if provided
            if (password) {
                const { error: passwordError } = await supabase.auth.updateUser({ password: password });
                if (passwordError) throw passwordError;
            }

            // Upload avatar to Supabase Storage if file is selected
            let avatar_url = null;
            if (avatarFile) {
                const fileExt = avatarFile.name.split('.').pop();
                const fileName = `${user.id}-${Date.now()}.${fileExt}`;
                const filePath = `avatars/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, avatarFile);

                if (uploadError) throw uploadError;

                // Get public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(filePath);

                avatar_url = publicUrl;
            }

            // Get University ID
            let university_id = null;
            if (user.email) {
                const domain = user.email.split('@')[1];
                const { data: uni } = await supabase
                    .from('universities')
                    .select('id')
                    .eq('domain', domain)
                    .single();
                if (uni) university_id = uni.id;
            }

            const updates = {
                id: user.id,
                username,
                degree,
                country,
                state,
                university_id,
                student_id: studentId,
                ...(avatar_url && { avatar_url }),
            };

            const { error } = await supabase.from('profiles').upsert(updates);
            if (error) throw error;

            // Redirect to feed
            window.location.href = "/feed";
        } catch (error: any) {
            console.error("Error saving profile:", error);
            alert(`Failed to save profile: ${error.message || "Unknown error"}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 p-6 flex flex-col">
            <header className="flex justify-center mb-8">
                <Logo />
            </header>

            <main className="flex-1 flex flex-col max-w-md mx-auto w-full">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-heading font-bold mb-2">Setup Profile</h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Let's get you ready for campus life.
                    </p>
                </div>

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

                        <Input
                            label="Student ID"
                            placeholder="e.g. 500089234"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                        />

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Institute</label>
                            <div className="flex items-center gap-3 p-3 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500">
                                <Building2 className="w-5 h-5" />
                                <span className="flex-1">{institute}</span>
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Verified</span>
                            </div>
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

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Set Password</label>
                            <Input
                                type="password"
                                placeholder="Create a secure password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <p className="text-xs text-slate-500">You can use this to login instead of magic links.</p>
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button size="lg" className="w-full gap-2" onClick={handleComplete} isLoading={loading}>
                            Complete Setup
                            <ChevronRight className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
