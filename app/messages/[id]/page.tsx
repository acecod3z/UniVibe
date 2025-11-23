"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, MoreVertical, Phone, Video, Paperclip, Smile } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useCall } from "@/context/CallContext";

interface Message {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
}

interface UserProfile {
    id: string;
    full_name: string;
    avatar_url: string;
    is_verified: boolean;
}

export default function ChatPage() {
    const params = useParams();
    const router = useRouter();
    const otherUserId = params.id as string;
    const supabase = createClient();
    const { startCall } = useCall();

    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [currentUser, setCurrentUser] = useState<string | null>(null);
    const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // --- Effects ---

    // 1. Initial Data Fetch
    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setCurrentUser(user.id);

            const { data: profile } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url, is_verified')
                .eq('id', otherUserId)
                .single();
            if (profile) setOtherUser(profile);

            const { data: msgs } = await supabase
                .from('messages')
                .select('*')
                .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
                .order('created_at', { ascending: true });
            if (msgs) setMessages(msgs);

            const channel = supabase
                .channel(`chat:${user.id}:${otherUserId}`)
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` }, (payload) => {
                    if (payload.new.sender_id === otherUserId) {
                        setMessages((prev) => [...prev, payload.new as Message]);
                    }
                })
                .subscribe();

            return () => { supabase.removeChannel(channel); };
        };
        init();
    }, [otherUserId]);

    useEffect(() => { scrollToBottom(); }, [messages]);

    const handleSend = async () => {
        if (!newMessage.trim() || !currentUser) return;
        const text = newMessage;
        setNewMessage("");
        const tempId = Date.now().toString();
        setMessages(prev => [...prev, { id: tempId, content: text, sender_id: currentUser, created_at: new Date().toISOString() }]);
        await supabase.from('messages').insert({ sender_id: currentUser, receiver_id: otherUserId, content: text });
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!otherUser) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-950 text-slate-500">
                <div className="animate-pulse">Loading conversation...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 relative overflow-hidden">

            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px]" />
            </div>

            {/* Header */}
            <header className="flex items-center gap-3 p-4 bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
                <Link href="/messages" className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-200">
                    <ArrowLeft className="w-5 h-5" />
                </Link>

                <div className="flex items-center gap-3 flex-1">
                    <div className="relative">
                        <Avatar src={otherUser.avatar_url} fallback={otherUser.full_name?.[0]} size="sm" />
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight flex items-center gap-1">
                            {otherUser.full_name}
                            {otherUser.is_verified && (
                                <Badge variant="verified" className="h-4 w-4 p-0 rounded-full flex items-center justify-center" />
                            )}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Online</p>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => startCall(otherUserId, 'audio')}
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-violet-600"
                    >
                        <Phone className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => startCall(otherUserId, 'video')}
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-violet-600"
                    >
                        <Video className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-violet-600">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 z-10 scrollbar-hide">
                <AnimatePresence initial={false}>
                    {messages.map((msg, index) => {
                        const isMe = msg.sender_id === currentUser;

                        return (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.2 }}
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[75%] px-5 py-3 shadow-lg backdrop-blur-sm ${isMe
                                        ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-2xl rounded-tr-sm'
                                        : 'bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl rounded-tl-sm'
                                        }`}
                                >
                                    <p className="text-[15px] leading-relaxed">{msg.content}</p>
                                    <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-white/60' : 'text-slate-400'}`}>
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 z-20">
                <div className="flex items-end gap-2 max-w-3xl mx-auto bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-[2rem] p-2 pl-4 shadow-2xl">
                    <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                        <Paperclip className="w-5 h-5" />
                    </button>

                    <div className="flex-1 py-2">
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Type a message..."
                            className="w-full bg-transparent border-none focus:outline-none resize-none max-h-32 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 scrollbar-hide"
                            rows={1}
                            style={{ minHeight: '24px' }}
                        />
                    </div>

                    <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                        <Smile className="w-5 h-5" />
                    </button>

                    <button
                        onClick={handleSend}
                        disabled={!newMessage.trim()}
                        className="p-3 bg-violet-600 text-white rounded-full hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-600/20 active:scale-95"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
