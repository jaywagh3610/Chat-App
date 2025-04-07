import { memo, useCallback, useEffect } from "react";
import { useAuth } from "../utils/AuthProvider";
import { useChat } from "../utils/ChatProvider";
import { useSearch } from "../utils/SearchProvider";
import { useSocket } from "../utils/SocketIoProvider";

const LeftPanel = memo(() => {
  const { user } = useAuth();

  const {
    selectChatPartner,
    fetchChatParticipants,

    chat,
    setChat,
  } = useChat();
  const { chatPartner } = useSearch();

  // const chatIds = (Array.isArray(chat) ? chat : []).map((c) => c._id);

  const { onlineUsers } = useSocket(user?.data?._id);

  useEffect(() => {
    if (chatPartner?.data) {
      setChat((prev) => {
        if (!prev.some((ch) => ch._id === chatPartner.data._id)) {
          return [...prev, chatPartner.data];
        }
        return prev;
      });
    }
  }, [chatPartner]);

  useEffect(() => {
    if (user?.data._id) {
      fetchChatParticipants(user?.data?._id);
    }
  }, []);

  // console.log(chat);

  const handleSelect = useCallback(
    (messageIds, userId) => {
      selectChatPartner(userId);
    },
    [selectChatPartner]
  );
  return (
    <div className="h-[calc(100vh-57px)] overflow-hidden bg-gradient-to-br  from-[#0f2027] via-[#203a43] to-[#528399] text-white font-sans">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-3 border-b border-white/20 bg-white/10 backdrop-blur-md shadow-md">
        <h1 className="text-xl font-bold tracking-wide">Chats</h1>
        <p className="text-md font-medium text-gray-200">{user?.data?.name}</p>
      </div>

      {/* Chat List */}
      <div className="overflow-y-auto h-full">
        {chat.map((ch) => {
          const userIsOnline = onlineUsers?.includes(ch._id);
          const getMessages = ch.getSenderId?.some(
            (item) => item.senderId === ch._id
          );

          return (
            <div
              key={ch?._id}
              onClick={() =>
                handleSelect(ch?.deliverMessageId, ch?._id, ch.unreadCount)
              }
              className="mx-2 my-2 bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-xl transition-all duration-300 cursor-pointer shadow-sm"
            >
              <div className="flex justify-between items-center px-4 py-3 rounded-xl">
                {/* Name */}
                <p className="text-lg font-semibold truncate">{ch?.name}</p>

                <div className="flex items-center gap-3">
                  {/* Online Status Dot */}
                  <span
                    className={`w-3 h-3 rounded-full ${
                      userIsOnline ? "bg-green-400" : "bg-gray-400"
                    }`}
                    title={userIsOnline ? "Online" : "Offline"}
                  ></span>

                  {/* Unread Badge */}
                  {getMessages && ch.unreadCount > 0 && (
                    <span className="text-xs font-semibold bg-red-600 text-white px-2 py-1 rounded-full shadow-md">
                      {ch.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
LeftPanel.displayName = "LeftPanel";

export default LeftPanel;
