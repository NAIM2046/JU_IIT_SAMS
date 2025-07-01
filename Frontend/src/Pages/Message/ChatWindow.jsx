import { useEffect, useState } from "react";
import {
  FiMoreVertical,
  FiSearch,
  FiMic,
  FiSmile,
  FiPaperclip,
} from "react-icons/fi";
import { IoIosArrowDown, IoMdSend } from "react-icons/io";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";
import useStroge from "../../stroge/useStroge";

const ChatWindow = ({
  activeChat,
  setActiveChat,
  setExistingConversation,
  existingConversation,
}) => {
  const AxiosSecure = useAxiosPrivate();
  const { user } = useStroge();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!activeChat) return;

    setLoading(true);
    const fetchMessages = async () => {
      try {
        const res = await AxiosSecure.get(
          `/api/message/getMessages/${activeChat.roomId}`
        );
        setMessages(res.data);
      } catch (err) {
        console.error("Error loading messages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [activeChat]);
  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const newMessage = {
      text: message,
      roomId: activeChat.roomId,
      senderId: user._id,
      senderName: user.name,
      senderPhoto: user?.photoURL || "https://via.placeholder.com/150",
    };

    try {
      const res = await AxiosSecure.post(
        "/api/message/sendMessage",
        newMessage
      );

      console.log("Message sent:", res.data);

      // messages list এ push করো
      setMessages((prev) => [
        ...prev,
        {
          ...newMessage,
          createdAt: new Date().toISOString(),
        },
      ]);

      // 🆕 conversation list update করো
      setExistingConversation((prev) =>
        prev.map((conv) =>
          conv.roomId === activeChat.roomId
            ? {
                ...conv,
                lastMessage: {
                  text: newMessage.text,
                  sender: user._id,
                  time: new Date().toISOString(),
                },
              }
            : conv
        )
      );

      setMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Chat header */}
      <div className="bg-gray-100 p-3 flex justify-between items-center border-b border-gray-300">
        <div className="flex items-center">
          <button
            className="md:hidden mr-2 p-1"
            onClick={() => setActiveChat(null)}
          >
            <IoIosArrowDown size={20} />
          </button>
          <img
            src={
              activeChat?.receiver?.photoURL ||
              "https://via.placeholder.com/150"
            }
            alt={activeChat?.receiver?.name || activeChat?.groupName}
            className="w-10 h-10 rounded-full"
          />
          <div className="ml-3">
            <h3 className="font-semibold">
              {activeChat?.receiver?.name || activeChat?.groupName}
            </h3>
            <p className="text-xs text-gray-600">Online</p>
          </div>
        </div>
        <div className="flex space-x-4 text-gray-600">
          <button className="p-1 rounded-full hover:bg-gray-200">
            <FiSearch size={20} />
          </button>
          <button className="p-1 rounded-full hover:bg-gray-200">
            <FiMoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto bg-[#e5ddd5] bg-opacity-30 bg-[url('https://web.whatsapp.com/img/bg-chat-tile-light_a4be512e7195b6b733d9110b408f075d.png')]">
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`flex items-start ${
                  msg.senderId === user._id ? "justify-end" : "justify-start"
                }`}
              >
                {/* Sender image for others */}
                {msg.senderId !== user._id && (
                  <img
                    src={msg.senderPhoto || "https://via.placeholder.com/150"}
                    alt={msg.senderName}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                )}

                <div>
                  {/* Sender name only for group / others */}
                  {msg.senderId !== user._id && (
                    <p className="text-xs text-gray-600 font-semibold mb-1">
                      {msg.senderName}
                    </p>
                  )}

                  <div
                    className={`rounded-lg py-2 px-3 max-w-[100%] ${
                      msg.senderId === user._id
                        ? "bg-green-100 rounded-tr-none"
                        : "bg-white rounded-tl-none"
                    }`}
                  >
                    <p>{msg.text}</p>
                    <p className="text-xs text-gray-500 text-right mt-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message input */}
      <div className="bg-gray-100 p-3 flex items-center">
        <button className="text-gray-600 mx-2 p-1 rounded-full hover:bg-gray-200">
          <FiSmile size={24} />
        </button>
        <button className="text-gray-600 mx-2 p-1 rounded-full hover:bg-gray-200">
          <FiPaperclip size={24} />
        </button>
        <input
          type="text"
          placeholder="Type a message"
          className="flex-1 border border-gray-300 rounded-full py-2 px-4 bg-white mx-2 outline-none"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
        />
        {message ? (
          <button
            className="text-gray-600 mx-2 p-1 rounded-full hover:bg-gray-200"
            onClick={handleSendMessage}
          >
            <IoMdSend size={24} className="text-green-600" />
          </button>
        ) : (
          <button className="text-gray-600 mx-2 p-1 rounded-full hover:bg-gray-200">
            <FiMic size={24} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
