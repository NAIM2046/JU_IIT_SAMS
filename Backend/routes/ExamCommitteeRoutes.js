const express = require('express');
const { add_update_exam_committee, getCommittee, deleteCommittee, getTeacherInvolvementCommittee, examiner_Add_Update, getExaminerall, getCommitteeDetails, updateExaminerStatus, getAteacher1st_2nd_3rdExaminersubjectList } = require('../controllers/ExamCommitteeController');
const router = express.Router() ;
router.post('/add_update_exam_committee', add_update_exam_committee);
router.get('/getCommittee/:classId/:batchNumber', getCommittee);
router.delete('/deleteCommitte/:id' , deleteCommittee)
router.get('/getTeacherInvolvementCommittee/:teacherId' , getTeacherInvolvementCommittee)
router.post('/examiner_Add_Update', examiner_Add_Update)
router.get('/getExaminerall/:classId/:batchNumber' , getExaminerall) ;

router.get('/getAteacher1st_2nd_3rdExaminersubjectList/:teacherId/:examinerType' , getAteacher1st_2nd_3rdExaminersubjectList)
router.get("/getCommitteeDetails/:committeeId",getCommitteeDetails );
router.patch("/updateExaminerStatus/:id" , updateExaminerStatus)
module.exports = router;