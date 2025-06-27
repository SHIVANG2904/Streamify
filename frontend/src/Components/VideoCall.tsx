import React, { useRef, useEffect } from "react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  MessageCircle,
  Users,
} from "lucide-react";

interface WebRTCState {
  localStream: MediaStream | null;
  localVideoRef: React.RefObject<HTMLVideoElement>;
  peers: Map<string, any>;
  isConnected: boolean;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  toggleVideo: () => void;
  toggleAudio: () => void;
  leaveCall: () => void;
}

interface VideoCallProps {
  roomId: string;
  userId: string;
  username: string;
  onLeave: () => void;
  onToggleChat: () => void;
  isChatVisible: boolean;
  webRTCState: WebRTCState;
}

export const VideoCall: React.FC<VideoCallProps> = ({
  roomId,
  userId,
  username,
  onLeave,
  onToggleChat,
  isChatVisible,
  webRTCState,
}) => {
  const {
    localVideoRef,
    peers,
    isConnected,
    isVideoEnabled,
    isAudioEnabled,
    toggleVideo,
    toggleAudio,
    leaveCall,
  } = webRTCState;

  const handleLeave = () => {
    leaveCall();
    onLeave();
  };

  const RemoteVideo: React.FC<{ stream: MediaStream; userId: string }> = ({
    stream,
    userId,
  }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
      }
    }, [stream]);

    return (
      <div className="relative bg-gray-900 rounded-lg overflow-hidden shadow-lg">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-sm">
          User {userId.slice(-4)}
        </div>
      </div>
    );
  };

  const peerArray = Array.from(peers.values()).filter((peer) => peer.stream);

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-black bg-opacity-50 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span className="font-medium">Room: {roomId}</span>
          </div>
          <div className="flex items-center space-x-1">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-green-400" : "bg-red-400"
              }`}
            />
            <span className="text-sm">
              {isConnected ? "Connected" : "Connecting..."}
            </span>
          </div>
        </div>
        <div className="text-sm text-gray-300">
          {username} ({peerArray.length + 1} participants)
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4">
        <div
          className={`grid gap-4 h-full ${
            peerArray.length === 0
              ? "grid-cols-1"
              : peerArray.length <= 1
              ? "grid-cols-2"
              : peerArray.length <= 3
              ? "grid-cols-2 grid-rows-2"
              : "grid-cols-3 grid-rows-2"
          }`}
        >
          {/* Local Video */}
          <div className="relative bg-gray-900 rounded-lg overflow-hidden shadow-lg">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${
                !isVideoEnabled ? "hidden" : ""
              }`}
            />
            {!isVideoEnabled && (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <VideoOff className="w-12 h-12 text-gray-400" />
              </div>
            )}
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-sm">
              You ({username})
            </div>
            <div className="absolute top-2 right-2 flex space-x-1">
              {!isVideoEnabled && (
                <div className="bg-red-500 bg-opacity-80 p-1 rounded">
                  <VideoOff className="w-4 h-4 text-white" />
                </div>
              )}
              {!isAudioEnabled && (
                <div className="bg-red-500 bg-opacity-80 p-1 rounded">
                  <MicOff className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Remote Videos */}
          {peerArray.map((peer) => (
            <RemoteVideo key={peer.id} stream={peer.stream!} userId={peer.id} />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-black bg-opacity-50 p-4">
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full transition-all duration-200 ${
              isVideoEnabled
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-red-500 hover:bg-red-600 text-white"
            }`}
          >
            {isVideoEnabled ? (
              <Video className="w-6 h-6" />
            ) : (
              <VideoOff className="w-6 h-6" />
            )}
          </button>

          <button
            onClick={toggleAudio}
            className={`p-3 rounded-full transition-all duration-200 ${
              isAudioEnabled
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-red-500 hover:bg-red-600 text-white"
            }`}
          >
            {isAudioEnabled ? (
              <Mic className="w-6 h-6" />
            ) : (
              <MicOff className="w-6 h-6" />
            )}
          </button>

          <button
            onClick={onToggleChat}
            className={`p-3 rounded-full transition-all duration-200 ${
              isChatVisible
                ? "bg-blue-500 hover:bg-blue-600 text-white"
                : "bg-gray-700 hover:bg-gray-600 text-white"
            }`}
          >
            <MessageCircle className="w-6 h-6" />
          </button>

          <button
            onClick={handleLeave}
            className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all duration-200"
          >
            <Phone className="w-6 h-6 rotate-[135deg]" />
          </button>
        </div>
      </div>
    </div>
  );
};

