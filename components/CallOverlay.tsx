"use client";

import { useEffect, useRef } from "react";
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, Video, VideoOff, RefreshCcw } from "lucide-react";
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
    switchCamera?: () => void;
    isFrontCamera?: boolean;
}

export function CallOverlay({
    status, otherUser, onAccept, onDecline, onEnd,
    isMuted, toggleMute, isSpeakerOn, toggleSpeaker,
    isVideoCall, isVideoEnabled, toggleVideo, localStream, remoteStream,
    switchCamera, isFrontCamera = true
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
            console.log("Attaching local stream:", localStream.getTracks());
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream, isVideoCall, status]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            console.log("Attaching remote stream:", remoteStream.getTracks());
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.play().catch(e => console.error("Error playing remote video:", e));
        }
    }, [remoteStream, isVideoCall, status]);

    if (!status) return null;

    const isVideoConnected = isVideoCall && status === 'connected';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`fixed inset-0 z-50 flex flex-col overflow-hidden ${isVideoConnected ? 'bg-black' : 'bg-slate-900/90'}`}
            >
                {/* Video Background (Remote) - Full Screen */}
                {isVideoConnected && (
                    <div className="absolute inset-0 z-0">
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            muted // Audio handled by ChatPage
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none" />
                    </div>
                )}

                {/* Local Video Preview (PIP) - Draggable */}
                {isVideoConnected && (
                    <motion.div
                        drag
                        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                        dragElastic={0.1}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="absolute top-4 right-4 z-20 w-32 h-48 bg-black rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl cursor-move"
                    >
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className={`w-full h-full object-cover ${isFrontCamera ? 'scale-x-[-1]' : ''}`}
                        />

                        {/* Switch Camera Button (Overlay on PIP) */}
                        {switchCamera && (
                            <button
                                onClick={(e) => { e.stopPropagation(); switchCamera(); }}
                                className="absolute bottom-2 right-2 p-1.5 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
                            >
                                <RefreshCcw className="w-4 h-4" />
                            </button>
                        )}
                    </motion.div>
                )}

                {/* Main Content Container */}
                <div className="relative z-10 flex flex-col items-center justify-between h-full w-full p-6 pb-12">

                    {/* Top Section: User Info (Hide if video connected) */}
                    <div className="mt-12">
                        {(!isVideoConnected) && (
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
                    </div>

                    {/* Bottom Section: Controls */}
                    <div className="flex items-center gap-6 mb-8">
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
                                        : 'bg-slate-700/50 text-white hover:bg-slate-700 backdrop-blur-md'
                                        }`}
                                >
                                    {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                                </button>

                                {isVideoCall && (
                                    <button
                                        onClick={toggleVideo}
                                        className={`p-4 rounded-full transition-all duration-200 ${!isVideoEnabled
                                            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-110'
                                            : 'bg-slate-700/50 text-white hover:bg-slate-700 backdrop-blur-md'
                                            }`}
                                    >
                                        {!isVideoEnabled ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                                    </button>
                                )}

                                <button
                                    onClick={toggleSpeaker}
                                    className={`p-4 rounded-full transition-all duration-200 ${isSpeakerOn
                                        ? 'bg-white text-violet-600 shadow-lg shadow-white/20 scale-110'
                                        : 'bg-slate-700/50 text-white hover:bg-slate-700 backdrop-blur-md'
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
