import { memo, useCallback, useEffect, useRef, useState } from "react";
import { IoMdSend } from "react-icons/io";
import { useAuth } from "../utils/AuthProvider";
import { useSocket } from "../utils/SocketIoProvider";
import { useChat } from "../utils/ChatProvider";
import { useMessage } from "../utils/MessageProvider";

const Messages = memo(() => {
  const { user } = useAuth();
  const { chatting } = useChat();
  const { sendMessage, deleteMessage } = useMessage();
  const { socket, messages, setMessages, activeReaders, onlineUsers } =
    useSocket();
  const [message, setMessage] = useState("");
  const [showDeleteButton, setShowDeleteButton] = useState(null);
  const userIsOnline = onlineUsers.includes(user?.data?._id);
  const partnerIsOnline = onlineUsers.includes(chatting?.data?._id);
  const userIsReading = activeReaders.includes(chatting?.data?._id);
  const lastMessageRef = useRef(null);
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [messages]);
  // console.log(chatting?.data?._id, user?.data?._id, socket);

  useEffect(() => {
    // console.log(socket);
    if (!socket || !messages.length) return;

    const undeliveredMessages = messages.filter(
      (msg) => msg.senderId === chatting?.data?._id && msg.status === "sent"
    );

    if (undeliveredMessages.length > 0) {
      socket.emit("message-delivered", {
        userId: user?.data?._id,
        receiverId: chatting?.data?._id,
      });
    }
  }, [chatting?.data?._id, user?.data?._id, socket, messages]);
  useEffect(() => {
    if (!socket) return;
    console.log("reaad");
    socket.emit("message-read", {
      userId: user?.data?._id,
      receiverId: chatting?.data?._id,
    });
  }, [chatting?.data?._id, user?.data?._id, socket, messages.length]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!chatting?.data?._id || (!user?.data?._id && messages.length === 0))
        return;

      try {
        const res = await fetch(
          `http://localhost:3000/message/getMessages/${user.data._id}/${chatting.data._id}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        const data = await res.json();
        // console.log(data);

        if (res.ok && data.success) {
          setMessages(data.messages);
        } else {
          setMessages([]);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    const timeout = setTimeout(() => {
      fetchMessages();
    }, 100);
    return () => clearTimeout(timeout);
  }, [chatting?.data?._id, user?.data?._id, userIsOnline]);

  const handleShowDelete = useCallback((messageId) => {
    setShowDeleteButton((prev) => (prev === messageId ? null : messageId));
  }, []);

  const handleDeleteForMe = useCallback((messageId) => {
    setMessages((prevMessages) =>
      prevMessages.filter((msg) => msg._id !== messageId)
    );
    setShowDeleteButton(null);
  }, []);

  const handleDeleteForAll = useCallback(
    (messageId) => {
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg._id !== messageId)
      );
      deleteMessage({ messageId }, { forAll: true });
      socket.emit("deleteMessage", { messageId });
      setShowDeleteButton(null);
    },
    [deleteMessage, socket]
  );

  const handleSendMessage = useCallback(
    (e) => {
      e.preventDefault();
      if (!message.trim()) return;
      console.log("Sending message:", message);
      const newMessage = {
        senderId: user?.data?._id,
        receiverId: chatting?.data?._id,
        message,
        status:
          userIsReading && userIsOnline
            ? "read"
            : partnerIsOnline
            ? "delivered"
            : "sent",
        timestamp: new Date().toISOString(),
      };

      sendMessage(newMessage, user?.data?._id, chatting?.data?._id);

      if (chatting?.data?._id === newMessage.receiverId && socket?.connected) {
        socket.emit("sendMessage", newMessage);
      }

      setMessages((prevMessages) => [...prevMessages, newMessage]);

      setMessage("");
    },
    [
      message,
      socket,
      sendMessage,
      chatting?.data?._id,
      user?.data?._id,
      userIsOnline,
      userIsReading,
    ]
  );

  return (
    <div className="relative h-[calc(100vh-57px)] overflow-hidden bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] text-white font-sans">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-600 px-4 py-3 backdrop-blur-md bg-white/10 shadow-md">
        <h1 className="text-xl font-semibold tracking-wide">
          {chatting?.data?.name || "Name"}
        </h1>
        <h6 className="text-[12px]">{partnerIsOnline ? "online" : ""}</h6>
      </div>

      {/* Messages */}
      <div className="scroller h-[calc(100vh-170px)] overflow-y-auto px-4 py-2">
        {messages.length === 0 || !chatting?.data?.name ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-center text-lg">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const senderId = msg?.senderId?._id || msg?.senderId;
            const isCurrentUser = senderId === user?.data?._id;

            return (
              <div
                key={msg?._id || `${msg?.timestamp}-${index}`}
                ref={index === messages?.length - 1 ? lastMessageRef : null}
                className={`my-2 ${
                  isCurrentUser ? "flex justify-end" : "flex justify-start"
                }`}
              >
                <div
                  onClick={() => handleShowDelete(msg?._id)}
                  className={`cursor-pointer max-w-[70%] px-4 py-2 rounded-2xl text-sm transition-all duration-300 ${
                    isCurrentUser
                      ? "bg-gradient-to-r from-[#1cd8d2] to-[#93edc7] text-black"
                      : "bg-white/10 backdrop-blur-md text-white border border-white/10"
                  }`}
                >
                  {msg?.message}
                  {isCurrentUser && (
                    <span
                      className={`ml-2 text-xs ${
                        msg?.status === "read"
                          ? "text-blue-400"
                          : "text-gray-400"
                      }`}
                    >
                      {msg?.status === "sent" && "✓"}
                      {msg?.status === "delivered" && "✓✓"}
                      {msg?.status === "read" && "✓✓"}
                    </span>
                  )}
                </div>

                {showDeleteButton === msg?._id && (
                  <div className="absolute top-[45%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-xl border border-white/30 shadow-lg p-6 rounded-xl z-50">
                    <div className="flex gap-4">
                      <button
                        className="bg-red-400 hover:bg-red-500 text-white px-3 py-1 rounded-md text-sm"
                        onClick={() => handleDeleteForMe(msg?._id)}
                      >
                        Delete for Me
                      </button>
                      {isCurrentUser && (
                        <button
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
                          onClick={() => handleDeleteForAll(msg?._id)}
                        >
                          Delete for All
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="fixed bottom-4 w-full px-4 flex items-center gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex w-[40vw] bg-white/20 backdrop-blur-md border border-white/30 text-white px-4 py-2 rounded-full outline-none placeholder-gray-300 shadow-sm focus:ring-2 focus:ring-cyan-300"
          placeholder="Type a message..."
        />
        <button
          onClick={handleSendMessage}
          className="p-3 bg-gradient-to-tr from-[#00f2fe] to-[#4facfe] rounded-full text-white hover:scale-110 transition-transform"
        >
          <IoMdSend className="text-2xl" />
        </button>
      </div>
    </div>
  );
});

Messages.displayName = "Messages";

export default Messages;
