import React, { useState } from "react";
import { Video, Users, ArrowRight } from "lucide-react";

interface JoinRoomProps {
  onJoinRoom: (roomId: string, username: string) => void;
}

export const JoinRoom: React.FC<JoinRoomProps> = ({ onJoinRoom }) => {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

  const generateRoomId = () => {
    const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(randomId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim() && username.trim()) {
      onJoinRoom(roomId.trim(), username.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Video Call</h1>
          <p className="text-gray-600">
            Join or create a room to start your call
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Your Name
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label
              htmlFor="roomId"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Room ID
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                id="roomId"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                placeholder="Enter room ID"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={generateRoomId}
                className="px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <Users className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Generate a random room ID or enter an existing one
            </p>
          </div>

          <button
            type="submit"
            disabled={!roomId.trim() || !username.trim()}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            <span>Join Room</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Share the Room ID with others to invite them to your call
          </p>
        </div>
      </div>
    </div>
  );
};

