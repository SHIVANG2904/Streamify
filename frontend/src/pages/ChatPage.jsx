import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuthUser } from "../hooks/useAuthUser";
import { initSocket, getSocket } from "../lib/chatSocket";
import { getChatHistory } from "../lib/api";
import CallButton from "../Components/CallButton";
import toast from "react-hot-toast";

function ChatPage() {
  const { id: targetUserId } = useParams();
  const { authUser } = useAuthUser();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [partnerTyping, setPartnerTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const roomId = [authUser?._id, targetUserId].sort().join("--");

  useEffect(() => {
    const socket = initSocket();
    if (!authUser?._id || !targetUserId) return;

    socket.emit("join-room", roomId);

    getChatHistory(roomId)
      .then((msgs) => setMessages(msgs))
      .catch((err) => console.error("❌ Fetch chat failed:", err));

    socket.on("receive-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("typing", () => setPartnerTyping(true));
    socket.on("stopTyping", () => setPartnerTyping(false));

    return () => {
      socket.off("receive-message");
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [authUser, targetUserId]);

  const emitMessage = (text) => {
    const socket = getSocket();
    const msg = {
      text,
      sender: authUser._id,
      receiver: targetUserId,
      roomId,
      timestamp: new Date().toISOString(),
    };
    socket.emit("send-message", msg);
    // ❌ Removed local UI update
  };

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    emitMessage(text);
    setInput("");
  };

  const handleVideoCall = () => {
    const callUrl = `${window.location.origin}/call/${roomId}`;
    emitMessage(`📞 Let's have a video call! Click here to join: ${callUrl}`);
    toast.success("Video call link sent!");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleInputChange = (e) => {
    const socket = getSocket();
    const value = e.target.value;
    setInput(value);
    socket.emit("typing", { roomId, userId: authUser._id });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", { roomId, userId: authUser._id });
    }, 2000);
  };

  return (
    <div className="h-[93vh] relative flex flex-col max-w-3xl mx-auto">
      <CallButton handleVideoCall={handleVideoCall} />

      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-100">
        {messages.map((msg, idx) => {
          const isSender = msg.sender === authUser._id;
          return (
            <div
              key={idx}
              className={`flex w-full ${
                isSender ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`p-2 px-4 py-2 rounded-xl max-w-[80%] text-sm shadow-md break-words whitespace-pre-wrap ${
                  isSender
                    ? "bg-green-200 rounded-br-none"
                    : "bg-white rounded-bl-none"
                }`}
              >
                <div>{msg.text}</div>
                <div className="text-right text-xs text-gray-500 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {partnerTyping && (
        <div className="absolute bottom-20 left-4 text-sm italic text-gray-500">
          Typing...
        </div>
      )}

      <div className="p-4 border-t bg-white flex">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Type a message..."
          className="flex-1 border rounded-l px-4 py-2"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-green-600 text-white px-4 py-2 rounded-r"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatPage;
