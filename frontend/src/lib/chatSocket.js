// src/lib/chatSocket.js
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3000"; // Update if using deployed backend
let socket = null;

export const initSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, { withCredentials: true });
  }
  return socket;
};

export const getSocket = () => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
