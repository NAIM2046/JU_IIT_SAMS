const express = require('express');
const { updateAttendanceAndGetStatus } = require('../controllers/dailyUpdateController');
const router = express.Router();

router.post('/updateAttendanceAndGetStatus', updateAttendanceAndGetStatus);
module.exports =  router;