const express = require('express'); 
const { add_update_Question_Tamplate, get_question_template, get_students_mark ,updata_students_marks, get1stand2ndExaminerFinalMarks, getDiffStudentsBySubject } = require('../controllers/FinalMarkController');
const router = express.Router() ;
 
router.post('/add_update_Question_Tamplate' , add_update_Question_Tamplate)
router.get('/get_question_template/:classId/:subject/:batchNumber' , get_question_template)
router.get('/get_students_mark/:classId/:subject/:batchNumber/:examiner' , get_students_mark)

router.post('/updata_students_marks' , updata_students_marks)
router.get("/get1stand2ndExaminerFinalMarks/:classId/:batchNumber/:subject" , get1stand2ndExaminerFinalMarks)
router.get("/getDiffStudentsBySubject/:classId/:batchNumber" , getDiffStudentsBySubject)

module.exports = router ;