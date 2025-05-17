const { getDB } = require("../config/db.js");
require("dotenv").config();

const updateAllAttendance = async (req, res) => {
  const db = getDB();
  try {
    const { studentIds, status, subject } = req.body;

    const today = (() => {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = now.getFullYear();
      return day + month + year; // Example: "15052025"
    })();

    let updatedCount = 0;
    let insertedCount = 0;

    for (const studentId of studentIds) {
      const student = await db.collection("attendanceInfo").findOne({ id: studentId });

      if (!student) continue;

      const alreadyExists = student.attendanceList?.find(
        (record) => record.date === today && record.subject === subject
      );

      if (alreadyExists) {
        // Update status only
        const result = await db.collection("attendanceInfo").updateOne(
          {
            id: studentId,
            "attendanceList.date": today,
            "attendanceList.subject": subject,
          },
          {
            $set: {
              "attendanceList.$.status": status,
             
            },
          }
        );
        updatedCount += result.modifiedCount;
      } else {
        // Insert new attendance record and update totalPresent if status is "P"
        const attendanceRecord = {
          date: today,
          status,
          subject,
        };

        const updateDoc = {
          $push: { attendanceList: attendanceRecord },
        };

       

        const result = await db
          .collection("attendanceInfo")
          .updateOne({ id: studentId }, updateDoc);

        insertedCount += result.modifiedCount;
      }
    }

    res.json({
      success: true,
      message: `Attendance processed. Inserted: ${insertedCount}, Updated: ${updatedCount}`,
      insertedCount,
      updatedCount,
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
 const getAttendanceByDateAndSubject = 
 async (req, res) => {
  const db = getDB();
  const { studentIds, date, subject } = req.body;

  try {
    const allStudents = await db.collection("attendanceInfo").find({
      id: { $in: studentIds }
    }).toArray();

    // Now filter attendanceList for each student in JS
    const filtered = allStudents.map(student => {
      const matchedAttendance = student.attendanceList?.find(
        item => item.date === date && item.subject === subject
      );

      return {
        id: student.id,
        attendance: matchedAttendance ? matchedAttendance.status : null
      };
    });

    res.json(filtered);
  } catch (err) {
    console.error("Error fetching attendance data:", err);
    res.status(500).json({ success: false, message: "Failed to get attendance data" });
  }
};

module.exports = {
  addInitialAttendanceInfo,
  updateAllAttendance,
  classNumberUpdate,
  getAttendanceByDateAndSubject,
};
