const express = require('express');
const { getAttendancebyClass_sub_data, setAttendanceDefault, updataAttendanceSingle, getAttendanceByStudentId, getAttendanceByStd_subject, getAttendanceHistory,  } = require('../controllers/dailyUpdateController');

const router = express.Router();

router.get('/check/:class/:subject/:date' , getAttendancebyClass_sub_data) ;
router.post('/set-default' , setAttendanceDefault) ; 
router.post('/update-single' , updataAttendanceSingle) ;
router.get('/getAttendanceBy_id/:id' , getAttendanceByStudentId) ;
router.post("/getAttendancebystdId_subject" ,getAttendanceByStd_subject) ;
router.get('/getAttendanceByStd_subject/:class/:subject' , getAttendanceByStd_subject) ;
router.get('/getAttendanceHistory/:studentId/:className', getAttendanceHistory);

module.exports =  router;