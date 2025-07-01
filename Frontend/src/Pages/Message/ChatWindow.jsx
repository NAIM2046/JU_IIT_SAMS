import { useEffect, useState } from "react";
import {
  FiMoreVertical,
  FiSearch,
  FiMic,
  FiSmile,
  FiPaperclip,
} from "react-icons/fi";
import { IoIosArrowDown, IoMdSend } from "react-icons/io";

const ChatWindow = ({ activeChat, setActiveChat }) => {
  console.log("ChatWindow rendered with activeChat:", activeChat);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    const fetchMessages = async () => {};
  }, []);

  const handleSendMessage = () => {};

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
        <div className="space-y-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === "me" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`rounded-lg py-2 px-3 max-w-[70%] ${
                  msg.sender === "me"
                    ? "bg-green-100 rounded-tr-none"
                    : "bg-white rounded-tl-none"
                }`}
              >
                <p>{msg.text}</p>
                <p className="text-xs text-gray-500 text-right mt-1">
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>
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
