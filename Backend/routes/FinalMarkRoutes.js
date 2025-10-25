const express = require('express'); 
const { add_update_Question_Tamplate, get_question_template, get_students_mark ,updata_students_marks, getDiffStudentsBySubject, get1st_2nd_3rd_ExaminerFinalMarks, updateExamCommiteFinalMark } = require('../controllers/FinalMarkController');
const router = express.Router() ;
 
router.post('/add_update_Question_Tamplate' , add_update_Question_Tamplate)
router.get('/get_question_template/:classId/:subject/:batchNumber' , get_question_template)
router.get('/get_students_mark/:classId/:subject/:batchNumber/:examiner' , get_students_mark)

router.post('/updata_students_marks' , updata_students_marks)
router.get("/get1st_2nd_3rd_ExaminerFinalMarks/:classId/:batchNumber/:subject",get1st_2nd_3rd_ExaminerFinalMarks)
router.get("/getDiffStudentsBySubject/:classId/:batchNumber" , getDiffStudentsBySubject)
router.post("/updateExamCommiteFinalMark" , updateExamCommiteFinalMark)

module.exports = router ;