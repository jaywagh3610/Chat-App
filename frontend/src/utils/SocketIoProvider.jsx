import PropTypes from "prop-types";
import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthProvider";

const socketIoContext = createContext();

function SocketIoProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeReaders, setActiveReaders] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const newScoket = io("http://localhost:3000", {
      transports: ["websocket"],
      // autoConnect: false,
      reconnection: true,
      query: { userId: user?.data?._id },
    });
    // newScoket.connect();
    setSocket(newScoket);
    newScoket.on("receiveMessage", (data) => {
      console.log("receiveMessage", data);
      setMessages((prev) => [...prev, data]);
    });
    newScoket.on("connect", () => {
      if (user?.data?._id) {
        newScoket.emit("userOnline", user?.data?._id);
      }
    });
    newScoket.on("updateOnlineUsers", (data) => {
      setOnlineUsers(data);
      console.log(data);
    });

    newScoket.on("message-delivered", ({ messageIds }) => {
      console.log("Delivered message IDs:", messageIds);
      setMessages((prev) =>
        prev.map((msg) =>
          messageIds.includes(msg._id) ? { ...msg, status: "delivered" } : msg
        )
      );
    });
    newScoket.on("deleteMessage", ({ messageId }) => {
      console.log("Message deleted:", messageId);
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    });
    newScoket.on("message-read", ({ messageIds }) => {
      console.log("Delivered message IDs:", messageIds);
    });

    return () => {
      newScoket.off("receiveMessage");
      newScoket.off("updateOnlineUsers");
      newScoket.off("message-delivered");
      newScoket.off("deleteMessage");
      newScoket.off("message-read");
      // newScoket.disconnect();
      setSocket(null);
    };
  }, [user]);

  const value = {
    socket,
    onlineUsers,
    messages,
    activeReaders,
    setMessages,
  };

  return (
    <socketIoContext.Provider value={value}>
      {children}
    </socketIoContext.Provider>
  );
}

const useSocket = () => {
  const context = useContext(socketIoContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
SocketIoProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { SocketIoProvider, useSocket };
