const { getDB } = require('../config/db.js');
require('dotenv').config();

const updateAttendance = async (req, res) => {
    const db = getDB();
    try {
        const studentIds = req.body.studentIds;
        const status = req.body.status;
        console.log(req.body);
    
        // // Validate input
        // if (!Array.isArray(studentIds) {
        //   return res.status(400).json({ message: 'studentIds must be an array' });
        // }
        // if (!['present', 'absent'].includes(status)) {
        //   return res.status(400).json({ message: 'Status must be "present" or "absent"' });
        // }
    
        // Prepare the update operation
        const attendanceRecord = {
          date: new Date(),
          status
        };
    
        const updateDoc = {
          $push: { attendanceList: attendanceRecord }
        };

        if (status === 'P') {
            updateDoc.$inc = { totalPresent: 1 };
          }
      
          // Perform bulk update
          const result = await db.collection('attendanceInfo').updateMany(
            { id: { $in: studentIds } },
            updateDoc
          );
      
          res.json({
            success: true,
            message: `Updated ${result.modifiedCount} students`,
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount
          });
      
        } catch (error) {
          console.error('Error in bulk attendance update:', error);
          res.status(500).json({
            success: false,
            message: 'Failed to update attendance',
            error: error.message
          });
        }
}

const addInitialAttendanceInfo = async(req, res) => {
    const db = getDB();
    const id = req.params.id;
    console.log(id);
    const attendanceInfo = {
       id,
       attendanceList: [],
       totalPresent: 0,
    }
    try{
        const result = await db.collection('attendanceInfo').insertOne(attendanceInfo);
        res.status(200).json({message: "Initial Data Inserted Successfully."})
    }catch(error){
        console.log("Initial Attendance Error", error);
    }
}


module.exports = {
    addInitialAttendanceInfo,
    updateAttendance,
}