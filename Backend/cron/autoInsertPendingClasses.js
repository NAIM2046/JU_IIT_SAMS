const cron = require("node-cron");
const { getDB } = require("../config/db");

const insertPendingClasses = async () => {
  try {
    const db = getDB();
    const scheduleCol = db.collection("schedules");
    const historyCol = db.collection("classHistory");

    const today = new Date();
    const day = today.toLocaleDateString("en-US", { weekday: "long" }); // e.g., "Tuesday"
    const formattedDate = `${String(today.getDate()).padStart(2, "0")}${String(
      today.getMonth() + 1
    ).padStart(2, "0")}${today.getFullYear()}`; // e.g., "21052025"

    const schedules = await scheduleCol.find().toArray();
    console.log(schedules) ;

    for (const schedule of schedules) {
      const timeSlots = schedule.timeSlots || [];
      const daySchedule = schedule.schedule?.[day];
      if (!daySchedule) continue;

      for (const timeSlot of timeSlots) {
        const slot = daySchedule[timeSlot];
        if (!slot || !slot.teacher || !slot.subject || !slot.class) continue;
    
        const exists = await historyCol.findOne({
          className: slot.class,
          subject: slot.subject,
          teacherName: slot.teacher,
          date: formattedDate,
        });
      
        if (!exists) {
          await historyCol.insertOne({
            className: slot.class,
            subject: slot.subject,
            teacherName: slot.teacher,
            date: formattedDate,
            status: "pending",
            totalStudents: 0,
            totalPresent: 0,
            totalAbsent: 0,
          });

          console.log(`📌 Pending saved for: ${slot.class} - ${slot.subject} - ${slot.teacher}`);
        }
      }
    }

    console.log("✅ Cron job finished: Pending classes inserted.");
  } catch (error) {
    console.error("❌ Error in cron job:", error);
  }
};

// Run daily at 11:59 PM
const startCronJob = () => {
  cron.schedule("15 21 * * *", insertPendingClasses);
};

module.exports = startCronJob;
