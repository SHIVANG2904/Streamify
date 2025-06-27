const express = require("express");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// DB connection
const { connectDB } = require("./lib/db.js");
const Message = require("./models/message.js");

// Routes
const authRoutes = require("./routes/authRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const chatRoutes = require("./routes/chatRoutes.js");

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);

// Serve frontend in development
if (process.env.NODE_ENV === "development") {
  app.use(express.static(path.join(__dirname, "../../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"));
  });
}

// ✅ WebSocket logic
io.on("connection", (socket) => {
  console.log("🔌 WebSocket connected:", socket.id);

  // 🔁 1-1 chat room (DB-based)
  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`👥 ${socket.id} joined room ${roomId}`);
  });

  socket.on(
    "send-message",
    async ({ text, sender, receiver, roomId, timestamp }) => {
      if (!text || !sender || !receiver || !roomId) return;

      try {
        const newMessage = await Message.create({
          text,
          sender,
          receiver,
          roomId,
          timestamp: timestamp || new Date(),
        });

        io.to(roomId).emit("receive-message", newMessage);
      } catch (err) {
        console.error("❌ Error saving message:", err);
      }
    }
  );

  socket.on("typing", ({ roomId, userId }) => {
    socket.to(roomId).emit("typing", { userId });
  });

  socket.on("stopTyping", ({ roomId, userId }) => {
    socket.to(roomId).emit("stopTyping", { userId });
  });

  // ✅ In-call video chat message (NOT saved to DB)
  socket.on("chat-message", (msg, sender, sid) => {
    console.log("💬 In-call chat-message received:", msg);
    socket.broadcast.emit("chat-message", msg, sender, sid);
  });

  // ✅ WebRTC Signaling for Video Call
  socket.on("offer", ({ offer, roomId }) => {
    console.log("📨 Offer received:", offer);
    socket.to(roomId).emit("offer", { offer });
  });

  socket.on("answer", ({ answer, roomId }) => {
    console.log("📨 Answer received:", answer);
    socket.to(roomId).emit("answer", { answer });
  });

  socket.on("ice-candidate", ({ candidate, roomId }) => {
    console.log("📨 ICE candidate received:", candidate);
    socket.to(roomId).emit("ice-candidate", { candidate });
  });

  socket.on("disconnect", () => {
    console.log("❌ WebSocket disconnected:", socket.id);
  });
});

// Start server
server.listen(PORT, async () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  await connectDB();
});
