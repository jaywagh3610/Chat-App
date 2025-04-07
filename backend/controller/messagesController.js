const MessageModel = require("../models/messages");
const RegisterModel = require("../models/registrationModel");
const mongoose = require("mongoose");
const { Worker } = require("worker_threads");
const path = require("path");
const message = async (req, res) => {
  try {
    const { senderId, receiverId, message, status } = req.body;

    const sender = await RegisterModel.findOne({ _id: senderId });
    const reciever = await RegisterModel.findOne({ _id: receiverId });

    const worker = new Worker(
      path.join(__dirname, "../middleware/sentiment.js")
    );

    worker.postMessage({ message });

    worker.on("message", async ({ isSpam }) => {
      if (isSpam) {
        return res.status(400).json({
          success: false,
          message: "Message is flagged as spam!",
        });
      }
    });

    if (!sender || !reciever) {
      // console.log("HII");
      return res.status(404).json({
        success: false,
        message: "Something went wrong: sender or receiver not found",
      });
    }

    const participants = [senderId, receiverId].sort();

    const conversation = await MessageModel.findOne({ participants });

    if (!conversation) {
      const conversation = new MessageModel({
        participants,
        messages: [{ senderId, message }],
      });

      await conversation.save();
    } else {
      conversation.messages.push({ senderId, message, status });
      await conversation.save();
    }
    res.status(200).json({
      success: true,
      message: "The message was successfully sent",
      data: conversation,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const { senderId, recieverId } = req.body;
    const participants = [senderId, recieverId].sort();
    console.log(req.body);

    const conversation = await MessageModel.findOne({ participants }).populate(
      "message.senderId",
      "name"
    );

    if (!conversation) {
      const newConversation = new MessageModel({
        participants,
        messages: [{ senderId, message }],
      });

      await newConversation.save();

      res.status(200).json({
        success: true,
        message: "The message was successfully sent",
        data: newConversation,
      });
    }
    const Chat = await MessageModel.find({
      participants: userId,
      messages: { $exists: true, $ne: [] },
    });

    if (Chat.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No participants available as there are no messages.",
        data: [],
      });
    }
    return res.status(200).json({
      success: true,
      message: "The conversation get successfully",
      data: conversation.messages,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

const getChatParticipants = async (req, res) => {
  try {
    const { userId } = req.params;

    const Chat = await MessageModel.find({
      participants: userId,
      messages: { $exists: true, $ne: [] },
    });

    if (Chat.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No participants available as there are no messages.",
        data: [],
      });
    }

    const sender = await MessageModel.find({
      participants: userId,
    }).populate("participants", "name");

    const participants = sender.reduce((acc, message) => {
      message.participants.forEach((participant) => {
        if (
          participant._id.toString() !== userId.toString() &&
          !acc.find((p) => p._id.toString() === participant._id.toString())
        ) {
          const deliverMessages = message.messages.filter(
            (msg) => msg.status === "delivered"
          );
          // const sentMessages = message.messages.filter(
          //   (msg) => msg.status === "sent"
          // );

          const getSenderId = deliverMessages.filter(
            (msg) => userId !== msg.senderId
          );
          // const getIdsofSentsenders = sentMessages.filter(
          //   (msg) => userId !== msg.senderId
          // );
          const deliverMessageId = getSenderId.map((msg) => msg._id);
          // const sentMessageId = getIdsofSentsenders.map((msg) => msg._id);
          // console.log(getIdsofSentsenders);
          const unreadCount = deliverMessages.filter(
            (msg) => msg.senderId !== userId
          ).length;

          acc.push({
            ...participant._doc,
            unreadCount,
            deliverMessageId,
            getSenderId,
            // sentMessageId,
          });
        }
      });
      return acc;
    }, []);

    return res.status(200).json({
      success: true,
      data: participants,
    });
  } catch (error) {
    console.error("Error fetching chat participants:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve chat participants",
      error: error.message,
    });
  }
};
const updateToDelivered = async (req, res) => {
  try {
    const { userId: senderId } = req.params;
    const { receiverIds } = req.body;

    const senderObjectId = new mongoose.Types.ObjectId(senderId);

    const receiverObjectIds = receiverIds.map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    const result = await MessageModel.updateMany(
      {
        participants: { $all: [senderObjectId, ...receiverObjectIds] },
        "messages.status": "sent",
        "messages.senderId": { $in: receiverObjectIds },
      },
      { $set: { "messages.$[elem].status": "delivered" } },
      {
        arrayFilters: [{ "elem.status": "sent" }],
      }
    );

    res.status(200).json({
      success: true,
      message: "Messages updated to delivered",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
    console.error("Error updating to delivered:", error.message);
  }
};

const getConversation = async (req, res) => {
  const { userId, partnerId } = req.params;

  try {
    const participants = [userId, partnerId].sort();
    const chat = await MessageModel.findOne({
      participants,
    }).populate("messages.senderId", "name");
    if (!chat) {
      chat = await MessageModel.create({ participants, messages: [] });
    }

    res.status(200).json({ success: true, messages: chat.messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const trimmedMessageId = messageId.trim();

    if (!messageId) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID and Message ID are required",
      });
    }
    const updatedConversation = await MessageModel.findOneAndUpdate(
      { "messages._id": trimmedMessageId },
      { $pull: { messages: { _id: trimmedMessageId } } },
      { new: true }
    );

    if (!updatedConversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation or message not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Message deleted successfully",
      data: updatedConversation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete message",
      error: error.message,
    });
  }
};

const getUnreadMessages = async (userId) => {
  try {
    const messages = await MessageModel.aggregate([
      {
        $unwind: "$messages",
      },
      {
        $match: {
          "messages.read": { $ne: userId },
        },
      },
      {
        $group: {
          _id: "$_id",
          unreadCount: { $sum: 1 },
        },
      },
    ]);
    return messages;
  } catch (error) {
    console.error("Eroor fetching unread messages:", error);
  }
};

const markMessageAsRead = async (req, res) => {
  try {
    const { messageIds, userId } = req.body;

    if (!messageIds || !userId) {
      return res
        .status(400)
        .json({ message: "messageId or userId is missing" });
    }

    const result = await MessageModel.updateOne(
      { "messages._id": messageIds },
      { $set: { "messages.$[elem].status": "read" } },
      { arrayFilters: [{ "elem._id": { $in: messageIds } }] }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Message not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Message marked as read" });
  } catch (error) {
    // console.error("Error marking message as read:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  message,
  getMessages,
  getChatParticipants,
  getConversation,
  deleteMessage,
  markMessageAsRead,
  getUnreadMessages,
  updateToDelivered,
};
