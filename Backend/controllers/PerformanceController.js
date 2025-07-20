const { getDB } = require("../config/db.js");
require("dotenv").config();

const UpdatePerformance = async (req, res) => {
  const db = getDB();
  const { className, subject, studentId, evaluation } = req.body;
  const performanceInfo = db.collection("performanceInfo");

  const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD

  try {
    const existing = await performanceInfo.findOne({
      class: className,
      subject: subject,
      studentId: studentId,
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
        studentId,

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
};


const getPerformanceByClassAndSubject = async (req, res) => {
  const db = getDB();
  const { classId, subjectCode } = req.params;

  try {
    const performanceInfo = await db
      .collection("users")
      .aggregate([
        {
          $match: {
            class: classId,
            role: "student", // ✅ ensure only students
          },
        },
        {
          $lookup: {
            from: "performanceInfo",
            let: {
              studentId: { $toString: "$_id" },
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$studentId", "$$studentId"] },
                      { $eq: ["$subject", subjectCode] }, // ✅ dynamic subject match
                    ],
                  },
                },
              },
            ],
            as: "performanceRecords", // ✅ must match in next stage
          },
        },
        {
          $addFields: {
            performance: { $arrayElemAt: ["$performanceRecords", 0] }, // ✅ fixed this name
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            class: 1,
            subject: subjectCode,
            totalTasks: { $ifNull: ["$performance.totalTasks", 0] },
            excellentCount: { $ifNull: ["$performance.excellentCount", 0] },
            goodCount: { $ifNull: ["$performance.goodCount", 0] },
            badCount: { $ifNull: ["$performance.badCount", 0] },
            latestEvaluation: { $ifNull: ["$performance.latestEvaluation", "N/A"] },
          },
        },
      ])
      .toArray();
     const studentIds = performanceInfo.map(student => student._id.toString());

const markWeights = await db.collection("incourse_marks").aggregate([
  {
    $match: {
      classId,
      subjectCode,
      type: "performance",
      "marks.studentId": { $in: studentIds }
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
    console.error("Error fetching performance records:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


const savePerformanceInfo = async (req, res) => {
  const { classId, subjectCode, marks, fullMark, type, Number , markWeights} = req.body;
  const db = getDB();

const users = await db.collection("users").find({ class: classId, role: "student" }).toArray();
 const studentIds = users.map(user => user._id.toString());
  const filter = { classId, subjectCode, type, Number, $or: [
      { marks: { $elemMatch: { studentId: { $in: studentIds } } } },
      { marks: { $exists: false } } ]}

   

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
};
