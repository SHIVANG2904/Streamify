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

// ⚡ Setup socket.io server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",  // allow frontend
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middlewares
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// DB connection & models
const { connectDB } = require("./lib/db.js");
const Message = require("./models/message.js");

// API routes
app.use("/api/auth", require("./routes/authRoutes.js"));
app.use("/api/user", require("./routes/userRoutes.js"));
app.use("/api/chat", require("./routes/chatRoutes.js"));

// Frontend serving (dev)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"));
  });
}

// ✅ SOCKET.IO logic
io.on("connection", (socket) => {
  console.log("🔌 WebSocket connected:", socket.id);

  // 1️⃣ Join chat room (DB-backed chat)
  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`👥 ${socket.id} joined room ${roomId}`);
  });

  // 2️⃣ Send chat message to room (saved to DB)
  socket.on("send-message", async ({ text, sender, receiver, roomId, timestamp }) => {
    if (!text || !sender || !receiver || !roomId) return;
    try {
      const newMsg = await Message.create({
        text,
        sender,
        receiver,
        roomId,
        timestamp: timestamp || new Date(),
      });
      io.to(roomId).emit("receive-message", newMsg);
    } catch (err) {
      console.error("❌ Error saving message:", err);
    }
  });

  // 3️⃣ Typing indicators
  socket.on("typing", ({ roomId, userId }) => {
    socket.to(roomId).emit("typing", { userId });
  });
  socket.on("stopTyping", ({ roomId, userId }) => {
    socket.to(roomId).emit("stopTyping", { userId });
  });

  // 4️⃣ Video call in-room chat (NOT saved to DB)
  socket.on("chat-message", (msg, sender, sid) => {
    console.log("💬 In-call chat-message:", msg);
    socket.broadcast.emit("chat-message", msg, sender, sid);
  });

  // 5️⃣ WebRTC signaling
  socket.on("offer", ({ offer, roomId }) => {
    console.log("📨 Offer received");
    socket.to(roomId).emit("offer", { offer });
  });

  socket.on("answer", ({ answer, roomId }) => {
    console.log("📨 Answer received");
    socket.to(roomId).emit("answer", { answer });
  });

  socket.on("ice-candidate", ({ candidate, roomId }) => {
    console.log("📨 ICE candidate received");
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
