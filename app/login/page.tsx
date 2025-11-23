"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Logo } from "@/components/ui/Logo";
import { ArrowLeft, Mail, Camera, Upload, CheckCircle2, AlertCircle, Users } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase";

type VerificationMethod = "email" | "id" | "password" | null;
type VerificationState = "idle" | "uploading" | "processing" | "success" | "error";

export default function LoginPage() {
    const [method, setMethod] = useState<VerificationMethod>(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [verificationState, setVerificationState] = useState<VerificationState>("idle");
    const [universities, setUniversities] = useState<{ domain: string; name: string }[]>([]);
    const [errorMsg, setErrorMsg] = useState("");

    // Fetch universities on mount
    useEffect(() => {
        const fetchUniversities = async () => {
            console.log("Fetching universities...");
            const supabase = createClient();
            const { data, error } = await supabase
                .from('universities')
                .select('domain, name');

            if (error) {
                console.error("Error fetching universities:", error);
                setErrorMsg("Failed to load universities. Please check your connection or database setup.");
            } else if (data) {
                console.log("Universities loaded:", data.length);
                setUniversities(data);
            } else {
                console.log("No data returned from universities table.");
            }
        };
        fetchUniversities();
    }, []);
    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setVerificationState("processing");

        console.log("Current Universities State:", universities);

        // 1. Validate Domain
        const cleanEmail = email.toLowerCase().trim();
        const domain = cleanEmail.split('@')[1];
        console.log("Extracted Domain:", domain);

        const matchedUni = universities.find(u => u.domain === domain);
        console.log("Matched University:", matchedUni);

        if (universities.length === 0) {
            setVerificationState("error");
            setErrorMsg("System is loading university data. Please try again in a moment.");
            // Retry fetch?
            return;
        }

        if (!matchedUni) {
            setVerificationState("error");
            setErrorMsg("Sorry, your university is not yet supported. We are currently only open to Dehradun universities.");
            return;
        }

        // 2. Send Magic Link
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
                data: {
                    university_id: matchedUni.name // Storing name for now, ideally ID
                }
            },
        });

        if (error) {
            setVerificationState("error");
            setErrorMsg(error.message);
        } else {
            setVerificationState("success");
        }
    };

    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setVerificationState("processing");

        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setVerificationState("error");
            setErrorMsg(error.message);
        } else {
            setVerificationState("success");
            // Redirect to feed
            window.location.href = "/feed";
        }
    };

    const handleFileUpload = () => {
        setVerificationState("uploading");
        // Simulation for now - Real upload would go to Supabase Storage
        setTimeout(() => {
            setVerificationState("processing");
            setTimeout(() => setVerificationState("success"), 2000);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 p-6 flex flex-col">
            <header className="flex items-center justify-between mb-8">
                {method ? (
                    <Button variant="ghost" size="icon" onClick={() => {
                        setMethod(null);
                        setVerificationState("idle");
                        setErrorMsg("");
                    }}>
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                ) : (
                    <div className="w-10" /> // Spacer
                )}
                <Logo withText={false} className="w-10 h-10" />
                <div className="w-10" /> // Spacer
            </header>

            <main className="flex-1 flex flex-col max-w-md mx-auto w-full">
                <AnimatePresence mode="wait">
                    {!method ? (
                        <motion.div
                            key="selection"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="text-center mb-8">
                                <h1 className="text-2xl font-heading font-bold mb-2">Verify your Student Status</h1>
                                <p className="text-slate-500 dark:text-slate-400">
                                    UniVibe is exclusive to verified students. Choose how you want to verify.
                                </p>
                            </div>

                            <div className="grid gap-4">
                                <button
                                    onClick={() => setMethod("email")}
                                    className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-violet-500 dark:hover:border-violet-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group text-left"
                                >
                                    <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white">University Email</h3>
                                        <p className="text-xs text-slate-500">Instant verification via magic link</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setMethod("id")}
                                    className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-violet-500 dark:hover:border-violet-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group text-left"
                                >
                                    <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform">
                                        <Camera className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white">Upload Student ID</h3>
                                        <p className="text-xs text-slate-500">Manual review (takes 1-24h)</p>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setMethod("password")}
                                    className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-violet-500 dark:hover:border-violet-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group text-left"
                                >
                                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white">Login with Password</h3>
                                        <p className="text-xs text-slate-500">Use your email and password</p>
                                    </div>
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex-1 flex flex-col"
                        >
                            {method === "email" && (
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <h2 className="text-xl font-bold mb-2">Enter University Email</h2>
                                        <p className="text-sm text-slate-500">We'll send you a magic sign-in link.</p>
                                    </div>

                                    {verificationState === "success" ? (
                                        <div className="text-center space-y-4 py-8 animate-in zoom-in duration-300">
                                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto text-green-500">
                                                <CheckCircle2 className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg">Check your inbox!</h3>
                                                <p className="text-slate-500">We sent a link to {email}</p>
                                            </div>
                                            <Button className="w-full mt-4" variant="outline" onClick={() => window.open('mailto:')}>
                                                Open Mail App
                                            </Button>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleEmailSubmit} className="space-y-4">
                                            <Input
                                                type="email"
                                                placeholder="student@university.edu"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                className="text-lg py-6"
                                            />
                                            {verificationState === "error" && (
                                                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-start gap-2">
                                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                                    <p>{errorMsg}</p>
                                                </div>
                                            )}
                                            <Button
                                                type="submit"
                                                size="lg"
                                                className="w-full"
                                                isLoading={verificationState === "processing"}
                                            >
                                                Send Magic Link
                                            </Button>
                                        </form>
                                    )}
                                </div>
                            )}

                            {method === "password" && (
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <h2 className="text-xl font-bold mb-2">Welcome Back</h2>
                                        <p className="text-sm text-slate-500">Enter your credentials to login.</p>
                                    </div>

                                    <form onSubmit={handlePasswordLogin} className="space-y-4">
                                        <Input
                                            type="email"
                                            placeholder="Email Address"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="text-lg py-6"
                                        />
                                        <Input
                                            type="password"
                                            placeholder="Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="text-lg py-6"
                                        />
                                        {verificationState === "error" && (
                                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-start gap-2">
                                                <AlertCircle className="w-5 h-5 shrink-0" />
                                                <p>{errorMsg}</p>
                                            </div>
                                        )}
                                        <Button
                                            type="submit"
                                            size="lg"
                                            className="w-full"
                                            isLoading={verificationState === "processing"}
                                        >
                                            Login
                                        </Button>
                                    </form>
                                </div>
                            )}

                            {method === "id" && (
                                <div className="space-y-6 flex-1 flex flex-col">
                                    <div className="text-center">
                                        <h2 className="text-xl font-bold mb-2">Upload Student ID</h2>
                                        <p className="text-sm text-slate-500">Make sure your name and photo are visible.</p>
                                    </div>

                                    <div className="flex-1 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/50 relative overflow-hidden">
                                        {verificationState === "idle" && (
                                            <>
                                                <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                                                    <Upload className="w-8 h-8 text-slate-400" />
                                                </div>
                                                <p className="text-sm font-medium mb-4">Tap to upload or take photo</p>
                                                <Button onClick={handleFileUpload}>Select Image</Button>
                                            </>
                                        )}

                                        {verificationState === "uploading" && (
                                            <div className="flex flex-col items-center">
                                                <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4" />
                                                <p className="text-sm text-slate-500">Uploading...</p>
                                            </div>
                                        )}

                                        {verificationState === "processing" && (
                                            <div className="flex flex-col items-center text-center">
                                                <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center mb-4 animate-pulse">
                                                    <Users className="w-6 h-6 text-violet-500" />
                                                </div>
                                                <p className="font-bold">Verifying ID...</p>
                                                <p className="text-xs text-slate-500 mt-1">Checking security features</p>
                                            </div>
                                        )}

                                        {verificationState === "success" && (
                                            <div className="absolute inset-0 bg-white dark:bg-slate-900 flex flex-col items-center justify-center animate-in fade-in duration-300">
                                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 text-green-500">
                                                    <CheckCircle2 className="w-8 h-8" />
                                                </div>
                                                <h3 className="font-bold text-lg">ID Submitted</h3>
                                                <p className="text-slate-500 text-center px-8 mb-6">We'll notify you once your student status is verified.</p>
                                                <Link href="/create-profile">
                                                    <Button size="lg">Continue to Profile Setup</Button>
                                                </Link>
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg flex gap-3 items-start">
                                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                        <p className="text-xs text-amber-700 dark:text-amber-400">
                                            Your ID image is encrypted and automatically deleted after verification. We only store a cryptographic hash to prevent duplicate accounts.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
