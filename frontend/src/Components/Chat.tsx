import React, { useState, useRef, useEffect } from "react";
import { Send, X } from "lucide-react";

interface ChatMessage {
  message: string;
  userId: string;
  username: string;
  timestamp: string;
}

interface ChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onClose: () => void;
  currentUserId: string;
  isVisible: boolean;
}

export const Chat: React.FC<ChatProps> = ({
  messages,
  onSendMessage,
  onClose,
  currentUserId,
  isVisible,
}) => {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage("");
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed right-4 top-4 bottom-4 w-80 bg-white rounded-lg shadow-xl flex flex-col z-50">
      {/* Header */}
      <div className="bg-blue-500 text-white p-4 rounded-t-lg flex items-center justify-between">
        <h3 className="font-medium">Chat</h3>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.userId === currentUserId ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs px-3 py-2 rounded-lg ${
                  msg.userId === currentUserId
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-800 rounded-bl-none"
                }`}
              >
                {msg.userId !== currentUserId && (
                  <div className="text-xs font-medium mb-1 opacity-70">
                    {msg.username}
                  </div>
                )}
                <div className="text-sm">{msg.message}</div>
                <div
                  className={`text-xs mt-1 ${
                    msg.userId === currentUserId
                      ? "text-blue-100"
                      : "text-gray-500"
                  }`}
                >
                  {formatTime(msg.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

