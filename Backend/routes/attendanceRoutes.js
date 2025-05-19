const express = require('express');
const { getAttendancebyClass_sub_data, setAttendanceDefault, updataAttendanceSingle,  } = require('../controllers/dailyUpdateController');

const router = express.Router();

router.get('/check/:class/:subject/:date' , getAttendancebyClass_sub_data) ;
router.post('/set-default' , setAttendanceDefault) ; 
router.post('/update-single' , updataAttendanceSingle) ;
module.exports =  router;