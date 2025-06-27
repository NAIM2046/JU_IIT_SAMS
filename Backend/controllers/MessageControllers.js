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

module.exports = {
  getConversation,
  createConversation
};
