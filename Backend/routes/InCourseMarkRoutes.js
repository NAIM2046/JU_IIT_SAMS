const express = require('express'); 
const { addAttendanceMark } = require('../controllers/IncourseMarkController');
const router = express.Router() ;
router.post('/addAttendanceMark', addAttendanceMark) ;



module.exports = router ;