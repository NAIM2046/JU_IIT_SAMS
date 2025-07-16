const express = require('express'); 
const { addAttendanceMark, otherTaskMarkSummary, otherTaskList, backEidteFromate, finalMarkSummary } = require('../controllers/IncourseMarkController');
const router = express.Router() ;
router.post('/addAttendanceMark', addAttendanceMark) ;
router.get('/otherTaskMarkSummary/:classId/:task_type/:subject' , otherTaskMarkSummary) ;
router.get('/otherTaskList/:classId/:task_type/:subject' , otherTaskList) 
router.get("/edittaske/:id" , backEidteFromate) ;
router.get('/finalincouremark/:classId/:subjectCode' , finalMarkSummary) ;



module.exports = router ;