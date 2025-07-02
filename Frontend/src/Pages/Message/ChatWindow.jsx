import { useEffect, useRef, useState } from "react";
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
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef();

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
    if (!message.trim() && !selectedFile) return;

    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("roomId", activeChat.roomId);
      formData.append("senderId", user._id);
      formData.append("senderName", user.name);
      formData.append(
        "senderPhoto",
        user?.photoURL || "https://via.placeholder.com/150"
      );

      try {
        const res = await AxiosSecure.post(
          "/api/message/sendFileMessage",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        setMessages((prev) => [...prev, { ...res.data.message }]);
        setExistingConversation((prev) =>
          prev.map((conv) =>
            conv.roomId === activeChat.roomId
              ? {
                  ...conv,
                  lastMessage: {
                    text: "📎 File sent",
                    sender: user._id,
                    time: new Date().toISOString(),
                  },
                }
              : conv
          )
        );
        setSelectedFile(null);
      } catch (err) {
        console.error("Failed to upload file:", err);
      }
      return;
    }

    const newMessage = {
      text: message,
      roomId: activeChat.roomId,
      senderId: user._id,
      senderName: user.name,
      senderPhoto: user?.photoURL || "https://via.placeholder.com/150",
    };

    try {
      await AxiosSecure.post("/api/message/sendMessage", newMessage);
      setMessages((prev) => [
        ...prev,
        { ...newMessage, createdAt: new Date().toISOString() },
      ]);
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
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
                {msg.senderId !== user._id && (
                  <img
                    src={msg.senderPhoto || "https://via.placeholder.com/150"}
                    alt={msg.senderName}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                )}
                <div>
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
                    {msg.text && <p>{msg.text}</p>}
                    {msg.attachments &&
                      msg.attachments.map((filee, idx) => (
                        <div key={idx} className="mt-2">
                          {filee.type.startsWith("image/") ? (
                            <img
                              src={"http://localhost:5000" + filee.url}
                              alt={filee.name}
                              className="max-w-xs rounded"
                            />
                          ) : (
                            <a
                              href={"http://localhost:5000" + filee.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 underline"
                            >
                              📎 {filee.name}
                            </a>
                          )}
                        </div>
                      ))}
                    <p className="text-xs text-gray-500 text-right mt-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {msg.senderId === user._id && (
                      <p className="text-[10px] text-gray-500 text-right mt-0.5">
                        {msg.deliveredTo?.length > 0 &&
                        msg.deliveredTo.every((u) => u.seen) ? (
                          <span>👀 Seen</span>
                        ) : msg.deliveredTo?.length > 0 ? (
                          <span>✅ Delivered</span>
                        ) : (
                          <span>⌛ Sending</span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected file preview */}
      {selectedFile && (
        <div className="px-4 py-2 bg-gray-50 border-t">
          <p className="text-sm text-gray-700">
            Selected file:{" "}
            <span className="font-medium">{selectedFile.name}</span>
          </p>
          <button
            onClick={() => setSelectedFile(null)}
            className="text-red-500 text-xs mt-1"
          >
            Remove
          </button>
        </div>
      )}

      {/* Message input */}
      <div className="bg-gray-100 p-3 flex items-center">
        <button className="text-gray-600 mx-2 p-1 rounded-full hover:bg-gray-200">
          <FiSmile size={24} />
        </button>
        <button
          className="text-gray-600 mx-2 p-1 rounded-full hover:bg-gray-200"
          onClick={() => fileInputRef.current.click()}
        >
          <FiPaperclip size={24} />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          type="text"
          placeholder="Type a message"
          className="flex-1 border border-gray-300 rounded-full py-2 px-4 bg-white mx-2 outline-none"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
        />
        {message || selectedFile ? (
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
