import { useState } from "react";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import { FiMessageSquare } from "react-icons/fi";

const Message = () => {
  const [activeChat, setActiveChat] = useState(null);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left sidebar - Chat list - Hidden on mobile when chat is open */}
      <div
        className={`${
          activeChat ? "hidden md:block" : "block"
        } w-full md:w-1/3`}
      >
        <ChatList activeChat={activeChat} setActiveChat={setActiveChat} />
      </div>

      {/* Right side - Chat area - Hidden on mobile when no chat is selected */}
      {activeChat ? (
        <div
          className={`${
            activeChat ? "block" : "hidden md:block"
          } w-full md:w-2/3`}
        >
          <ChatWindow activeChat={activeChat} setActiveChat={setActiveChat} />
        </div>
      ) : (
        <div className="hidden md:flex md:w-2/3 items-center justify-center bg-gray-50">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiMessageSquare className="text-gray-500 text-2xl" />
            </div>
            <h2 className="text-xl font-semibold text-gray-700">IIT-JU</h2>
            <p className="text-gray-500 mt-2 max-w-md">
              Select a chat to start messaging. Your conversations will appear
              here.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Message;
