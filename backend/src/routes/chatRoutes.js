const express = require("express");
const router = express.Router();
const { protectRoute } = require("../middleware/auth.middleware");
const {
  getChatHistory,
  saveMessage,
} = require("../controllers/chatController");

// Apply auth middleware to all chat routes
router.use(protectRoute);

// Save a message
router.post("/message", saveMessage);

// Get messages for a room
router.get("/:roomId", getChatHistory);

module.exports = router;
