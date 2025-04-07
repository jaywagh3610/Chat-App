const mongoose = require("mongoose");

const { Schema } = mongoose;

const messageSchema = new Schema({
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "accounts",
      // index: { unique: true },
    },
  ],
  messages: [
    {
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "accounts",
      },
      message: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: () => new Date(),
      },
      status: {
        type: String,
        enum: ["sent", "delivered", "read"],
        default: "sent",
      },
    },
  ],
});
// messageSchema.index({ participants: 1 }, { unique: true, sparse: true });
const MessageModel = mongoose.model("message", messageSchema);
module.exports = MessageModel;
