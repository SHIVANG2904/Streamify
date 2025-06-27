import { useRef } from "react";

export const usePeerConnection = (socket, roomId) => {
  const peerRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const servers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      {
        urls: "turn:relay.metered.ca:80",
        username: "openai",
        credential: "openai123",
      },
    ],
  };

  const createPeer = () => {
    // Cleanup old peer if exists
    if (peerRef.current) {
      console.log("🧹 Closing old peer connection...");
      peerRef.current.close();
    }

    console.log("🧠 Creating new RTCPeerConnection...");
    peerRef.current = new RTCPeerConnection(servers);

    peerRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("📨 Sending ICE candidate...");
        socket.emit("ice-candidate", { candidate: event.candidate, roomId });
      }
    };

    peerRef.current.oniceconnectionstatechange = () => {
      console.log(
        "❄️ ICE Connection State:",
        peerRef.current.iceConnectionState
      );
    };

    peerRef.current.ontrack = (event) => {
      console.log("📺 Received remote stream:", event.streams);
      if (remoteVideoRef.current && event.streams.length > 0) {
        if (remoteVideoRef.current.srcObject !== event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      }
    };
  };

  const startLocalStream = async () => {
    try {
      console.log("🎥 Requesting user media...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      console.log("✅ Local stream acquired");

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      createPeer();

      stream.getTracks().forEach((track) => {
        console.log("➕ Adding track:", track.kind);
        peerRef.current.addTrack(track, stream);
      });
    } catch (error) {
      console.error("🚨 Error accessing local media:", error);
    }
  };

  const createOffer = async () => {
    try {
      console.log("📡 Creating offer...");
      const offer = await peerRef.current.createOffer();
      await peerRef.current.setLocalDescription(offer);
      socket.emit("offer", { offer, roomId });
      console.log("📤 Offer sent");
    } catch (error) {
      console.error("🚨 Failed to create/send offer:", error);
    }
  };

  const handleOffer = async ({ offer }) => {
    try {
      console.log("📥 Received offer");
      createPeer();

      await peerRef.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      stream.getTracks().forEach((track) => {
        peerRef.current.addTrack(track, stream);
      });

      const answer = await peerRef.current.createAnswer();
      await peerRef.current.setLocalDescription(answer);
      socket.emit("answer", { answer, roomId });
      console.log("📤 Answer sent");
    } catch (error) {
      console.error("🚨 Failed to handle offer:", error);
    }
  };

  const handleAnswer = async ({ answer }) => {
    try {
      console.log("📥 Received answer");
      await peerRef.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    } catch (error) {
      console.error("🚨 Failed to handle answer:", error);
    }
  };

  const handleIceCandidate = async ({ candidate }) => {
    try {
      console.log("📥 Received ICE candidate");
      await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error("🚨 Error adding ICE candidate:", error);
    }
  };

  const replaceTrack = async (newStream) => {
    const newVideoTrack = newStream.getVideoTracks()[0];
    const sender = peerRef.current
      .getSenders()
      .find((s) => s.track && s.track.kind === "video");

    if (sender && newVideoTrack) {
      console.log("🔁 Replacing video track...");
      await sender.replaceTrack(newVideoTrack);
    }
  };

  return {
    createPeer,
    startLocalStream,
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    replaceTrack,
    localVideoRef,
    remoteVideoRef,
  };
};
