const Message = require("../models/message");

const getChatHistory = async (req, res) => {
  const { roomId } = req.params;
  try {
    const messages = await Message.find({ roomId }).sort({ timestamp: 1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error("❌ Error fetching chat history:", error);
    res.status(500).json({ error: "Failed to get chat history" });
  }
};

const saveMessage = async (req, res) => {
  try {
    const { text, sender, receiver, roomId, timestamp } = req.body;

    const message = await Message.create({
      text,
      sender,
      receiver,
      roomId,
      timestamp,
    });
    res.status(201).json(message);
  } catch (err) {
    console.error("❌ Error saving message:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



module.exports = { getChatHistory ,saveMessage};
