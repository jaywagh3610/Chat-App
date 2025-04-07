import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IoMdSend } from "react-icons/io";
import { io } from "socket.io-client";
import { useAuth } from "../utils/AuthProvider";
import Calling from "./Calling";

const Messages = memo(() => {
  const { sendMessage, user, deleteMessage, chatting, markMessagesAsRead } =
    useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showDeleteButton, setShowDeleteButton] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [activeReaders, setActiveReeaders] = useState([]);
  const userIsOnline = onlineUsers.includes(chatting?.data?._id);
  const userIsReading = activeReaders.includes(chatting?.data?._id);

  const socketRef = useRef(null);
  const socket = io("http://localhost:8000");

  const messageFromOtherUser = useMemo(() => {
    return messages.filter((msg) => msg.senderId._id !== user?.data?._id);
  }, [messages]);

  const unreadMessagesId = useMemo(() => {
    return messageFromOtherUser
      .filter((msg) => msg.status !== "read")
      .map((msg) => msg._id);
  }, [messageFromOtherUser]);

  useEffect(() => {
    if (user?.data?._id) {
      socket.emit("userOnline", user.data._id);
    }

    socket.on("updateOnlineUsers", (users) => {
      setOnlineUsers(users);
    });

    socket.on("deleteMessages", (data) => {
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg._id !== data.messageId)
      );
    });

    socket.on("messageStatusUpdate", (data) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === data.messageId ? { ...msg, status: data.status } : msg
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.data?._id]);

  useEffect(() => {
    if (chatting?.data?._id && user?.data?._id && userIsOnline) {
      socket.emit("active-reader", {
        senderId: user?.data?._id,
        receiverId: chatting?.data?._id,
        chatId: chatting?.data?._id,
      });
    }
    return () => {
      socket.emit("inactive-reader", { userId: user?.data?._id });
    };
  }, [chatting?.data?._id, user?.data?._id, userIsOnline]);

  useEffect(() => {
    socket.on("updateActiveReaders", (readers) => {
      setActiveReeaders(readers);
    });

    return () => {
      socket.off("updateActiveReaders");
    };
  }, [socketRef.current]);

  useEffect(() => {
    const handleMessage = (data) => {
      console.log("Message received:", data);
      setMessages((prevMessages) =>
        Array.isArray(prevMessages) ? [...prevMessages, data] : [data]
      );
    };

    socket.on("receiveMessage", handleMessage);

    return () => {
      socket.off("receiveMessage", handleMessage);
    };
  }, []);

  useEffect(() => {
    if (unreadMessagesId?.length === 0) return;
    const interval = setInterval(() => {
      console.log("hii mark as read");
      markMessagesAsRead.mutate({
        messageIds: unreadMessagesId || [],
        userId: chatting?.data?._id || "",
      });
    }, 20000);
    return () => clearInterval(interval);
  }, [userIsReading, markMessagesAsRead, chatting?.data?._id]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!chatting?.data?._id || !user?.data?._id) return;

      try {
        const res = await fetch(
          `http://localhost:8000/message/getMessages/${user.data._id}/${chatting.data._id}`
        );
        const data = await res.json();
        if (res.ok && data.success) {
          setMessages(data.messages);
        } else {
          setMessages([]);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    if (userIsOnline) {
      const lastMessageItem = messages[messages.length - 1];

      if (lastMessageItem) {
        socket.emit("messageStatusUpdate", {
          messageId: lastMessageItem._id,
          status: lastMessageItem.status,
        });
      }
    }

    setTimeout(() => {
      fetchMessages();
    }, 100);
  }, [chatting?.data?._id, user?.data?._id, sendMessage]);

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
      deleteMessage(messageId, { forAll: true });
      socket.emit("deleteMessage", { messageId });
      setShowDeleteButton(null);
    },
    [deleteMessage]
  );

  const handleSendMessage = useCallback(
    (e) => {
      e.preventDefault();
      if (!message.trim()) return;

      const newMessage = {
        senderId: user?.data?._id,
        receiverId: chatting?.data?._id,
        message,
        status: userIsReading ? "read" : userIsOnline ? "delivered" : "sent",
        timestamp: new Date().toISOString(),
      };

      sendMessage(newMessage);
      if (chatting?.data?._id === newMessage.receiverId) {
        socket.emit("sendMessage", newMessage);
      }

      setMessages((prevMessages) => [...prevMessages, newMessage]);

      setMessage("");
    },
    [message, sendMessage, chatting?.data?._id, user?.data?._id, userIsOnline]
  );

  return (
    <div>
      <div className="flex justify-between border-b-2">
        <h1 className="p-2 font-semibold underline">
          {chatting?.data?.name || "Name"}
        </h1>
        <div className="flex p-2 gap-5">
          <Calling />
        </div>
      </div>
      <div className="scroller h-[calc(100vh-130px)] overflow-y-auto">
        {messages.length === 0 || !chatting?.data?.name ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const senderId = msg.senderId?._id || msg.senderId;
            const isCurrentUser = senderId === user?.data?._id;

            return (
              <div
                key={msg._id || `${msg.timestamp}-${index}`}
                className={`text-red ${
                  isCurrentUser ? "flex justify-end" : ""
                }`}
              >
                <h1
                  onClick={() => handleShowDelete(msg._id)}
                  className={`cursor-pointer ${
                    isCurrentUser
                      ? "bg-[#46e084] m-2 w-fit p-1 rounded"
                      : "m-2 p-1 w-fit rounded bg-slate-100"
                  }`}
                >
                  {msg.message}{" "}
                  {isCurrentUser && (
                    <span
                      className={`text-[15px] ${
                        msg.status === "read"
                          ? "text-blue-500"
                          : "text-[#585758dc]"
                      }`}
                    >
                      {msg.status === "sent" && "✓"}
                      {msg.status === "delivered" && "✓✓"}
                      {msg.status === "read" && "✓✓"}
                    </span>
                  )}
                </h1>
                {showDeleteButton === msg._id && (
                  <div className="flex gap-2 mt-1 absolute top-[45%] left-[56%] bg-[#eee5ee] p-10 rounded-lg ">
                    <button
                      className="border rounded-lg text-sm bg-red-400 text-white px-2"
                      onClick={() => handleDeleteForMe(msg._id)}
                    >
                      Delete for Me
                    </button>
                    {isCurrentUser && (
                      <button
                        className="border rounded-lg text-sm bg-red-600 text-white px-2"
                        onClick={() => handleDeleteForAll(msg._id)}
                      >
                        Delete for All
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      <div className="fixed bottom-[1rem] w-full flex ml-2 gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-[45%] outline-none border-2 border-gray-400 rounded-lg"
          placeholder="Type a message..."
        />
        <button onClick={handleSendMessage} className="text-xl">
          <IoMdSend />
        </button>
      </div>
    </div>
  );
});

Messages.displayName = "Messages";

export default Messages;
