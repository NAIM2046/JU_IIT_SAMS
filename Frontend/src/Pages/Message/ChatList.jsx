import { FiEdit2, FiSearch } from "react-icons/fi";
import { BsThreeDotsVertical, BsFilter } from "react-icons/bs";
import useStroge from "../../stroge/useStroge";
import { useEffect, useState } from "react";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";
import { io } from "socket.io-client";
const socket = io("http://localhost:5000");

const ChatList = ({
  activeChat,
  setActiveChat,
  existingConversation,
  setExistingConversation,
}) => {
  const { user } = useStroge();
  const axiosSecure = useAxiosPrivate();
  const [currentUser, setCurrentUsers] = useState([]);
  const [searchuser, setSearchUser] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeCreateGroup, setActiveCreateGroup] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [searchcreateGroup, setSearchCreateGroup] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [totalMessageCounts, setTotalMessageCounts] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axiosSecure.get(
          `/api/message/allConversation/${user._id}`
        );
        setCurrentUsers(result.data.users);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    const existingConversation = async () => {
      try {
        const response = await axiosSecure.get(
          `/api/message/extisingConversation/${user._id}`
        );
        if (response.data.length > 0) {
          // setActiveChat(response.data[0]);
          setExistingConversation(response.data);
        }
      } catch (error) {
        console.error("Error fetching existing conversation:", error);
      }
    };
    existingConversation();
    fetchData();
  }, []);

  useEffect(() => {
    if (!user?._id) return;
    socket.emit("user-connected", user._id);

    socket.on("online-users", (users) => {
      console.log("active users", users);
      setOnlineUsers(users);
    });

    return () => {
      socket.off("");
    };
  }, []);

  console.log("onlineUsers", onlineUsers);
  const filteredUsers = currentUser.filter((u) =>
    u.name?.toLowerCase().includes(searchuser.toLowerCase())
  );

  const filterCreateGroup = currentUser.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchcreateGroup.toLowerCase()) ||
      u.class?.includes(searchcreateGroup)
  );

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filterCreateGroup.map((u) => u._id));
    }
  };

  useEffect(() => {
    if (
      selectedUsers.length === filterCreateGroup.length &&
      filterCreateGroup.length > 0
    ) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedUsers, filterCreateGroup]);

  const toggleSelectUser = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const createConversation = (receiverData) => {
    const newId = [receiverData._id, user._id].sort().join("_");
    // Check if conversation already exists
    const existingConv = existingConversation.find(
      (conv) => conv.roomId === newId
    );
    if (existingConv) {
      setActiveChat(existingConv);
      return; // If it exists, just set it as active
    }
    const conversation = {
      roomId: newId,
      isGroup: false,
      groupName: null,
      participants: [receiverData._id, user._id],
      createdBy: `${user._id}`,
      createdAt: new Date(),
      lastMessage: { text: "", sender: "", time: "" },
    };

    // TEMP: add to local UI immediately
    const tempConversation = {
      ...conversation,
      _id: newId,
      receiver: {
        _id: receiverData?._id,
        name: receiverData?.name,
        photoURL:
          receiverData?.photoURL || "https://i.ibb.co/G9wkJbX/user.webp",
      },
    };

    setExistingConversation((prev) => [tempConversation, ...prev]);
    setActiveChat(tempConversation);

    // Now actually send to backend
    axiosSecure
      .post("/api/message/createConversation", conversation)
      .then((res) => {
        console.log(res.data);
        // Optionally replace temp with real
      })
      .catch((err) => console.error(err));
  };

  const handleCreateGroup = async () => {
    if (!groupName || selectedUsers.length === 0) {
      alert("Please enter group name and select members.");
      return;
    }

    const conversation = {
      roomId: `${groupName}_${Date.now()}`,

      isGroup: true,
      groupName,
      participants: [user._id, ...selectedUsers],
      createdBy: user._id,
      createdAt: new Date(),
      lastMessage: { text: "", sender: "", time: "" },
    };

    console.log(conversation);
    await axiosSecure.post("/api/message/createConversation", conversation);
    alert("Group created successfully!");
    setActiveCreateGroup(false);
    setSelectedUsers([]);
    setGroupName("");
    setExistingConversation((prev) => [...prev, conversation]);
    setActiveChat(conversation);
  };

  useEffect(() => {
    axiosSecure
      .get(`/api/message/getIndividualUnseenMessage/${user._id}`)
      .then((res) => {
        setTotalMessageCounts(res.data.result);
      });
  }, []);

  // 2. Then update existingConversation when counts or conversation changes
  useEffect(() => {
    // if (totalMessageCounts.length > 0 && existingConversation.length > 0) {
    console.log("inside useeffect");
    const updatedConversations = existingConversation.map((conv) => {
      const matchedCount = totalMessageCounts.find(
        (count) => count._id === conv.roomId
      );
      return {
        ...conv,
        count: matchedCount ? matchedCount.unseenCount : 0,
      };
    });

    //setting active status for each existing conversations
    const conversationWithActiveStatus = updatedConversations.map((conv) => {
      const isActive =
        conv.receiver && conv.receiver._id
          ? onlineUsers.includes(conv.receiver._id)
          : false;
      return {
        ...conv,
        isActive,
      };
    });

    // console.log("inside func", conversationWithActiveStatus);
    setExistingConversation(conversationWithActiveStatus); // 🔄 Update state
    // }
  }, [totalMessageCounts, onlineUsers]);

  // console.log(totalMessageCounts);
  console.log("exist", existingConversation);
  // console.log("activeChat", activeChat?._id);

  useEffect(() => {
    const obj = {
      id: user?._id,
      roomId: activeChat?.roomId,
    };
    axiosSecure.post("/api/message/updateSeenInfo", obj).then((res) => {
      console.log(res.data);
      if (res.data.modifiedCount > 0) {
        console.log("✅ unseen messages marked as seen");
        // এখানে conversation unseen count কমিয়ে UI refresh করো
        setExistingConversation((prev) =>
          prev.map((conv) =>
            conv.roomId === activeChat.roomId ? { ...conv, count: 0 } : conv
          )
        );
      } else {
        console.log("ℹ️ No unseen messages to update");
      }
    });
  }, [activeChat]);

  console.log("existing conversations", existingConversation);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="w-full h-full border-r border-gray-300 bg-white">
      {/* Header */}
      <div className="bg-gray-100 p-3 flex justify-between items-center">
        <div>
          <img
            src={user.photoURL || "https://i.ibb.co/G9wkJbX/user.webp"}
            alt="Profile"
            className="w-10 h-10 rounded-full"
          />
        </div>
        <div className="flex space-x-4 text-gray-600">
          {user.role === "teacher" && (
            <button
              onClick={() => setActiveCreateGroup(true)}
              className="p-1 rounded-full hover:bg-gray-200"
            >
              <FiEdit2 size={20} />
            </button>
          )}
          <button className="p-1 rounded-full hover:bg-gray-200">
            <BsThreeDotsVertical size={20} />
          </button>
        </div>
      </div>

      <div className="p-2 bg-gray-100 ">
        <h3 className="text-lg font-semibold mb-2">Existing Conversations</h3>
        <div className="overflow-y-auto h-[400px]">
          {existingConversation.map((chat) => (
            <div
              key={chat._id}
              className={`flex relative items-center  p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${
                activeChat?.roomId === chat.roomId ? "bg-green-100" : ""
              }`}
              onClick={() => setActiveChat(chat)}
            >
              <img
                src={
                  chat.receiver?.photoURL ||
                  "https://i.ibb.co/G9wkJbX/user.webp"
                }
                alt={chat.groupName || chat.receiver.name}
                className="w-12 h-12 rounded-full"
              />
              <div className="ml-3 flex-1">
                <div className="flex gap-2">
                  <h3 className="font-semibold">
                    {chat.groupName || chat.receiver.name}
                  </h3>
                  {chat?.count && (
                    <div className="bg-green-500 h-7 w-7 font-bold text-center rounded-full">
                      {chat?.count}
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {chat.lastMessage.text || "No messages yet"}
                </p>
              </div>
              {chat.isActive && (
                <div className="absolute left-12 bottom-10 bg-green-500 h-4 w-4 font-bold text-center border-2 border-base-100 rounded-full"></div>
              )}
              <span className="text-xs text-gray-400">
                {new Date(chat.lastMessage.time).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))}
        </div>
      </div>
      {/* Search start chat */}
      <div className="p-2 bg-gray-100">
        <div className="bg-white rounded-lg flex items-center px-3 py-1">
          <FiSearch className="h-5 w-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search or start new chat"
            className="ml-2 outline-none flex-1 py-2 px-1"
            value={searchuser}
            onChange={(e) => setSearchUser(e.target.value)}
          />
          <BsFilter className="h-5 w-5 text-gray-500" />
        </div>
      </div>
      {/* sart chat with users list */}
      <div className="overflow-y-auto h-[200px]">
        {filteredUsers.map((chat) => (
          <div
            key={chat._id}
            className={`flex items-center p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${
              activeChat === chat._id ? "bg-gray-100" : ""
            }`}
            onClick={() => createConversation(chat)}
          >
            <img
              src={chat.photoURL || "https://i.ibb.co/G9wkJbX/user.webp"}
              alt={chat.name}
              className="w-12 h-12 rounded-full"
            />
            <div className="ml-3 flex-1">
              <h3 className="font-semibold">{chat.name}</h3>
            </div>
          </div>
        ))}
      </div>
      {/* Create Group Form */}
      {activeCreateGroup && (
        <div className="p-4 bg-white rounded-lg shadow-md absolute top-20 left-1/2 transform -translate-x-1/2 w-96 z-50">
          <h3 className="text-lg font-semibold mb-2">Create Group</h3>
          <input
            type="text"
            placeholder="Group Name"
            className="w-full p-2 border border-gray-300 rounded mb-4"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
          <h4 className="text-sm font-semibold mb-2">Select Members</h4>
          <input
            type="text"
            placeholder="Search by name or class"
            className="w-full p-2 border border-gray-300 rounded mb-4"
            value={searchcreateGroup}
            onChange={(e) => setSearchCreateGroup(e.target.value)}
          />
          <div className="overflow-y-auto max-h-48 border p-2 rounded">
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="mr-2"
              />
              <span>Select All</span>
            </div>
            {filterCreateGroup.map((u) => (
              <div key={u._id} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(u._id)}
                  onChange={() => toggleSelectUser(u._id)}
                  className="mr-2"
                />
                <img
                  src={u.photoURL || "https://i.ibb.co/G9wkJbX/user.webp"}
                  alt={u.name}
                  className="w-8 h-8 rounded-full mr-2"
                />
                <span>{u.name}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => setActiveCreateGroup(false)}
            className="w-full mt-4 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateGroup}
            className="w-full mt-4 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Create Group
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatList;
