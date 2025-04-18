const express = require('express');
const { addSchedule, getSchedule } = require('../controllers/scheduleController');
const router = express.Router();
router.post('/addschedule' , addSchedule) ;
router.get('/getschedule' , getSchedule) ;

module.exports = router;