const express = require('express');
const { getAttendancebyClass_sub_data, setAttendanceDefault, updataAttendanceSingle, getAttendanceByStudentId,  } = require('../controllers/dailyUpdateController');

const router = express.Router();

router.get('/check/:class/:subject/:date' , getAttendancebyClass_sub_data) ;
router.post('/set-default' , setAttendanceDefault) ; 
router.post('/update-single' , updataAttendanceSingle) ;
router.get('/getAttendanceBy_id/:id' , getAttendanceByStudentId) ;
module.exports =  router;