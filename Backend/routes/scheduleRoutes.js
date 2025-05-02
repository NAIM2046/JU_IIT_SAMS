const express = require('express');
const { addSchedule, getSchedule, getAllSchedule } = require('../controllers/scheduleController');
const router = express.Router();
router.post('/addschedule' , addSchedule) ;
router.get('/getschedule/:classNumber' , getSchedule) ;
router.get('/getallschedule' , getAllSchedule) ;

module.exports = router;