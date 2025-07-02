const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db.js");

const createConversation = async (req, res) => {
  const db = getDB();
  const body = req.body;
  const check = await db
    .collection("conversations")
    .findOne({ roomId: body.roomId });
  if (check) {
    res.json(check);
    return;
  }

  const result = await db.collection("conversations").insertOne(body);
  res.json(result);
};

const getConversation = async (req, res) => {
  const db = getDB();
  const { id } = req.params;
  const user = await db.collection("users").findOne({ _id: new ObjectId(id) });
  // console.log(user);
  let users = [];
  if (user.role === "student") {
    users = await db
      .collection("users")
      .find({ role: "teacher" }, { projection: { password: 0 } })
      .toArray();
  } else if (user.role === "teacher") {
    users = await db
      .collection("users")
      .find({ role: { $ne: "teacher" } }, { projection: { password: 0 } })
      .toArray();
  } else {
    users = await db
      .collection("users")
      .find({ projection: { password: 0 } })
      .toArray();
  }

  // console.log(users);

  res.status(200).json({
    users,
  });
};

const extisingConversation = async (req, res) => {
  const db = getDB();
  const { Id } = req.params; // still string

  try {
    const conversations = await db
      .collection("conversations")
      .aggregate([
        {
          $match: {
            participants: Id, // still string
          },
        },
        {
          $addFields: {
            receiverId: {
              $cond: [
                "$isGroup",
                null,
                {
                  $toObjectId: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$participants",
                          as: "p",
                          cond: { $ne: ["$$p", Id] },
                        },
                      },
                      0,
                    ],
                  },
                },
              ],
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "receiverId",
            foreignField: "_id",
            as: "receiver",
          },
        },
        {
          $unwind: {
            path: "$receiver",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            roomId: 1,
            isGroup: 1,
            groupName: 1,
            participants: 1,
            lastMessage: 1,
            createdAt: 1,
            receiver: {
              _id: "$receiver._id",
              name: "$receiver.name",
              photoURL: "$receiver.photoURL",
            },
          },
        },
        {
          $sort: {
            "lastMessage.time": -1, // latest message first
          },
        },
      ])
      .toArray();

    if (conversations.length > 0) {
      res.status(200).json(conversations);
    } else {
      res.status(404).json({ message: "No conversation found" });
    }
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const sendMessage = async (req, res) => {
  const db = getDB();
  const { roomId, senderId, text, senderName, senderPhoto } = req.body;

  // find the conversation to get participants
  const conversation = await db.collection("conversations").findOne({ roomId });
  if (!conversation) {
    return res.status(404).json({ message: "Conversation not found" });
  }

  // build deliveredTo array from participants
  const deliveredTo = conversation.participants.map((userId) => ({
    userId,
    seen: userId === senderId, // sender already seen
    deliveredAt: new Date(),
    seenAt: userId === senderId ? new Date() : null,
  }));

  // build message
  const message = {
    roomId,
    senderId,
    senderName,
    senderPhoto,
    text,
    attachments: [],
    editedAt: null,
    deletedFor: [],
    deliveredTo,
    createdAt: new Date(),
  };

  // insert into messages collection
  const result = await db.collection("messages").insertOne(message);

  // update conversation's lastMessage
  await db.collection("conversations").updateOne(
    { roomId },
    {
      $set: {
        lastMessage: {
          text,
          sender: senderId,
          time: new Date(),
        },
        updatedAt: new Date(),
      },
    }
  );

  // return inserted message with _id
  res.status(201).json({
    message: {
      _id: result.insertedId,
      ...message,
    },
  });
};

const getMessages = async (req, res) => {
  const db = getDB();
  const { roomId } = req.params;

  try {
    if (!roomId) {
      return res.status(400).json({ message: "Room ID is required." });
    }

    const messages = await db
      .collection("messages")
      .find({ roomId })
      .sort({ createdAt: 1 }) // latest message last
      .toArray();

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const sendFileMessage = async (req, res) => {
  const db = getDB();
  const { roomId, senderId, senderName, senderPhoto } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  try {
    // find the conversation to get participants
    const conversation = await db
      .collection("conversations")
      .findOne({ roomId });
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // build deliveredTo array
    const deliveredTo = conversation.participants.map((userId) => ({
      userId,
      seen: userId === senderId,
      deliveredAt: new Date(),
      seenAt: userId === senderId ? new Date() : null,
    }));

    // build the message with attachments
    const message = {
      roomId,
      senderId,
      senderName,
      senderPhoto,
      text: "", // file messages don’t have text by default
      attachments: [
        {
          url: `/uploads/${file.filename}`,
          type: file.mimetype,
          name: file.originalname,
        },
      ],
      editedAt: null,
      deletedFor: [],
      deliveredTo,
      createdAt: new Date(),
    };

    // insert message
    const result = await db.collection("messages").insertOne(message);

    // update conversation's lastMessage
    await db.collection("conversations").updateOne(
      { roomId },
      {
        $set: {
          lastMessage: {
            text: "📎 File sent", // generic text
            sender: senderId,
            time: new Date(),
          },
          updatedAt: new Date(),
        },
      }
    );

    res.status(201).json({
      message: {
        _id: result.insertedId,
        ...message,
      },
    });
  } catch (error) {
    console.error("Error sending file message:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getTotalunseenMessage = async (req, res) => {
  const db = getDB();
  const userId = req.params.userId;
  const result = await db
    .collection("messages")
    .aggregate([
      {
        $match: {
          deliveredTo: {
            $elemMatch: {
              userId: userId,
              seen: false,
            },
          },
        },
      },
      {
        $count: "totalUnseenMessages",
      },
    ])
    .toArray();
  if (result.length > 0) {
    res
      .status(200)
      .json({ totalUnseenMessages: result[0].totalUnseenMessages });
  } else {
    res.status(200).json({ totalUnseenMessages: 0 });
  }
};

const getIndividualUnseenMessage = async (req, res) => {
  const db = getDB();
  const userId = req.params.userId;
  const result = await db
    .collection("messages")
    .aggregate([
      {
        $match: {
          deliveredTo: {
            $elemMatch: {
              userId: userId,
              seen: false,
            },
          },
        },
      },
      {
        $group: {
          _id: "$roomId",
          unseenCount: { $sum: 1 },
        },
      },
    ])
    .toArray();

  res.status(200).json({
    result,
  });
};

const updateSeenInfo = async (req, res) => {
  const { id, roomId } = req.body;
  const db = getDB();
  console.log("body", req.body);
  /*
  const result = await db.collection("messages").updateMany(
    {
      roomId: roomId,
      "deliveredTo.userId": id,
      "deliveredTo.seen": false,
    },
    {
      $set: {
        "deliveredTo.$[userId].seen": true,
        "deliveredTo.$[userId].seenAt": new Date(),
      },
    },
    {
      arrayFilters: [
        {
          "elem.userId": id,
          "elem.seen": false,
        },
      ],
    }
  );
  */
  const match = await db
    .collection("messages")
    .find({
      roomId: roomId,
      "deliveredTo.userId": id,
      // "deliveredTo.seen": false,
    })
    .toArray();

  console.log("result", match);
  res.json({
    match,
  });
};

module.exports = {
  updateSeenInfo,
  getConversation,
  createConversation,
  extisingConversation,
  sendMessage,
  getMessages,
  sendFileMessage,
  getTotalunseenMessage,
  getIndividualUnseenMessage,
  updateSeenInfo,
};
