const MessageModel = require("../models/messages");
const messageContext = async ({ userId, receiverId }) => {
  const messageIdss = await MessageModel.find({
    participants: { $all: [userId, receiverId] },
  }).populate("participants", "name");
  // console.log(messageIdss);

  const participants = messageIdss.reduce((acc, message) => {
    const sentMessages = message.messages.filter(
      (msg) => msg.status === "sent"
    );

    const unread = message.messages.filter((msg) => msg.status !== "read");
    const getIdsofSentsenders = sentMessages.filter(
      (msg) => userId !== msg.senderId
    );
    const getIdsOfSendersOfDelivers = unread.filter(
      (msg) => userId !== msg.senderId
    );
    const sentMessageId = getIdsofSentsenders.map((msg) => msg._id);
    const deliverMessageIds = getIdsOfSendersOfDelivers.map((msg) => msg._id);

    acc.push({ sentMessageId, deliverMessageIds });

    return acc;
  }, []);
  // console.log(participants);
  return participants;
};

module.exports = messageContext;
