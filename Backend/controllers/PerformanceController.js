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
const performanceSummaryByStudentId = async (req , res)=>{
  const db = getDB() ; 
  const {studentid} = req.params ; 
  //console.log("Fetching performance summary for studentId:", studentid);
  const collection = db.collection("performanceInfo")  ; 
  try{
   const data = await collection.aggregate([
    {
      $match: {studentId: studentid}
    } ,
    {
      $group:{
        _id: "$studentId",
        totalTasks: {$sum: "$totalTasks"},
        excellent: {$sum: "$excellentCount"},
        good: {$sum: "$goodCount"}, 
        bad: {$sum: "$badCount"}
      }
    },
    {
      $project: {
        _id: 0 ,
        studentId: "$_id",
        totalTasks: 1, 
        excellent: 1,
        good: 1,
        bad: 1,
        excellentPercentage: {
          $multiply: [{$divide: ["$excellent" , "$totalTasks"]} , 100]
        },
        goodPercentage: {
          $multiply: [{$divide: ["$good" , "$totalTasks"]} , 100]
        },
        badPercentage: {
          $multiply: [{$divide: ["$bad" , "$totalTasks"]} , 100]
        }
        

      }
    }
   ]).toArray() ;
   res.json(data[0] || {
    studentId: studentid,
    totalTasks: 0,
    excellent: 0,
    good: 0,
    bad: 0,
    excellentPercentage: 0,
    goodPercentage: 0,
    badPercentage: 0
   }) ;
  }
  catch(err){
    console.error("Error fetching performance summary:", err);
    res.status(500).json({ error: "Internal server error" });
  }

}
const getPerformanceById_subeject = async (req , res) =>{
  const db = getDB() ;
  const info = req.body ;  
  const quary = {
    studentId: info.id ,
    subject: info.subject
  } 
  const result = await db.collection("performanceInfo").find(quary).toArray()
  res.json(result[0]) ;
}

module.exports = {
  UpdatePerformance,
    getPerformanceByClassAndSubject,
  performanceSummaryByStudentId ,
  getPerformanceById_subeject
};
