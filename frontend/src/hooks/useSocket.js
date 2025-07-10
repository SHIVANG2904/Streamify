import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SERVER = "http://localhost:3000"; // Replace if needed

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

  return ready ? socketRef.current : null;
};
