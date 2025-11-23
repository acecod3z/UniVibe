"use client";

import { useEffect, useRef } from "react";
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, Video, VideoOff } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { motion, AnimatePresence } from "framer-motion";

interface CallOverlayProps {
    status: 'incoming' | 'outgoing' | 'connected' | 'ended' | null;
    otherUser: {
        name: string;
        avatar: string;
    };
    onAccept: () => void;
    onDecline: () => void;
    onEnd: () => void;
    isMuted: boolean;
    toggleMute: () => void;
    isSpeakerOn: boolean;
    toggleSpeaker: () => void;
    isVideoCall: boolean;
    isVideoEnabled: boolean;
    toggleVideo: () => void;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
}

export function CallOverlay({
    status, otherUser, onAccept, onDecline, onEnd,
    isMuted, toggleMute, isSpeakerOn, toggleSpeaker,
    isVideoCall, isVideoEnabled, toggleVideo, localStream, remoteStream
}: CallOverlayProps) {
    const ringtoneRef = useRef<HTMLAudioElement | null>(null);
    const callerToneRef = useRef<HTMLAudioElement | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        // Initialize audio objects
        ringtoneRef.current = new Audio("/sounds/ringtone.mp3");
        ringtoneRef.current.loop = true;

        callerToneRef.current = new Audio("/sounds/caller-tone.mp3");
        callerToneRef.current.loop = true;

        return () => {
            ringtoneRef.current?.pause();
            callerToneRef.current?.pause();
        };
    }, []);

    useEffect(() => {
        if (status === 'incoming') {
            ringtoneRef.current?.play().catch(e => console.log("Audio play failed:", e));
        } else {
            ringtoneRef.current?.pause();
            if (ringtoneRef.current) ringtoneRef.current.currentTime = 0;
        }

        if (status === 'outgoing') {
            callerToneRef.current?.play().catch(e => console.log("Audio play failed:", e));
        } else {
            callerToneRef.current?.pause();
            if (callerToneRef.current) callerToneRef.current.currentTime = 0;
        }
    }, [status]);

    // Attach streams to video elements
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream, isVideoCall]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream, isVideoCall]);

    if (!status) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                animate={{ opacity: 1, backdropFilter: "blur(10px)" }}
                exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90"
            >
                {/* Video Background (Remote) */}
                {isVideoCall && status === 'connected' && (
                    <div className="absolute inset-0 z-0">
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40" /> {/* Dim overlay for controls */}
                    </div>
                )}

                <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-sm p-6">
                    {/* User Info (Hide if video is active and connected) */}
                    {(!isVideoCall || status !== 'connected') && (
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-violet-500 rounded-full animate-ping opacity-20"></div>
                                <div className="relative z-10 p-1 bg-slate-900 rounded-full border-2 border-violet-500/50">
                                    <Avatar src={otherUser.avatar} fallback={otherUser.name?.[0] || "?"} size="xl" />
                                </div>
                            </div>
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-white">{otherUser.name}</h2>
                                <p className="text-violet-300 animate-pulse">
                                    {status === 'incoming' && (isVideoCall ? "Incoming Video Call..." : "Incoming Voice Call...")}
                                    {status === 'outgoing' && "Calling..."}
                                    {status === 'connected' && "Connected"}
                                    {status === 'ended' && "Call Ended"}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Local Video Preview (PIP) */}
                    {isVideoCall && status === 'connected' && (
                        <div className="absolute top-4 right-4 w-32 h-48 bg-black rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl">
                            <video
                                ref={localVideoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover mirror"
                            />
                        </div>
                    )}

                    {/* Controls */}
                    <div className="flex items-center gap-6 mt-auto">
                        {status === 'incoming' && (
                            <>
                                <button
                                    onClick={onDecline}
                                    className="p-4 bg-red-500 rounded-full text-white hover:bg-red-600 transition-transform hover:scale-110 shadow-lg shadow-red-500/30"
                                >
                                    <PhoneOff className="w-8 h-8" />
                                </button>
                                <button
                                    onClick={onAccept}
                                    className="p-4 bg-green-500 rounded-full text-white hover:bg-green-600 transition-transform hover:scale-110 shadow-lg shadow-green-500/30 animate-bounce"
                                >
                                    {isVideoCall ? <Video className="w-8 h-8" /> : <Phone className="w-8 h-8" />}
                                </button>
                            </>
                        )}

                        {(status === 'outgoing' || status === 'connected') && (
                            <>
                                <button
                                    onClick={toggleMute}
                                    className={`p-4 rounded-full transition-all duration-200 ${isMuted
                                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-110'
                                        : 'bg-slate-700/50 text-white hover:bg-slate-700'
                                        }`}
                                >
                                    {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                                </button>

                                {isVideoCall && (
                                    <button
                                        onClick={toggleVideo}
                                        className={`p-4 rounded-full transition-all duration-200 ${!isVideoEnabled
                                            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-110'
                                            : 'bg-slate-700/50 text-white hover:bg-slate-700'
                                            }`}
                                    >
                                        {!isVideoEnabled ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                                    </button>
                                )}

                                <button
                                    onClick={toggleSpeaker}
                                    className={`p-4 rounded-full transition-all duration-200 ${isSpeakerOn
                                        ? 'bg-white text-violet-600 shadow-lg shadow-white/20 scale-110'
                                        : 'bg-slate-700/50 text-white hover:bg-slate-700'
                                        }`}
                                >
                                    {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <Phone className="w-6 h-6" />}
                                </button>

                                <button
                                    onClick={onEnd}
                                    className="p-4 bg-red-500 rounded-full text-white hover:bg-red-600 transition-transform hover:scale-110 shadow-lg shadow-red-500/30"
                                >
                                    <PhoneOff className="w-8 h-8" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
