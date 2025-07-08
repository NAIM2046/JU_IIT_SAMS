const { getDB } = require("../config/db.js");


const addAttendanceMark = async(req , res) =>{
     try {
    const db = getDB();
    const { classId, subjectCode, type, Number, marks } = req.body;

    if (!classId || !subjectCode || !type || !Number || !marks) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const filter = { classId, subjectCode, type, Number };
    const updateDoc = {
      $set: {
        marks,
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    };

    const result = await db.collection("incourse_marks").updateOne(
      filter,
      updateDoc,
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      res.status(201).json({ message: "New attendance marks inserted." });
    } else {
      res.status(200).json({ message: "Attendance marks updated." });
    }

  } catch (error) {
    console.error("Error saving attendance marks:", error);
    res.status(500).json({ message: "Server error." });
  }
}
module.exports = {
    addAttendanceMark
}