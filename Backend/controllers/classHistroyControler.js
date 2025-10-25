const { getDB } = require("../config/db.js");
require("dotenv").config();

const addClassHistory = async (req, res) => {
  const db = getDB();
  const ClassHistory = db.collection("classHistory");

  const {
    classId,
    subject,
    type, 
    batchNumber,
    date,
    teacherName,
    teacherId,

    status,
    totalStudents,
    totalPresent,
    totalAbsent,
  } = req.body;
  console.log(req.body);

  // Basic validation
  if (!classId || !subject || !date || !teacherName || totalStudents == null || totalPresent == null || totalAbsent == null || !status || !type || !batchNumber) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const filter = { classId, subject, date , batchNumber };

    const updateDoc = {
      $set: {
        teacherName,
        teacherId,
        type,
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

  const class_on_off_status = async (req, res) => {
    const db = getDB();
    const ClassStatus = db.collection("Status");
    const  data = req.body;
    if (data == null) return res.status(400).json({ message: "Status required" });
    try {
      const filter = { name: data.name };
      const updateDoc = {
        $set: { status: data.status },
      };
      const options = { upsert: true };
      await ClassStatus.updateOne(filter, updateDoc, options);
        
      res.status(200).json({ message: "Class status updated successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  };
 const getclass_on_off_status = async (req, res) => {
    const db = getDB();
    const {name} =  req.query ;
    const ClassStatus = db.collection("Status");
    const status = await ClassStatus.find({name : name}).toArray();
    res.json(status);
  }
module.exports = {
  addClassHistory,
  getClassHistory,
  class_on_off_status,
  getclass_on_off_status
};
