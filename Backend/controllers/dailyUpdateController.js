const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db.js");
require("dotenv").config();


const attendanceAddandUpdate = async (req, res) => {
  try {
    let { classId, subject, batchNumber, date, records } = req.body;

    // Trim spaces from string values
    classId = classId.trim();
    subject = subject.trim();
    batchNumber = batchNumber.trim();
    date = date.trim();

    // Clean up each student's record by trimming string fields
    if (!Array.isArray(records)) {
      return res.status(400).json({ error: "Records must be an array" });
    }

    records = records.map((record) => ({
      studentId: record.studentId.trim(),
      status: record.status.trim(), // e.g., "present", "absent"
    }));

    const db = getDB();
    const attendanceCollection = db.collection("attendanceInfo");

    const filter = { classId, subject, batchNumber, date };
    const update = { $set: { records } };

    const result = await attendanceCollection.updateOne(filter, update, { upsert: true });

    if (result.upsertedCount > 0) {
      res.status(201).json({ message: "Attendance inserted successfully." });
    } else if (result.modifiedCount > 0) {
      res.status(200).json({ message: "Attendance updated successfully." });
    } else {
      res.status(200).json({ message: "No changes made to the attendance." });
    }

  } catch (error) {
    console.error("Error in attendanceAddandUpdate:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

  

const getAttendancebyClass_sub_data = async (req, res) => {
  const db = getDB();
  const Attendance = db.collection("attendanceInfo");
  const { class: className, subject, date } = req.params;
  console.log(req.params);

  try {
    const record = await Attendance.findOne({
      class: className,
      subject,
      date,
    });

    if (!record) return res.status(210).json({ message: "Not found data" });

    res.json(record);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
}
 const setAttendanceDefault = async (req, res) => {
  const db = getDB();
  const AttendanceInfo = db.collection("attendanceInfo");
  const { className, subject, date,  defaultStatus , batchNumber } = req.body;
  //console.log(batchNumber) ;

  try {
    // Find existing attendance document
    const existing = await AttendanceInfo.findOne({
      class: className,
      subject: subject,
      date: date,
      batchNumber: batchNumber
    });

    if (existing) {
      // Update all statuses in the existing records array
      const updatedRecords = existing.records.map((record) => ({
        ...record,
        status: defaultStatus,
      }));

      await AttendanceInfo.updateOne(
        { _id: existing._id },
        { $set: { records: updatedRecords } }
      );

      return res.json({ message: "Attendance updated successfully" });
    }
   
     const students =  await db.collection('users').find({role: "student" , class: className} , {projection : {_id: 1}}).toArray() ;
    // Create new attendance document
    const newDoc = {
      class: className,
      subject,
      date,
      batchNumber: batchNumber,
      records: students.map((student) => ({
        studentId: student._id,
       
        status: defaultStatus,
      })),
    };

    await AttendanceInfo.insertOne(newDoc);
    res.json({ message: "Attendance created successfully" });
  } catch (err) {
    console.error("Error in set-default:", err);
    res.status(500).json({ message: "Server error" });
  }
};

 const updataAttendanceSingle = async (req, res) => {
  const db = getDB(); // make sure you are using this correctly
  const AttendanceInfo = db.collection("attendanceInfo");

  const { className, subject, date, studentId, batchNumber, status } = req.body;
  console.log("Updating attendance for:", req.body);

  objectStudentId = new ObjectId(studentId) ;

  try {
    const existing = await AttendanceInfo.findOne({
      class: className,
      subject,
      date,
      batchNumber 
    });

    if (existing) {
      const existingRecords = existing.records || [];

      const recordIndex = existingRecords.findIndex(
        (r) => r.studentId.toString() === objectStudentId.toString()
      );

      if (recordIndex !== -1) {
        // Update existing student's status
        existingRecords[recordIndex].status = status;
      } else {
        // Add new student record
        existingRecords.push({
          studentId:objectStudentId,
         
          status,
        });
      }

      await AttendanceInfo.updateOne(
        { _id: existing._id },
        { $set: { records: existingRecords } }
      );

      return res.json({ message: "Student attendance updated successfully" });
    }
   const students =  await db.collection('users').find({role: "student" , class: className} , {projection : {_id: 1}}).toArray() ;
    // If attendance doc doesn't exist, create new one
    const newRecords = students.map((student) => ({
      studentId: student._id,
     
      status: student._id === studentId ? status : "",
    }));

    await AttendanceInfo.insertOne({
      class: className,
      subject,
      date,
      batchNumber,
      records: newRecords,
    });

    res.json({ message: "Attendance created and student updated successfully" });
  } catch (error) {
    console.error("Error updating single student attendance:", error);
    res.status(500).json({ message: "Server error" });
  }
}
const getAttendanceByStudentId = async (req , res) =>{
  const db = getDB() ; 
  const AttendanceInfo = db.collection("attendanceInfo");
  //console.log(req.params) ;
  const { id : studentId } = req.params;

  try{
    const data = await AttendanceInfo.aggregate([
      {
        $unwind: "$records" 
      } , 
      {
        $match: {
          "records.studentId": studentId
        }
      } ,
      {
        $group: {
          _id: "$records.studentId", 
          totalClasses: {$sum: 1}, 
          presentCount: {
            $sum: {
              $cond: [{$eq: ["$records.status", "P"]}, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          studentId: "$_id", 
          totalClasses: 1,
          presentCount: 1
        }
      }
    ]).toArray() ;
    res.json(data[0] || {



    }) ;

  }catch(err){
    console.error("Error fetching attendance by student ID:", err);
    res.status(500).json({ message: "Server error" });
  }

}
const getAttendanceByStd_subject = async(req , res) =>{
  const info =  req.body  ; 
   // console.log(info) ;
  const db = getDB() ; 
  const collAttendance = db.collection("attendanceInfo") ; 
  const result =await collAttendance.aggregate([
    {
      $match:{
        class:info.classNumber , 
        subject: info.subject 
      }
    } ,
    {
      $unwind: "$records"
    } ,
    {
      $match: {
        "records.studentId" : info.studentId 
      }
    },  
    {
      $group: {
        _id: "$records.status",
        count: {$sum: 1}
      }
    },
    {
      $project: {
        _id: 0, 
        status: "$_id",
        count: 1
         
      }
    }
  ]).toArray() ;
  const attendanceSummary = {
    present: 0,
    absent: 0
  };

  result.forEach(item => {
    if (item.status === 'P') attendanceSummary.present = item.count;
    else if (item.status === 'A') attendanceSummary.absent = item.count;
  });

  res.status(200).json(attendanceSummary);
 
}

const getAttendanceHistory= async (req , res) =>{
  const db = getDB() ;
  const AttendanceInfo = db.collection("attendanceInfo");
  const { studentId , className } = req.params;
  try {
    const attendanceHistory = await AttendanceInfo.aggregate([
  {
    $match: {
      class: className,
    },
  },
  {
    $unwind: "$records",
  },
  {
    $match: {
      "records.studentId": studentId,
    },
  },
  {
    $addFields: {
      parsedDate: {
        $dateFromString: {
          dateString: {
            $concat: [
              { $substr: ["$date", 4, 4] }, // year
              "-",
              { $substr: ["$date", 2, 2] }, // month
              "-",
              { $substr: ["$date", 0, 2] }  // day
            ],
          },
          format: "%Y-%m-%d",
        },
      },
    },
  },
  {
    $group: {
      _id: "$date",
      parsedDate: { $first: "$parsedDate" },
      records: {
        $push: {
          subject: "$subject",
          status: "$records.status",
        },
      },
    },
  },
  {
    $project: {
      _id: 0,
      date: "$_id",
      records: 1,
      parsedDate: 1,
    },
  },
  {
    $sort: { parsedDate: 1 },
  }
]).toArray();

    if (attendanceHistory.length === 0) {
      return res.status(404).json({ message: "No attendance records found for this student." });
    }

    res.json(attendanceHistory);
  } catch (error) {
    console.error("Error fetching attendance history:", error);
    res.status(500).json({ message: "Server error" });
  }
}
const getAttendanceSummary = async (req, res) => {
  let { classId, subject, batchNumber } = req.params;
  const db = getDB();
  console.log(req.params) ;
  subject = subject.trim() ;
  try {
    if (!classId || !subject) {
      return res.status(400).json({ message: "classId and subject are required" });
    }

    const result = await db.collection("users").aggregate([
      {
        $match: {
          role: "student",
          class: classId
        }
      },
      {
        $lookup: {
          from: "attendanceInfo",
          let: { studentId: { $toString: "$_id" } },
          pipeline: [
            {
              $match: {
                classId: classId,
                subject: subject,
                batchNumber: batchNumber
              }
            },
            { $unwind: "$records" },
            {
              $match: {
                $expr: {
                  $eq: ["$records.studentId", "$$studentId"]
                }
              }
            },
            {
              $group: {
                _id: null,
                presentCount: {
                  $sum: {
                    $cond: [{ $eq: ["$records.status", "P"] }, 1, 0]
                  }
                },
                absentCount: {
                  $sum: {
                    $cond: [{ $eq: ["$records.status", "A"] }, 1, 0]
                  }
                }
              }
            }
          ],
          as: "attendanceSummary"
        }
      },
      {
        $addFields: {
          presentCount: {
            $ifNull: [{ $arrayElemAt: ["$attendanceSummary.presentCount", 0] }, 0]
          },
          absentCount: {
            $ifNull: [{ $arrayElemAt: ["$attendanceSummary.absentCount", 0] }, 0]
          }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          class_roll: 1,
          photoURL: 1,
          presentCount: 1,
          absentCount: 1
        }
      }
    ]).toArray();

    res.json(result);
  } catch (err) {
    console.error("Error in getAttendanceSummary:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAttendanceHistoryBY_class_subject = async (req, res) => {
  const db = getDB();
  const Users = db.collection("users");
  let { classId, subject , batchNumber} = req.params;
  subject = subject.trim()  ;
  console.log(req.params)
  console.log("Fetching attendance history for class:", classId, "subject:", subject , batchNumber) ;

  try {
    const result = await Users.aggregate([
      {
        $match: {
          class: classId,
          role: "student"
        }
      },
      {
        $lookup: {
          from: "attendanceInfo",
          let: { studentId: "$_id" },
          pipeline: [
            {
              $match: {
                classId: classId,
                subject: subject,
                batchNumber
              }
            },
            { $unwind: "$records" },
           {
  $match: {
    $expr: {
      $eq: ["$records.studentId", { $toString: "$$studentId" }]
    }
  }
}
,
            {
              $project: {
                _id: 0,
                date: 1,
                status: "$records.status"
              }
            }
          ],
          as: "attendances"
        }
      },
      {
        $project: {
          _id: 0,
          studentId: "$_id",
          name: 1,
          roll: "$class_roll",
          attendances: 1
        }
      }
    ]).toArray();

    res.send(result);
  } catch (error) {
    console.error("Error fetching attendance history:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};


const getAttendanceAndPreformaceByAClass = async (req, res) => {
  const { classId, batchNumber, subject, date } = req.params;
  const db = getDB();
  console.log(req.params)
  try {
    const result = await db.collection('users').aggregate([
      {
        $match: {
          role: "student",
          class: classId
        }
      },
      {
        $lookup: {
          from: "attendanceInfo",
          let: { studentId: "$_id" },
          pipeline: [
            {
              $match: {
                classId: classId,
                subject: subject,
                date: date,
                batchNumber: batchNumber
              }
            },
            { $unwind: "$records" },
            {
              $match: {
                $expr: {
                  $eq: [{ $toObjectId: "$records.studentId" }, "$$studentId"]
                }
              }
            },
            {
              $project: {
                _id: 0,
                attendance: "$records.status"
              }
            }
          ],
          as: "attendanceInfo"
        }
      },
      {
        $lookup: {
          from: "performanceInfo",
          let: { studentId: "$_id" },
          pipeline: [
            {
              $match: {
                classId: classId,
                subject: subject,
                date: date,
                batchNumber: batchNumber
              }
            },
           {
          
  $match: {
    $expr: {
      $eq: [{ $toObjectId: "$studentId" }, "$$studentId"]
    }
  }

},
            {
              $project: {
                _id: 0,
                value: 1
              }
            }
          ],
          as: "performanceInfo"
        }
      },
      {
        $addFields: {
          attendance: {
            $ifNull: [{ $arrayElemAt: ["$attendanceInfo.attendance", 0] }, "N/A"]
          },
          performance: {
            $ifNull: [{ $arrayElemAt: ["$performanceInfo.value", 0] }, "N/A"]
          }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          class: 1,
          class_roll: 1,
          photoURL: 1,
          attendance: 1,
          performance: 1
        }
      }
    ]).toArray();

    res.json(result);
  } catch (error) {
    console.error("Aggregation error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



module.exports = {
  getAttendancebyClass_sub_data,
  setAttendanceDefault,
  updataAttendanceSingle ,
  getAttendanceByStudentId ,
  // Add other functions here as needed
  getAttendanceByStd_subject,
  getAttendanceHistory ,
  getAttendanceSummary , 
  getAttendanceHistoryBY_class_subject , 
  getAttendanceAndPreformaceByAClass,
  attendanceAddandUpdate
  
}