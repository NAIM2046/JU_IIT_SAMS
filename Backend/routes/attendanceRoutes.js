const express = require('express');
const { getAttendancebyClass_sub_data, setAttendanceDefault, updataAttendanceSingle, getAttendanceByStudentId, getAttendanceByStd_subject, getAttendanceHistory, getAttendanceAsubject, getAttendanceSummary, getAttendanceHistoryBY_class_subject, getAttendanceAndPreformaceByAClass, attendanceAddandUpdate, getAttendanceForStudent,  } = require('../controllers/dailyUpdateController');

const router = express.Router();

router.get('/check/:class/:subject/:date' , getAttendancebyClass_sub_data) ;
router.post('/set-default' , setAttendanceDefault) ; 
router.post('/update-single' , updataAttendanceSingle) ;
router.get('/getAttendanceBy_id/:id' , getAttendanceByStudentId) ;
router.post("/getAttendancebystdId_subject" ,getAttendanceByStd_subject) ;
router.get('/getAttendanceByStd_subject/:class/:subject' , getAttendanceByStd_subject) ;
router.get('/getAttendanceHistory/:studentId/:className', getAttendanceHistory);
router.get('/getAttendanceSummary/:classId/:subject/:batchNumber' , getAttendanceSummary) ;
router.get("/getAttendanceHistoryBY_class_subject/:classId/:subject/:batchNumber", getAttendanceHistoryBY_class_subject);
router.get("/getAttendacneAndPerformanceByClass/:classId/:batchNumber/:subject/:date" , getAttendanceAndPreformaceByAClass) 
router.post('/add_update' , attendanceAddandUpdate) ,
router.get('/getAttendanceForStudent/:studentId/:classId/:subject' , getAttendanceForStudent) ;
module.exports =  router;