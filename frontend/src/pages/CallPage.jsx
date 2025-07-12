import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IconButton, TextField, Button, Badge } from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import CallEndIcon from "@mui/icons-material/CallEnd";
import ChatIcon from "@mui/icons-material/Chat";
import styles from "../styles/videoComponent.module.css";

import { useSocket } from "../hooks/useSocket";
import { usePeerConnection } from "../hooks/usePeerConnection";

export default function CallPage() {
  const { id: roomId } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();

  const {
    startLocalStream,
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    replaceTrack,
    localVideoRef,
    remoteVideoRef,
  } = usePeerConnection(socket, roomId);

  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [screenEnabled, setScreenEnabled] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isChatVisible, setChatVisible] = useState(false);
  const [newMsgCount, setNewMsgCount] = useState(0);
  const [username] = useState("Guest");

  useEffect(() => {
    if (!socket) return;

    startLocalStream().then(() => {
      console.log("📌 Joining room:", roomId);
      socket.emit("join-room", roomId);
      createOffer();
    });

    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidate);

    socket.on("chat-message", (data, sender, sid) => {
      setMessages((prev) => [...prev, { sender, data }]);
      if (sid !== socket.id) setNewMsgCount((n) => n + 1);
    });

    return () => {
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("chat-message");
    };
  }, [socket, roomId]);

  useEffect(() => {
    if (screenEnabled) {
      navigator.mediaDevices
        .getDisplayMedia({ video: true })
        .then((stream) => {
          console.log("📺 Starting screen share");
          replaceTrack(stream);
          localVideoRef.current.srcObject = stream;
        })
        .catch((err) => console.error("🚨 Error sharing screen:", err));
    }
  }, [screenEnabled]);

  const toggleVideo = () => {
    const track = localVideoRef.current.srcObject?.getVideoTracks()?.[0];
    if (track) {
      track.enabled = !track.enabled;
      setVideoEnabled(track.enabled);
    }
  };

  const toggleAudio = () => {
    const track = localVideoRef.current.srcObject?.getAudioTracks()?.[0];
    if (track) {
      track.enabled = !track.enabled;
      setAudioEnabled(track.enabled);
    }
  };

  const toggleScreen = () => setScreenEnabled((v) => !v);

  const endCall = () => {
    localVideoRef.current?.srcObject?.getTracks()?.forEach((t) => t.stop());
    navigate("/home");
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    socket.emit("chat-message", message, username, socket.id);
    setMessages((prev) => [...prev, { sender: username, data: message }]);
    setMessage("");
  };

  return (
    <div className={styles.meetVideoContainer}>
      {isChatVisible && (
        <div className={styles.chatRoom}>
          <div className={styles.chatContainer}>
            <h2>Chat</h2>
            <div className={styles.chattingDisplay}>
              {messages.length === 0 && <p>No messages yet</p>}
              {messages.map((m, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <strong>{m.sender}</strong>:<br />
                  {m.data}
                </div>
              ))}
            </div>
            <div className={styles.chattingArea}>
              <TextField
                fullWidth
                variant="outlined"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message"
              />
              <Button onClick={sendMessage} variant="contained">
                Send
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.buttonContainers}>
        <IconButton onClick={toggleVideo} color="inherit">
          {videoEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
        </IconButton>
        <IconButton onClick={endCall} color="error">
          <CallEndIcon />
        </IconButton>
        <IconButton onClick={toggleAudio} color="inherit">
          {audioEnabled ? <MicIcon /> : <MicOffIcon />}
        </IconButton>
        <IconButton onClick={toggleScreen} color="inherit">
          {screenEnabled ? <StopScreenShareIcon /> : <ScreenShareIcon />}
        </IconButton>
        <Badge badgeContent={newMsgCount} color="secondary">
          <IconButton
            onClick={() => {
              setChatVisible((v) => !v);
              if (isChatVisible) setNewMsgCount(0);
            }}
            color="inherit"
          >
            <ChatIcon />
          </IconButton>
        </Badge>
      </div>

      <video
        className={styles.meetUserVideo}
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
      />
      <video
        className={styles.conferenceView}
        ref={remoteVideoRef}
        autoPlay
        playsInline
      />
    </div>
  );
}
