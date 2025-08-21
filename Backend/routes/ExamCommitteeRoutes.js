const express = require('express');
const { add_update_exam_committee, getCommittee, deleteCommittee, getTeacherInvolvementCommittee, examiner_Add_Update, getExaminerall, getAteacher2ndExaminersubjectList, getAteacher3rdExaminersubjectList } = require('../controllers/ExamCommitteeController');
const router = express.Router() ;
router.post('/add_update_exam_committee', add_update_exam_committee);
router.get('/getCommittee/:classId/:batchNumber', getCommittee);
router.delete('/deleteCommitte/:id' , deleteCommittee)
router.get('/getTeacherInvolvementCommittee/:teacherId' , getTeacherInvolvementCommittee)
router.post('/examiner_Add_Update', examiner_Add_Update)
router.get('/getExaminerall/:classId/:batchNumber' , getExaminerall) ;
router.get('/getAteacher2ndExaminersubjectList/:teacherId' , getAteacher2ndExaminersubjectList)
router.get('/getAteacher3rdExaminersubjectList/:teacherId' , getAteacher3rdExaminersubjectList);
module.exports = router;