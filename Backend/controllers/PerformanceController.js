const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db.js");
require("dotenv").config();

const UpdatePerformance = async (req, res) => {
  const db = getDB();
  const { className, subject, studentId, evaluation } = req.body;
  console.log(req.body);
  const objectStudentId = new ObjectId(studentId) ;
  const performanceInfo = db.collection("performanceInfo");

  const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD

  try {
    const existing = await performanceInfo.findOne({
      class: className,
      subject: subject,
      studentId: objectStudentId,
    });

    if (existing) {
      const lastUpdated = existing.lastUpdated || "";
      const prevEvaluation = existing.latestEvaluation;
      const totalTasks = existing.totalTasks || 0;

      const updateQuery = {};
      const updateOps = {};

      if (lastUpdated === today) {
        // Same day update
        if (prevEvaluation !== evaluation) {
          // Decrease previous eval count
          updateOps[`$inc`] = {
            [`${prevEvaluation.toLowerCase()}Count`]: -1,
            [`${evaluation.toLowerCase()}Count`]: 1,
          };
          updateOps["$set"] = {
            latestEvaluation: evaluation,
          };
        } else {
          // Same evaluation, same day: no changes
          return res
            .status(200)
            .json({ message: "No update needed", totalTasks });
        }
      } else {
        // New day — increment totalTasks and new evaluation count
        updateOps[`$inc`] = {
          totalTasks: 1,
          [`${evaluation.toLowerCase()}Count`]: 1,
        };
        updateOps["$set"] = {
          latestEvaluation: evaluation,
          lastUpdated: today,
        };
      }

      await performanceInfo.updateOne({ _id: existing._id }, updateOps);

      res.status(200).json({
        message: "Performance updated",
        totalTasks: today == existing.lastUpdated ? totalTasks : totalTasks + 1,
      });
    } else {
      // Create new performance document
      const newDoc = {
        studentId : objectStudentId,

        class: className,
        subject,
        latestEvaluation: evaluation,
        totalTasks: 1,
        excellentCount: evaluation === "Excellent" ? 1 : 0,
        goodCount: evaluation === "Good" ? 1 : 0,
        badCount: evaluation === "Bad" ? 1 : 0,
        lastUpdated: today,
      };

      await performanceInfo.insertOne(newDoc);
      res
        .status(201)
        .json({ message: "Performance record created", totalTasks: 1 });
    }
  } catch (err) {
    console.error("Error updating performance:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};   //not use

const add_updatePerformace = async (req, res) => {
  try {
    const db = getDB();
    const collection = db.collection("performanceInfo");

    const performanceList = req.body;
    console.log( "performance info ",performanceList) ;

    if (!Array.isArray(performanceList) || performanceList.length === 0) {
      return res.status(400).json({ message: "Invalid performance data." });
    }

    const bulkOps = performanceList.map((entry) => {
      // Trim all string fields
      const classId = entry.classId?.trim();
      const subject = entry.subject?.trim();
      const batchNumber = entry.batchNumber?.trim();
      const date = entry.date?.trim();

      return {
        updateOne: {
          filter: {
            classId,
            subject,
            batchNumber,
            studentId: entry.studentId,
            date,
          },
          update: {
            $set: {
              value: entry.value || "A",
              classId,
              subject,
              batchNumber,
              date,
            },
          },
          upsert: true,
        },
      };
    });

    const result = await collection.bulkWrite(bulkOps);

    res.status(200).json({
      message: "Performance data successfully added or updated.",
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount,
    });
  } catch (error) {
    console.error("Error in add_updatePerformance:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


const getPerformanceByClassAndSubject = async (req, res) => {
  const db = getDB();
  let { classId, subjectCode, batchNumber } = req.params;
  console.log(req.params)

  classId = classId.trim();
  subjectCode = subjectCode.trim();
  batchNumber = batchNumber.trim();

  try {
    const students = await db.collection("users").find(
      { class: classId, role: "student" },
      { projection: { name: 1, class: 1, class_roll: 1, photoURL: 1 } }
    ).toArray();

    const studentIds = students.map(s => s._id.toString());

    const performanceSummary = await db.collection("performanceInfo").aggregate([
      {
        $match: {
          classId,
          subject: subjectCode,
          batchNumber
        }
      },
      {
        $match: {
          studentId: { $in: studentIds }
        }
      },
      {
        $sort: { date: 1 }
      },
      {
        $group: {
          _id: "$studentId",
          totalTasks: { $sum: 1 },
          excellentCount: {
            $sum: { $cond: [{ $eq: ["$value", "Excellent"] }, 1, 0] }
          },
          goodCount: {
            $sum: { $cond: [{ $eq: ["$value", "Good"] }, 1, 0] }
          },
          badCount: {
            $sum: { $cond: [{ $eq: ["$value", "Bad"] }, 1, 0] }
          },
          naCount: {
            $sum: { $cond: [{ $eq: ["$value", "N/A"] }, 1, 0] }
          },
          latestEvaluation: { $last: "$value" }
        }
      }
    ]).toArray();

    const performanceMap = {};
    performanceSummary.forEach(p => {
      performanceMap[p._id] = p;
    });

    const performanceInfo = students.map(student => {
      const perf = performanceMap[student._id.toString()] || {};
      return {
        studentId: student._id,
        name: student.name,
        class_roll: student.class_roll,
        photoURL: student.photoURL,
        totalTasks: perf.totalTasks || 0,
        excellentCount: perf.excellentCount || 0,
        goodCount: perf.goodCount || 0,
        badCount: perf.badCount || 0,
        naCount: perf.naCount || 0,
        latestEvaluation: perf.latestEvaluation || "N/A"
      };
    });
    const markWeights = await db.collection("incourse_marks").aggregate([
  {
    $match: {
      classId,
      subjectCode,
      type: "performance",
      batchNumber 
    }
  },
  {
    $project: {
      _id: 0,
      markWeights: 1,
     
    }
  }
]).toArray();

    res.json({performanceInfo , markWeights });
  } catch (err) {
    console.error("Error in getPerformanceByClassAndSubject:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};



const savePerformanceInfo = async (req, res) => {
  let { classId, subjectCode, marks, fullMark, type, Number , markWeights , batchNumber , teacherId} = req.body;
  const db = getDB();
   
   classId = classId?.trim();
  subjectCode = subjectCode?.trim();
  type = type?.trim();
  batchNumber = batchNumber?.trim();
  Number = Number?.toString().trim(); 


  const filter = { classId, subjectCode, type, Number,batchNumber , teacherId}

   

  const updatedDoc = {
    $set: {
      markWeights,
      marks,
      fullMark,
      updatedAt: new Date(),
    },
    $setOnInsert: {
      createdAt: new Date(),
    },
  };

  const result = await db
    .collection("incourse_marks")
    .updateOne(filter, updatedDoc, { upsert: true });

  res.status(201).json(result);
  console.log("marks", result);
};

const getFullMarksInfo = async (req, res) => {
  const db = getDB();
  const { classId, subjectCode, Number, type } = req.body;
  console.log(req.body);
  const result = await db.collection("incourse_marks").aggregate([
    {
      $match: {
        classId,
        subjectCode,
        Number,
        type,
      },
    },
    {
      $project: {
        _id:0,
        fullMarks:1
      }
    }
  ]).toArray();
  console.log(result);
  res.json(result);
};

const performanceSummaryByStudentId = async (req, res) => {
  const db = getDB();
  const { studentid } = req.params;
  //console.log("Fetching performance summary for studentId:", studentid);
  const collection = db.collection("performanceInfo");
  try {
    const data = await collection
      .aggregate([
        {
          $match: { studentId: studentid },
        },
        {
          $group: {
            _id: "$studentId",
            totalTasks: { $sum: "$totalTasks" },
            excellent: { $sum: "$excellentCount" },
            good: { $sum: "$goodCount" },
            bad: { $sum: "$badCount" },
          },
        },
        {
          $project: {
            _id: 0,
            studentId: "$_id",
            totalTasks: 1,
            excellent: 1,
            good: 1,
            bad: 1,
            excellentPercentage: {
              $multiply: [{ $divide: ["$excellent", "$totalTasks"] }, 100],
            },
            goodPercentage: {
              $multiply: [{ $divide: ["$good", "$totalTasks"] }, 100],
            },
            badPercentage: {
              $multiply: [{ $divide: ["$bad", "$totalTasks"] }, 100],
            },
          },
        },
      ])
      .toArray();
    res.json(
      data[0] || {
        studentId: studentid,
        totalTasks: 0,
        excellent: 0,
        good: 0,
        bad: 0,
        excellentPercentage: 0,
        goodPercentage: 0,
        badPercentage: 0,
      }
    );
  } catch (err) {
    console.error("Error fetching performance summary:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
const getPerformanceById_subeject = async (req, res) => {
  const db = getDB();
  const info = req.body;
  const quary = {
    studentId: info.id,
    subject: info.subject,
  };
  const result = await db.collection("performanceInfo").find(quary).toArray();
  res.json(result[0]);
};

module.exports = {
  UpdatePerformance,
  getPerformanceByClassAndSubject,
  performanceSummaryByStudentId,
  getPerformanceById_subeject,
  savePerformanceInfo,
  getFullMarksInfo,
  add_updatePerformace
};
