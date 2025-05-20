const { getDB } = require("../config/db.js");
require("dotenv").config();

const UpdatePerformance = async (req, res) => {
  const db = getDB();
  const { className, subject, studentId, studentName, evaluation } = req.body;
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
      const totalTasks = existing.totalTasks||0 ;

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
          return res.status(200).json({ message: "No update needed" , totalTasks });
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

      await performanceInfo.updateOne(
        { _id: existing._id },
        updateOps
      );

      res.status(200).json({ message: "Performance updated" , totalTasks :today==existing.lastUpdated ? totalTasks : totalTasks + 1 ,  });
    } else {
      // Create new performance document
      const newDoc = {
        studentId,
        studentName,
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
      res.status(201).json({ message: "Performance record created"  , totalTasks: 1 });
    }
  } catch (err) {
    console.error("Error updating performance:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
const getPerformanceByClassAndSubject = async (req, res) => {
  const db = getDB();
  const { className, subject } = req.params;

  try {
    const performanceRecords = await db
      .collection("performanceInfo")
      .find({ class: className, subject: subject })
      .toArray();

    if (!performanceRecords || performanceRecords.length === 0) {
      return res.status(404).json({ message: "No performance records found" });
    }

    res.json(performanceRecords);
  } catch (err) {
    console.error("Error fetching performance records:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  UpdatePerformance,
    getPerformanceByClassAndSubject,
};
