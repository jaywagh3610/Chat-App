// import { useEffect, useState } from "react";
// import { io } from "socket.io-client";
// const socket = io("http://localhost:3000", {
//   autoConnect: false,
//   reconnection: true,
// });
// function useSocket() {
//   const [messages, setMessages] = useState([]);
//   const [activeReaders, setActiveReaders] = useState([]);

//   useEffect(() => {
// socket.on("deleteMessage", ({ messageId }) => {
//   console.log("Message deleted:", messageId);
//   setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
// });

//     return () => {
//       socket.off("deleteMessage");
//     };
//   }, []);

//   useEffect(() => {
//     socket.on("receiveMessage", (data) => {
//       console.log("New message received:", data);
//       setMessages((prev) => [...prev, data]);
//     });
//     return () => {
//       socket.off("receiveMessage");
//     };
//   }, []);

//   useEffect(() => {
//     socket.on("messageStatusUpdate", ({ messageId, status }) => {
//       console.log("Message status updated:", messageId, status);
//       setMessages((prev) =>
//         prev.map((msg) => (msg._id === messageId ? { ...msg, status } : msg))
//       );
//     });

//     return () => {
//       socket.off("messageStatusUpdate");
//     };
//   }, []);

//   useEffect(() => {
//     socket.on("updateActiveReaders", (readers) => {
//       setActiveReaders(readers);
//       console.log("updateActiveReaders");
//     });

//     return () => {
//       socket.off("updateActiveReaders");
//     };
//   }, []);

//   return { messages, setMessages, activeReaders, socket };
// }

// export default useSocket;
