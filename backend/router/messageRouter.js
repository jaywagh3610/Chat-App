const express = require("express");
const {
  message,
  getMessages,
  getChatParticipants,
  getConversation,
  deleteMessage,
  markMessageAsRead,
  updateToDelivered,
} = require("../controller/messagesController");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();

router.post("/userMessage", verifyToken, message);
router.get("/getMessage", verifyToken, getMessages);
router.get("/getChatParticipants/:userId", getChatParticipants);
router.get("/getMessages/:userId/:partnerId", verifyToken, getConversation);
router.post("/updateToDeliver/:userId", updateToDelivered);
router.delete("/deleteMessage/:messageId", deleteMessage);
router.put("/markAsRead", markMessageAsRead);
module.exports = router;
