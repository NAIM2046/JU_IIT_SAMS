const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db.js");

const createConversation = async (req, res) => {
  const db = getDB();
  const body = req.body;
  const check = await db.collection("conversation").findOne({roomId: body.roomId});

  if(check){
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
  console.log(user);
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

  console.log(users);

  res.status(200).json({
    users,
  });
};
const extisingConversation = async (req, res) => {
  const db = getDB();
  const { Id } = req.params; // still string

  try {
    const conversations = await db.collection("conversations").aggregate([
      {
        $match: {
          participants: Id // still string
        }
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
                        cond: { $ne: ["$$p", Id] }
                      }
                    },
                    0
                  ]
                }
              }
            ]
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "receiverId",
          foreignField: "_id",
          as: "receiver"
        }
      },
      {
        $unwind: {
          path: "$receiver",
          preserveNullAndEmptyArrays: true
        }
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
            photoURL: "$receiver.photoURL"
          }
        }
      }
    ]).toArray();

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


module.exports = {
  getConversation,
  createConversation ,
  extisingConversation
};
