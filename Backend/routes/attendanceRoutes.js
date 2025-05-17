const express = require('express');
const { addInitialAttendanceInfo, updateAllAttendance, classNumberUpdate, getAttendanceByDateAndSubject } = require('../controllers/dailyUpdateController');
const router = express.Router();

router.post('/initialAttendanceInfo/:id', addInitialAttendanceInfo);
router.post('/updateAllAttendance', updateAllAttendance);
router.post('/classNumberUpdate', classNumberUpdate);
router.post('/getAttendanceByDateAndSubject', getAttendanceByDateAndSubject)
module.exports =  router;