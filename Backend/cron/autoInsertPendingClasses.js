const cron = require("node-cron");
const { getDB } = require("../config/db");

const insertPendingClasses = async () => {
  try {
    const db = getDB();
    const scheduleCol = db.collection("schedules");
    const historyCol = db.collection("classHistory");

    const today = new Date();
   const day = today.toLocaleString("en-US", { weekday: "long" });
   console.log("Today is:", day);
    const  collection = db.collection("Status");
    const class_on_off = await collection.findOne({ name: "classStatus" });
    if (class_on_off.status === "off") {
      console.log("Class is off today. No pending classes inserted.");
      return;
    }

 // e.g., "Tuesday"
    const formattedDate = `${String(today.getDate()).padStart(2, "0")}${String(
      today.getMonth() + 1
    ).padStart(2, "0")}${today.getFullYear()}`; // e.g., "21052025"

    const schedules = await scheduleCol.find().toArray();
    console.log(schedules) ;

    for (const schedule of schedules) {
      
      if (schedule.day !== day || !schedule.active) continue; // Only process today's schedule and active ones

      const exists = await historyCol.findOne({
          classId: schedule.classId,
          subject: schedule.subject.code,
          teacherName: schedule.teacherName,
          date: formattedDate,
          batchNumber: schedule.batchNumber
        });
      
        if (!exists) {
          await historyCol.insertOne({
            classId: schedule.classId,
            subject: schedule.subject.code,
            teacherName: schedule.teacherName,
            subjectName: schedule.subject.name,
            teacherId: schedule.teacherId,
            batchNumber: schedule.batchNumber ,
            date: formattedDate,
            type: schedule.subject.type,
            status: "pending",
            totalStudents: 0,
            totalPresent: 0,
            totalAbsent: 0,
          });

          console.log(`📌 Pending saved for: ${schedule.classId} - ${schedule.subject} - ${schedule.teacherName}`);
        }
      
    }

    console.log("✅ Cron job finished: Pending classes inserted.");
  } catch (error) {
    console.error("❌ Error in cron job:", error);
  }
};

// Run daily at 4:04 PM
const startCronJob = () => {
  cron.schedule("04 16 * * *", insertPendingClasses);
};

module.exports = startCronJob;
