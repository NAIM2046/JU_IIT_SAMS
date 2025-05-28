const { getDB } = require("../config/db.js");
require("dotenv").config();

const addClassHistory = async (req, res) => {
  const db = getDB();
  const ClassHistory = db.collection("classHistory");

  const {
    className,
    subject,
    date,
    teacherName,
    status,
    totalStudents,
    totalPresent,
    totalAbsent,
  } = req.body;

  // Basic validation
  if (!className || !subject || !date || !teacherName || totalStudents == null || totalPresent == null || totalAbsent == null) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const filter = { className, subject, date };

    const updateDoc = {
      $set: {
        teacherName,
        status,
        totalStudents,
        totalPresent,
        totalAbsent,
      },
    };

    const options = { upsert: true };

    await ClassHistory.updateOne(filter, updateDoc, options);

    res.status(200).json({ message: "Class history added or updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
  const getClassHistory = async (req, res) => {
  const db = getDB();
    const ClassHistory = db.collection("classHistory"); 
    const { teacherName } = req.query;
    if (!teacherName) return res.status(400).json({ message: "Teacher name required" });

  const classHistory = await db.collection("classHistory").find({ teacherName }).toArray();
  res.json(classHistory);
  }
module.exports = {
  addClassHistory,
    getClassHistory,
};
