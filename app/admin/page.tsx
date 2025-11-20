"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { CheckCircle2, XCircle, Loader2, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

type VerificationRequest = {
    id: string;
    full_name: string;
    university_id: string; // This will be the UUID in real app, but joining for name
    id_card_url: string;
    created_at: string;
    verification_status: "pending" | "verified" | "rejected";
};

export default function AdminPage() {
    const [requests, setRequests] = useState<VerificationRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        setLoading(true);
        const supabase = createClient();

        // In a real app, we would join with universities table to get names
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('verification_status', 'pending');

        if (data) {
            setRequests(data as any);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleDecision = async (userId: string, status: "verified" | "rejected") => {
        const supabase = createClient();
        const { error } = await supabase
            .from('profiles')
            .update({
                verification_status: status,
                is_verified: status === "verified"
            })
            .eq('id', userId);

        if (!error) {
            // Remove from list
            setRequests(prev => prev.filter(r => r.id !== userId));
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
            <header className="max-w-5xl mx-auto flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Logo withText={true} />
                    <div className="h-6 w-px bg-slate-300 dark:bg-slate-700" />
                    <span className="font-mono text-sm text-slate-500 uppercase tracking-wider">Admin Console</span>
                </div>
                <Button variant="outline" size="sm" onClick={fetchRequests}>
                    Refresh
                </Button>
            </header>

            <main className="max-w-5xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Pending Verifications ({requests.length})</h1>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                    </div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                        <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white">No pending requests</h3>
                        <p className="text-slate-500">All caught up! Great job.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {requests.map((req) => (
                            <motion.div
                                key={req.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-6 items-start"
                            >
                                {/* ID Card Preview */}
                                <div className="w-full md:w-64 aspect-video bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden relative flex-shrink-0">
                                    {req.id_card_url ? (
                                        <img
                                            src={req.id_card_url}
                                            alt="ID Card"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                                            No Image
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                                                {req.full_name || "Unknown User"}
                                            </h3>
                                            <p className="text-slate-500 text-sm font-mono">{req.id}</p>
                                        </div>
                                        <span className="px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase">
                                            Pending
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">University</p>
                                            <p className="font-medium">Stanford University (Mock)</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Submitted</p>
                                            <p className="font-medium">{new Date(req.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <Button
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                            onClick={() => handleDecision(req.id, "verified")}
                                        >
                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                            Approve
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="flex-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-900"
                                            onClick={() => handleDecision(req.id, "rejected")}
                                        >
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Reject
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
