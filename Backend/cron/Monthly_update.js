const cron = require("node-cron") ; 
const { getDB} = require("../config/db") ;




const insertMonthlyUpdate = async () => {
  try {
    const db = getDB();
    const examCol = db.collection("examHistory");
    const targetCol = db.collection("month_performance_update");

    const pipeline = [
      { $unwind: "$studentsInfo" },
      {
        $project: {
          class: 1,
          studentId: "$studentsInfo.studentId",
          studentName: "$studentsInfo.Name",
          marks: { $toInt: "$studentsInfo.marks" },
          totalMark: { $toInt: "$totalMark" }
        }
      },
      {
        $group: {
          _id: {
            class: "$class",
            studentId: "$studentId",
            studentName: "$studentName"
          },
          totalgetMarks: { $sum: "$marks" },
          totalfullMarks: { $sum: "$totalMark" }
        }
      },
      {
        $project: {
          class: "$_id.class",
          studentId: "$_id.studentId",
          studentName: "$_id.studentName",
          totalgetMarks: 1,
          totalfullMarks: 1,
          _id: 0
        }
      },
      {
        $setWindowFields: {
          partitionBy: "$class",
          sortBy: { totalgetMarks: -1 },
          output: {
            rank: { $rank: {} }
          }
        }
      },
      {
        $addFields: {
           // month:"February",
           month: { $dateToString: { format: "%B", date: "$$NOW" } },
          year: { $year: "$$NOW" },
          createAt: "$$NOW"
        }
      }
    ];

    const result = await examCol.aggregate(pipeline).toArray();

    // Manually upsert each result
    for (const doc of result) {
      await targetCol.updateOne(
        {
          class: doc.class,
          studentId: doc.studentId,
          month: doc.month,
          year: doc.year
        },
        { $set: doc },
        { upsert: true }
      );
    }

    console.log(`✅ Monthly update inserted/updated ${result.length} records successfully.`);
  } catch (error) {
    console.error("❌ Error in manual upsert logic:", error);
  }
};

function isLastDayOfMonth() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  return tomorrow.getDate() === 1;
}

const startCronJobUpdata = ()=>{
     cron.schedule("59 23 * * *" , async () =>{
    if (isLastDayOfMonth()) {
      await insertMonthlyUpdate();
    } else {
      console.log("Today is not the last day of the month. Skipping monthly update.");
    }
  })
  }
module.exports = { startCronJobUpdata, insertMonthlyUpdate } ;