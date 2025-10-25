const express = require('express');
const { addSchedule, getSchedule, getAllSchedule, deleteSchedule, updateSchedule, getteacherSchedule, updatedActiveStatus } = require('../controllers/scheduleController');
const router = express.Router();
router.post('/addschedule' , addSchedule) ;
router.get('/getschedule/:classNumber' , getSchedule) ;
router.get('/getallschedule' , getAllSchedule) ;
router.delete("/deleteschedule/:scheduleId", deleteSchedule)
router.put("/updateschedule/:scheduleId", updateSchedule) ; // Assuming you have an updateSchedule function defined
router.get("/getteacherschedule/:teacherName" , getteacherSchedule)
router.put("/updateactivestatus" , updatedActiveStatus);

module.exports = router;