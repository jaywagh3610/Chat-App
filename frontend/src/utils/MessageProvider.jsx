import { useMutation } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { createContext, useContext } from "react";
import toast from "react-hot-toast";

const messageContext = createContext();

function MessageProvider({ children }) {
  // const token = localStorage.getItem("token");

  const sendMessage = useMutation({
    mutationFn: async ({ message, senderId, receiverId }) => {
      const res = await fetch("http://localhost:3000/message/userMessage", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          senderId,
          receiverId,
          message,
        }),
      });
      return res.json();
    },

    // onSuccess: (data) => {
    //   if (data.success) {
    //     dispatch({ type: "send-message", payload: data.message });
    //   }
    // },
    onError: (error) => {
      console.log(`the error is: ${error}`);
    },
  });

  const deleteMessage = useMutation({
    mutationFn: async ({ messageId }) => {
      const res = await fetch(
        `http://localhost:3000/message/deleteMessage/${messageId}`,
        {
          method: "DELETE",
        }
      );
      return res.json();
    },
    onSuccess: (data) => {
      toast.success("message deleted successfully");
      console.log(data.message);
    },
    onError: (error) => {
      toast.error("Some error into the delete");
      console.log(error);
    },
  });
  const value = {
    sendMessage: sendMessage.mutate,
    deleteMessage: deleteMessage.mutate,
  };
  return (
    <messageContext.Provider value={value}>{children}</messageContext.Provider>
  );
}

const useMessage = () => {
  const context = useContext(messageContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

MessageProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
export { MessageProvider, useMessage };
