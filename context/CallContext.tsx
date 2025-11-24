"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase";
import { CallOverlay } from "@/components/CallOverlay";

interface CallContextType {
    startCall: (receiverId: string, type: 'audio' | 'video') => Promise<void>;
    endCall: () => Promise<void>;
    isInCall: boolean;
    switchCamera: () => Promise<void>;
    isFrontCamera: boolean;
}

const CallContext = createContext<CallContextType | null>(null);

export const useCall = () => {
    const context = useContext(CallContext);
    if (!context) throw new Error("useCall must be used within a CallProvider");
    return context;
};

export function CallProvider({ children }: { children: React.ReactNode }) {
    const supabase = createClient();
    const [currentUser, setCurrentUser] = useState<string | null>(null);

    // Call State
    const [callStatus, setCallStatus] = useState<'incoming' | 'outgoing' | 'connected' | 'ended' | null>(null);
    const [callId, setCallId] = useState<string | null>(null);
    const [otherUser, setOtherUser] = useState<{ name: string; avatar: string; id: string } | null>(null);
    const [callType, setCallType] = useState<'audio' | 'video'>('audio');

    // Media State
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeakerOn, setIsSpeakerOn] = useState(false);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isFrontCamera, setIsFrontCamera] = useState(true);

    // Streams (State for UI)
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

    // Refs for WebRTC logic (to avoid stale closures)
    const localStreamRef = useRef<MediaStream | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
    const candidateQueueRef = useRef<RTCIceCandidate[]>([]);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setCurrentUser(user.id);
        };
        getUser();
    }, []);

    // --- WebRTC Helpers ---

    const processCandidateQueue = async () => {
        if (!peerConnectionRef.current || !peerConnectionRef.current.remoteDescription) return;
        while (candidateQueueRef.current.length > 0) {
            const candidate = candidateQueueRef.current.shift();
            if (candidate) {
                try {
                    await peerConnectionRef.current.addIceCandidate(candidate);
                } catch (e) {
                    console.error("Error adding queued candidate:", e);
                }
            }
        }
    };

    const createPeerConnection = (currentCallId: string, userId: string) => {
        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
            ],
        });

        pc.onicecandidate = async (event) => {
            if (event.candidate) {
                await supabase.from('call_candidates').insert({
                    call_id: currentCallId,
                    candidate: event.candidate,
                    sender_id: userId
                });
            }
        };

        pc.oniceconnectionstatechange = () => {
            console.log("ICE Connection State:", pc.iceConnectionState);
        };

        pc.ontrack = (event) => {
            console.log("Global: Received remote track", event.streams[0]?.getTracks());
            if (event.streams[0]) {
                setRemoteStream(event.streams[0]);

                // Audio fallback
                if (remoteAudioRef.current) {
                    remoteAudioRef.current.srcObject = event.streams[0];
                    remoteAudioRef.current.play().catch(e => console.error("Audio play error:", e));
                }
            }
        };

        return pc;
    };

    // --- Actions ---

    const startCall = async (receiverId: string, type: 'audio' | 'video') => {
        if (!currentUser) return;

        // Reset state
        setIsSpeakerOn(false);
        setCallType(type);
        setIsVideoEnabled(type === 'video');
        setIsFrontCamera(true);

        try {
            // Fetch receiver details for UI
            const { data: profile } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', receiverId).single();
            if (profile) {
                setOtherUser({ name: profile.full_name, avatar: profile.avatar_url, id: receiverId });
            }

            // Get Media
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: type === 'video'
            });

            localStreamRef.current = stream;
            setLocalStream(stream);

            // Create Call Record
            const { data: callData, error } = await supabase
                .from('calls')
                .insert({
                    caller_id: currentUser,
                    receiver_id: receiverId,
                    status: 'offering',
                    offer: {},
                    type: type
                })
                .select()
                .single();

            if (error) throw error;
            setCallId(callData.id);
            setCallStatus('outgoing');

            // Init Peer Connection
            const pc = createPeerConnection(callData.id, currentUser);
            peerConnectionRef.current = pc;
            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            await supabase.from('calls').update({ offer: offer }).eq('id', callData.id);

        } catch (err) {
            console.error("Start call error:", err);
            alert("Could not start call.");
            endCall();
        }
    };

    const answerCall = async () => {
        if (!callId || !currentUser) return;
        setIsSpeakerOn(false);
        setIsFrontCamera(true);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: callType === 'video'
            });

            localStreamRef.current = stream;
            setLocalStream(stream);

            const pc = createPeerConnection(callId, currentUser);
            peerConnectionRef.current = pc;
            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            const { data: callData } = await supabase.from('calls').select('offer').eq('id', callId).single();
            if (callData?.offer) {
                await pc.setRemoteDescription(new RTCSessionDescription(callData.offer));
                await processCandidateQueue();

                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                await supabase.from('calls').update({ status: 'answered', answer: answer }).eq('id', callId);
                setCallStatus('connected');
            }
        } catch (err) {
            console.error("Answer call error:", err);
            endCall();
        }
    };

    const endCall = async () => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
        }
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
        }
        if (callId) {
            await supabase.from('calls').update({ status: 'ended' }).eq('id', callId);
        }

        // Reset all state
        setCallStatus(null);
        setCallId(null);
        setOtherUser(null);
        setLocalStream(null);
        setRemoteStream(null);
        localStreamRef.current = null;
        candidateQueueRef.current = [];
        setIsSpeakerOn(false);
        setIsFrontCamera(true);
    };

    // --- Subscriptions ---

    useEffect(() => {
        if (!currentUser) return;

        // Listen for incoming calls
        const incomingSub = supabase
            .channel(`incoming_calls:${currentUser}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'calls', filter: `receiver_id=eq.${currentUser}` }, async (payload) => {
                if (payload.new.status === 'offering') {
                    setCallId(payload.new.id);
                    setCallType(payload.new.type);
                    setCallStatus('incoming');

                    // Fetch caller info
                    const { data: profile } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', payload.new.caller_id).single();
                    if (profile) {
                        setOtherUser({ name: profile.full_name, avatar: profile.avatar_url, id: payload.new.caller_id });
                    }
                }
            })
            .subscribe();

        // Listen for call updates (answer/end)
        const updateSub = supabase
            .channel(`call_updates:${currentUser}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'calls' }, async (payload) => {
                if (payload.new.id !== callId) return;

                if (payload.new.status === 'answered' && payload.new.caller_id === currentUser && peerConnectionRef.current) {
                    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(payload.new.answer));
                    await processCandidateQueue();
                    setCallStatus('connected');
                }

                if (payload.new.status === 'ended') {
                    setCallStatus('ended');
                    setTimeout(() => endCall(), 2000);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(incomingSub);
            supabase.removeChannel(updateSub);
        };
    }, [currentUser, callId]);

    // Listen for ICE candidates
    useEffect(() => {
        if (!currentUser || !callId) return;

        const candidateSub = supabase
            .channel(`candidates:${callId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'call_candidates', filter: `call_id=eq.${callId}` }, async (payload) => {
                if (payload.new.sender_id !== currentUser) {
                    const candidate = new RTCIceCandidate(payload.new.candidate);
                    if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
                        await peerConnectionRef.current.addIceCandidate(candidate);
                    } else {
                        candidateQueueRef.current.push(candidate);
                    }
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(candidateSub); };
    }, [currentUser, callId]);


    // --- Toggles ---

    const toggleMute = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoEnabled(videoTrack.enabled);
            }
        }
    };

    const toggleSpeaker = async () => {
        if (!remoteAudioRef.current) return;
        try {
            // @ts-ignore
            if (typeof remoteAudioRef.current.setSinkId !== 'function') {
                setIsSpeakerOn(!isSpeakerOn);
                return;
            }

            const devices = await navigator.mediaDevices.enumerateDevices();
            const audioOutputs = devices.filter(d => d.kind === 'audiooutput');

            if (isSpeakerOn) {
                await remoteAudioRef.current.setSinkId("");
                setIsSpeakerOn(false);
            } else {
                const speaker = audioOutputs.find(d => d.label.toLowerCase().includes('speaker'));
                if (speaker) await remoteAudioRef.current.setSinkId(speaker.deviceId);
                setIsSpeakerOn(true);
            }
        } catch (e) {
            console.error("Speaker toggle error:", e);
            setIsSpeakerOn(!isSpeakerOn);
        }
    };

    const switchCamera = async () => {
        if (!localStreamRef.current) return;

        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoInputs = devices.filter(d => d.kind === 'videoinput');

            if (videoInputs.length < 2) {
                alert("Only one camera found!");
                return;
            }

            const newFacingMode = isFrontCamera ? 'environment' : 'user';

            const newStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: newFacingMode },
                audio: true
            });

            const newVideoTrack = newStream.getVideoTracks()[0];

            if (peerConnectionRef.current) {
                const sender = peerConnectionRef.current.getSenders().find(s => s.track?.kind === 'video');
                if (sender) {
                    await sender.replaceTrack(newVideoTrack);
                }
            }

            const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
            if (oldVideoTrack) oldVideoTrack.stop();

            localStreamRef.current = newStream;
            setLocalStream(newStream);
            setIsFrontCamera(!isFrontCamera);

        } catch (err) {
            console.error("Error switching camera:", err);
        }
    };

    return (
        <CallContext.Provider value={{ startCall, endCall, isInCall: !!callStatus, switchCamera, isFrontCamera }}>
            {children}

            {/* Hidden Audio for Fallback */}
            <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />

            {/* Global Overlay */}
            {callStatus && otherUser && (
                <CallOverlay
                    status={callStatus}
                    otherUser={otherUser}
                    onAccept={answerCall}
                    onDecline={endCall}
                    onEnd={endCall}
                    isMuted={isMuted}
                    toggleMute={toggleMute}
                    isSpeakerOn={isSpeakerOn}
                    toggleSpeaker={toggleSpeaker}
                    isVideoCall={callType === 'video'}
                    isVideoEnabled={isVideoEnabled}
                    toggleVideo={toggleVideo}
                    localStream={localStream}
                    remoteStream={remoteStream}
                    switchCamera={switchCamera}
                    isFrontCamera={isFrontCamera}
                />
            )}
        </CallContext.Provider>
    );
}
