const express = require('express'); 
const { addAttendanceMark, otherTaskMarkSummary } = require('../controllers/IncourseMarkController');
const router = express.Router() ;
router.post('/addAttendanceMark', addAttendanceMark) ;
router.get('/otherTaskMarkSummary/:classId/:task_type/:subject' , otherTaskMarkSummary) ;



module.exports = router ;