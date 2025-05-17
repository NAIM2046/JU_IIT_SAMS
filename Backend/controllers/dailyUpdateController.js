const { getDB } = require("../config/db.js");
require("dotenv").config();


const updateAttendanceAndGetStatus = async (req, res) => {
  const db = getDB();
  const addDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = today.getFullYear();
    const finalDate = day + month + year;
    return finalDate;
  }
  
  const {className, subject} = req.body;
  const filter  = {class:className, subject: subject, date:addDate()};
  const exists = await db.collection('attendanceInfo').findOne(filter);

  if(exists){
    console.log("sort");
    const records = exists.records;
    console.log(exists);
    records.sort((a, b) => parseInt(a.roll)-parseInt(b.roll));
    res.send(records);
    return;
  }

  const students = await db.collection('users').find({class:className}).toArray();
  const records = students.map(item => ({
    studentId: item._id,
    roll: parseInt(item.roll),
    status: 'P'
  }))

  records.sort((a, b) => a.roll - b.roll);

  const newAttendance = {
    date: addDate(),
    class: className,
    subject: subject,
    records
  }

  const result = await db.collection('attendanceInfo').insertOne(newAttendance);
  res.send({message: "Updated Successfully", records})
}

module.exports = {
  updateAttendanceAndGetStatus,
};
