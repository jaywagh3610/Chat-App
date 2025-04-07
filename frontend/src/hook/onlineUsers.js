// import { useEffect, useState } from "react";
// import { io } from "socket.io-client";

// const socket = io("http://localhost:3000", {
//   autoConnect: false,
//   reconnection: true,
// });
// const useOnlineUser = (userId) => {
//   const [onlineUsers, setOnlineUsers] = useState([]);
//   useEffect(() => {
//     if (userId) {
//       socket.emit("userOnline", userId);
//     }
//     const handleUpdateOnlineUsers = (users) => {
//       console.log("Updated online users:", users);
//       setOnlineUsers(users);
//     };

//     socket.on("updateOnlineUsers", handleUpdateOnlineUsers);

//     return () => {
//       socket.off("updateOnlineUsers");
//     };
//   }, [socket, userId]);

//   return onlineUsers;
// };

// export default useOnlineUser;
