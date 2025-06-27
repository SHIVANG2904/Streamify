import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

interface UseWebRTCProps {
  roomId: string;
  userId: string;
  username: string;
  isInCall: boolean;
}

interface ChatMessage {
  message: string;
  userId: string;
  username: string;
  timestamp: string;
}

interface Peer {
  id: string;
  connection: RTCPeerConnection;
  stream?: MediaStream;
}

export const useWebRTC = ({
  roomId,
  userId,
  username,
  isInCall,
}: UseWebRTCProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peers, setPeers] = useState<Map<string, Peer>>(new Map());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  const socketRef = useRef<Socket | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  const iceServers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  // Initialize socket connection only once
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io("http://localhost:3001");
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // Handle call connection/disconnection based on isInCall
  useEffect(() => {
    if (isInCall && roomId && userId && username) {
      // Start the call
      startCall();
    } else if (!isInCall) {
      // Clean up when leaving call
      cleanupCall();
    }

    return () => {
      if (!isInCall) {
        cleanupCall();
      }
    };
  }, [isInCall, roomId, userId, username]);

  const startCall = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Setup socket listeners and join room
      setupSocketListeners();
      if (socketRef.current) {
        socketRef.current.emit("join-room", roomId, userId);
        setIsConnected(true);
      }
    } catch (err) {
      console.error("Error accessing media devices:", err);
    }
  };

  const cleanupCall = () => {
    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }

    // Clear video ref
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    // Close all peer connections
    peers.forEach((peer) => {
      peer.connection.close();
    });
    setPeers(new Map());

    // Leave room
    if (socketRef.current && roomId && userId) {
      socketRef.current.emit("leave-room", roomId, userId);
    }

    // Reset states
    setIsConnected(false);
    setChatMessages([]);
    setIsVideoEnabled(true);
    setIsAudioEnabled(true);

    // Remove socket listeners
    if (socketRef.current) {
      socketRef.current.off("user-connected");
      socketRef.current.off("offer");
      socketRef.current.off("answer");
      socketRef.current.off("ice-candidate");
      socketRef.current.off("user-disconnected");
      socketRef.current.off("chat-message");
    }
  };

  const setupSocketListeners = () => {
    if (!socketRef.current) return;

    const socket = socketRef.current;

    // Handle new user connection
    socket.on("user-connected", (newUserId: string) => {
      console.log("User connected:", newUserId);
      createPeerConnection(newUserId, true);
    });

    // Handle offers
    socket.on(
      "offer",
      async (offer: RTCSessionDescriptionInit, fromUserId: string) => {
        const peer = createPeerConnection(fromUserId, false);
        await peer.connection.setRemoteDescription(offer);
        const answer = await peer.connection.createAnswer();
        await peer.connection.setLocalDescription(answer);
        socket.emit("answer", answer, roomId, userId);
      }
    );

    // Handle answers
    socket.on(
      "answer",
      async (answer: RTCSessionDescriptionInit, fromUserId: string) => {
        const peer = peers.get(fromUserId);
        if (peer) {
          await peer.connection.setRemoteDescription(answer);
        }
      }
    );

    // Handle ICE candidates
    socket.on(
      "ice-candidate",
      async (candidate: RTCIceCandidateInit, fromUserId: string) => {
        const peer = peers.get(fromUserId);
        if (peer) {
          await peer.connection.addIceCandidate(candidate);
        }
      }
    );

    // Handle user disconnection
    socket.on("user-disconnected", (disconnectedUserId: string) => {
      console.log("User disconnected:", disconnectedUserId);
      const peer = peers.get(disconnectedUserId);
      if (peer) {
        peer.connection.close();
        setPeers((prev) => {
          const newPeers = new Map(prev);
          newPeers.delete(disconnectedUserId);
          return newPeers;
        });
      }
    });

    // Handle chat messages
    socket.on("chat-message", (messageData: ChatMessage) => {
      setChatMessages((prev) => [...prev, messageData]);
    });
  };

  const createPeerConnection = (
    remoteUserId: string,
    shouldCreateOffer: boolean
  ): Peer => {
    const connection = new RTCPeerConnection(iceServers);

    // Add local stream to connection
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        connection.addTrack(track, localStream);
      });
    }

    // Handle remote stream
    connection.ontrack = (event) => {
      console.log("Received remote stream from:", remoteUserId);
      setPeers((prev) => {
        const newPeers = new Map(prev);
        const peer = newPeers.get(remoteUserId);
        if (peer) {
          peer.stream = event.streams[0];
        }
        return newPeers;
      });
    };

    // Handle ICE candidates
    connection.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit(
          "ice-candidate",
          event.candidate,
          roomId,
          userId
        );
      }
    };

    const peer: Peer = { id: remoteUserId, connection };

    setPeers((prev) => new Map(prev).set(remoteUserId, peer));

    // Create offer if needed
    if (shouldCreateOffer) {
      connection.createOffer().then((offer) => {
        connection.setLocalDescription(offer);
        if (socketRef.current) {
          socketRef.current.emit("offer", offer, roomId, userId);
        }
      });
    }

    return peer;
  };

  const sendChatMessage = (message: string) => {
    if (socketRef.current && message.trim() && isInCall) {
      const messageData: ChatMessage = {
        message: message.trim(),
        userId,
        username,
        timestamp: new Date().toISOString(),
      };

      setChatMessages((prev) => [...prev, messageData]);
      socketRef.current.emit(
        "chat-message",
        message.trim(),
        roomId,
        userId,
        username
      );
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const leaveCall = () => {
    // This will be handled by the isInCall state change in App component
    cleanupCall();
  };

  return {
    localStream,
    localVideoRef,
    peers,
    chatMessages,
    isConnected,
    isVideoEnabled,
    isAudioEnabled,
    sendChatMessage,
    toggleVideo,
    toggleAudio,
    leaveCall,
  };
};

