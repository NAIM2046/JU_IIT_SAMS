const express = require('express');
const { addInitialAttendanceInfo, updateAllAttendance, classNumberUpdate } = require('../controllers/dailyUpdateController');
const router = express.Router();

router.post('/initialAttendanceInfo/:id', addInitialAttendanceInfo);
router.post('/updateAllAttendance', updateAllAttendance);
router.post('/classNumberUpdate', classNumberUpdate);
module.exports =  router;