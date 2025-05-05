const express = require('express');
const { addInitialAttendanceInfo, updateAttendance } = require('../controllers/dailyUpdateController');
const router = express.Router();

router.post('/initialAttendanceInfo/:id', addInitialAttendanceInfo);
router.post('/updateAllAttendance', updateAttendance);
module.exports =  router;