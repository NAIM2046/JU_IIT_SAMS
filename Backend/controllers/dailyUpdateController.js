const { getDB } = require("../config/db.js");
require("dotenv").config();

const updateAllAttendance = async (req, res) => {
  const db = getDB();
  try {
    const studentIds = req.body.studentIds;
    const status = req.body.status;
    console.log(req.body);
    const addDate = () => {
      const today = new Date();
      const day = String(today.getDate()).padStart(2, "0");
      const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-based
      const year = today.getFullYear();
      const finalDate = day + month + year;
      return finalDate;
    };

    const attendanceRecord = {
      date: addDate(),
      status,
    };

    const updateDoc = {
      $push: { attendanceList: attendanceRecord },
    };

    if (status === "P") {
      updateDoc.$inc = { totalPresent: 1 };
    }

    // Perform bulk update
    const result = await db
      .collection("attendanceInfo")
      .updateMany({ id: { $in: studentIds } }, updateDoc);

    res.json({
      success: true,
      message: `Updated ${result.modifiedCount} students`,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error in bulk attendance update:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update attendance",
      error: error.message,
    });
  }
};

const addInitialAttendanceInfo = async (req, res) => {
  const db = getDB();
  const id = req.params.id;
  console.log(id);
  const attendanceInfo = {
    id,
    attendanceList: [],
    totalPresent: 0,
  };
  try {
    const result = await db
      .collection("attendanceInfo")
      .insertOne(attendanceInfo);
    res.status(200).json({ message: "Initial Data Inserted Successfully." });
  } catch (error) {
    console.log("Initial Attendance Error", error);
  }
};

const classNumberUpdate = async (req, res) => {
  const addDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = today.getFullYear();
    const finalDate = day + month + year;
    return finalDate;
  };
  const db = getDB();
  const className = req.body.classname;
  try {
    const updateResult = await db.collection("attendanceInfo").updateOne(
      { className: className },
      {
        $push: { classDateList: addDate()},
        $inc: { totalClassCount: 1 },
      }
    );

    // If no document was updated, insert a new one
    if (updateResult.matchedCount === 0) {
      await db.collection("attendanceInfo").insertOne({
        className: className,
        classDateList: [addDate()],
        totalClassCount: 1,
      });
    }

    res.send({ message: "class added successfully" });
  } catch (error) {
    console.log("Error Found While Incrasing Number of class", error);
  }
};

module.exports = {
  addInitialAttendanceInfo,
  updateAllAttendance,
  classNumberUpdate,
};
