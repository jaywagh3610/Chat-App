const { Server } = require("socket.io");
const express = require("express");
const http = require("http");
const MessageModel = require("../models/messages");
const { ObjectId } = require("mongodb");
const messageContext = require("../context/messageContext");

const app = express();

const onlineUsers = new Map();
const activeReaders = new Map();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT"],
    // credentials: true,
  },
});

io.use((socket, next) => {
  try {
    const userId = socket.handshake.query.userId;
    if (!userId) {
      return next(new Error("Authentication error: User ID is required"));
    }
    next();
  } catch (error) {
    console.error("Middleware error:", error);
    next(new Error("Middleware failed"));
  }
});
io.on("connection", (socket) => {
  socket.on("userOnline", (userId) => {
    console.log(`User connected: ${socket.id} is ${userId}`);
    try {
      if (onlineUsers.has(userId)) {
        onlineUsers.delete(userId);
      }
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;
      io.emit("updateOnlineUsers", Array.from(onlineUsers.keys()));
    } catch (error) {
      console.error("Error in userOnline event:", error);
      socket.emit("error", { message: "Failed to update online status" });
    }
  });

  socket.on("sendMessage", (data) => {
    try {
      const receiverSocketId = onlineUsers.get(data.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", data);
      } else {
        // console.log(`User ${data.receiverId} is offline`);
        socket.emit("error", { message: "User is offline" });
      }
    } catch (error) {
      console.error("Error in sendMessage event:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });
  socket.on("message-count", (data) => {});

  socket.on("message-delivered", async ({ userId, receiverId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);

    const participants = await messageContext({ userId, receiverId });
    const messageIds = participants
      ?.flatMap((p) => p.sentMessageId)
      .filter((id) => id);

    const objectIds = messageIds
      .map((id) => {
        try {
          return new ObjectId(id);
        } catch (error) {
          console.error(`Invalid ObjectId: ${id}`, error);
          return null;
        }
      })
      .filter((id) => id !== null);

    try {
      const bulkOps = objectIds.map((messageId) => ({
        updateOne: {
          filter: {
            // participants: { $all: [userId, receiverId] },
            "messages._id": messageId,
          },
          update: { $set: { "messages.$.status": "delivered" } },
        },
      }));
      if (receiverSocketId) {
        const result = await MessageModel.bulkWrite(bulkOps);
        console.log("Bulk update result:", result);
        io.to(receiverSocketId).emit("message-delivered", { messageIds });
        console.log("message-deliverd");
      } else {
        console.log("Receiver not online");
      }
    } catch (error) {
      console.log("Error updating message status:", error);
    }
  });

  socket.on("message-read", async ({ userId, receiverId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);

    if (receiverSocketId) {
      activeReaders.set(userId, receiverId);
      if (!activeReaders.has(userId)) return;
      else {
        const participants = await messageContext({ userId, receiverId });
        const messageIds = participants
          ?.flatMap((p) => p.deliverMessageIds)
          .filter((id) => id);
        const objectIds = messageIds.map((id) => {
          try {
            return new ObjectId(id);
          } catch (error) {
            console.error(`Invalid ObjectId: ${id}`, error);
            return null;
          }
        });

        try {
          const bulkOps = objectIds.map((messageId) => ({
            updateOne: {
              filter: {
                participants: { $all: [userId, receiverId] },
                "messages._id": messageId,
              },
              update: { $set: { "messages.$.status": "read" } },
            },
          }));
          if (receiverSocketId) {
            const result = await MessageModel.bulkWrite(bulkOps);
            console.log("Bulk update result:", result);
            io.to(receiverSocketId).emit("message-read", { messageIds });
            console.log("message-read");
          } else {
            console.log("Receiver not reading");
          }
        } catch (error) {
          console.log("Error updating message status:", error);
        }
      }
    }
  });

  socket.on("deleteMessage", (data) => {
    try {
      io.emit("deleteMessage", { messageId: data.messageId });
    } catch (error) {
      console.error("Error in deleteMessage event:", error);
      socket.emit("error", { message: "Failed to delete message" });
    }
  });

  socket.on("disconnect", () => {
    try {
      const userId = socket.userId;
      if (onlineUsers.get(userId) === socket.id) {
        onlineUsers.delete(userId);
        io.emit("updateOnlineUsers", Array.from(onlineUsers.keys()));
        console.log(`User ${userId} disconnected`);
      }
    } catch (error) {
      console.error("Error in disconnect event:", error);
    }
  });

  // Handle socket errors
  socket.on("error", (err) => {
    console.error("Socket error:", err);
    socket.emit("error", {
      message: "An error occurred",
      details: err.message,
    });
  });
});
module.exports = {
  app,
  server,
};
