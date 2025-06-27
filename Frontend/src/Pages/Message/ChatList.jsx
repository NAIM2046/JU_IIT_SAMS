import { FiSearch } from "react-icons/fi";
import { BsThreeDotsVertical, BsFilter } from "react-icons/bs";

const ChatList = ({ chats, activeChat, setActiveChat }) => {
  return (
    <div className="w-full h-full border-r border-gray-300 bg-white">
      {/* Header */}
      <div className="bg-gray-100 p-3 flex justify-between items-center">
        <div className="flex items-center">
          <img
            src="https://randomuser.me/api/portraits/men/2.jpg"
            alt="Profile"
            className="w-10 h-10 rounded-full"
          />
        </div>
        <div className="flex space-x-4 text-gray-600">
          <button className="p-1 rounded-full hover:bg-gray-200">
            <BsThreeDotsVertical size={20} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-2 bg-gray-100">
        <div className="bg-white rounded-lg flex items-center px-3 py-1">
          <FiSearch className="h-5 w-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search or start new chat"
            className="ml-2 outline-none flex-1 py-2 px-1"
          />
          <BsFilter className="h-5 w-5 text-gray-500" />
        </div>
      </div>

      {/* Chat list */}
      <div className="overflow-y-auto h-[calc(100%-110px)]">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`flex items-center p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${
              activeChat === chat.id ? "bg-gray-100" : ""
            }`}
            onClick={() => setActiveChat(chat.id)}
          >
            <img
              src={chat.avatar}
              alt={chat.name}
              className="w-12 h-12 rounded-full"
            />
            <div className="ml-3 flex-1">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">{chat.name}</h3>
                <span className="text-xs text-gray-500">{chat.time}</span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600 truncate max-w-[180px]">
                  {chat.lastMessage}
                </p>
                {chat.unread > 0 && (
                  <span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {chat.unread}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatList;
