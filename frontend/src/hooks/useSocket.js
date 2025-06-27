import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SERVER = "http://localhost:3000"; // Replace if needed

// 🚀 Only for video call signaling
export const useSocket = () => {
  const socketRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    socketRef.current = io(SERVER);

    socketRef.current.on("connect", () => {
      setReady(true);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  // Waiting until socket is connected
  return ready ? socketRef.current : null;
};
