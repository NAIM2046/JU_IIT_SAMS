const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db.js');
require('dotenv').config();

const addSchedule = async (req, res) => {
  const schedule = req.body;
  const db = getDB();

  try {
    
    const result = await db.collection('schedules').insertOne(schedule);
    res.status(201).json({
      schedule: {
        _id: result.insertedId,
        ...schedule
      },
      message: 'Schedule added successfully'
    }

  
    );
     
  } catch (error) {
    console.error('Error adding schedule:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}


const getSchedule = async (req, res) => {
    const db = getDB();
    const { classNumber } = req.params; // Assuming classNumber is passed as a URL parameter
    console.log("Class number:", classNumber); // Debugging line
    try {
      const quary =  { classId: classNumber };
      const schedule = await db.collection('schedules').find(quary).toArray();
      res.status(200).json(schedule);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
  const getAllSchedule = async (req, res) => {
    const db = getDB();
    try {
      const schedule = await db.collection('schedules').find({}).toArray();
      res.status(200).json(schedule);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
  const deleteSchedule = async (req, res) => {
    const db = getDB();
    const { scheduleId } = req.params; // Assuming scheduleId is passed as a URL parameter
    try {
      const result = await db.collection('schedules').deleteOne({ _id: new ObjectId(scheduleId) });
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Schedule not found' });
      }
      res.status(200).json({ message: 'Schedule deleted successfully' });
    } catch (error) {
      console.error('Error deleting schedule:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
  const updateSchedule = async (req, res) => {
    const db = getDB();
    const { scheduleId } = req.params;
     // Assuming scheduleId is passed as a URL parameter
     const schedule = req.body;
      // The updated schedule data
      console.log(schedule) ;
    const updatedData = req.body; // The updated schedule data
     delete updatedData._id; // Remove _id if it's included in the request body
    try {
      const result = await db.collection('schedules').updateOne(
        { _id: new ObjectId(scheduleId) },
        { $set: updatedData }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Schedule not found' });
      }

      res.status(200).json({ message: 'Schedule updated successfully' , schedule:{...schedule , _id:scheduleId} });
    } catch (error) {
      console.error('Error updating schedule:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

 const getteacherSchedule = async (req, res) => {
  const db = getDB();
  const { teacherName } = req.params;

  if (!teacherName) {
    return res.status(400).json({ error: "teacherName is required" });
  }

  const scheduleCol = db.collection("schedules");

  const pipeline = [
    {
      $match: {
        teacherName: teacherName
      }
    },
    {
      $group: {
        _id: {
          classId: "$classId",
          batchNumber: "$batchNumber"
        },
        subjects: { $addToSet: "$subject" }
      }
    },
    {
      $project: {
        _id: 0,
        classId: "$_id.classId",
        batchNumber: "$_id.batchNumber",
        subjects: 1
      }
    }
  ];

  const result = await scheduleCol.aggregate(pipeline).toArray();
  res.json(result);
};

const updatedActiveStatus = async (req, res) => {
  const db = getDB();
  const { teacherId , courseCode , status} = req.body;
  console.log(req.body) ;
  if (!teacherId || !courseCode || typeof status !== 'boolean') {
    return res.status(400).json({ message: 'Invalid input data' });
  }
  try {
    const result = await db.collection('schedules').updateMany(
      { teacherId: teacherId , "subject.code": courseCode },
      { $set: { active: status } }
    );

    res.status(200).json({ message: 'Schedule updated successfully', result });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { addSchedule , getSchedule , getAllSchedule , deleteSchedule , updateSchedule  , getteacherSchedule , updatedActiveStatus };
