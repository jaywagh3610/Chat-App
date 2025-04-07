import PropTypes from "prop-types";
import { createContext, useContext, useState } from "react";

const chatContext = createContext();

function ChatProvider({ children }) {
  const [chat, setChat] = useState([]);
  const [chatting, setChattting] = useState({ messages: [] });
  async function selectChatPartner(_id) {
    const res = await fetch(
      `http://localhost:3000/register/selectUser?_id=${_id}`,
      { method: "GET", headers: { "Content-Type": "application/json" } }
    );

    const data = await res.json();
    console.log(data);

    if (data.success) {
      setChattting(data);
    }
  }

  const fetchChatParticipants = async (userId) => {
    try {
      const res = await fetch(
        `http://localhost:3000/message/getChatParticipants/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        setChat(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
    }
  };

  const value = {
    selectChatPartner,
    fetchChatParticipants,
    chat,
    chatting,
    setChat,
  };

  return <chatContext.Provider value={value}>{children}</chatContext.Provider>;
}

const useChat = () => {
  const context = useContext(chatContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

ChatProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { ChatProvider, useChat };
