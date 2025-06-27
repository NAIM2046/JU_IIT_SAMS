const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db.js");

const getConversation = async (req, res) => {
    const db = getDB();
    const {id} = req.params;
    const user = db.collection("users").find({_id: new ObjectId(id)});
    let users = [];
    if(user.role === 'student'){
        users = await db.collection("users").find({role: "teacher"}, {projection: {password: 0}}).toArray();
    }else if(user.role === 'teacher') {
        users = await db.collection("users").find({role: "student", role: "admin"}, {projection: {password: 0}}).toArray();
    }else {
        users = await db.collection("users").find({projection: {password: 0}}).toArray();
    }

    console.log(users);

    res.status(200).json({
        users
    })
};

module.exports = {
    getConversation,
}