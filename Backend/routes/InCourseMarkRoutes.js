const express = require('express'); 
const {  otherTaskMarkSummary, otherTaskList, backEidteFromate, finalMarkSummary, deleteTask, add_update_incourse_Mark } = require('../controllers/IncourseMarkController');
const router = express.Router() ;
router.post('/add_update_incourse_Mark', add_update_incourse_Mark );
router.get('/otherTaskMarkSummary/:classId/:task_type/:subject/:batchNumber' , otherTaskMarkSummary) ;
router.get('/otherTaskList/:classId/:task_type/:subject' , otherTaskList) 
router.get("/edittaske/:id" , backEidteFromate) ;
router.get('/finalincouremark/:classId/:subjectCode/:batchNumber' , finalMarkSummary) ;
router.delete('/deleteTask/:id' , deleteTask);



module.exports = router ;