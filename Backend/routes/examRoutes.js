const express = require('express');
const { createNewExam, updateOneStudentMarks, getCurrentExamInfo, getAllExams, deleteCurrentExamInfo, ExamSave, updataExam, getAvergeMarkById, rank_summary, monthly_update, getAllExamMarkBy_C_S_Subj, getAllSubjectMarkById, getClass_subject_performace } = require('../controllers/ExamController');
const { insertMonthlyUpdate } = require('../cron/Monthly_update');

const router = express.Router();

router.post(`/createNewExam`, createNewExam);
router.post(`/updateOneStudentMark`, updateOneStudentMarks);
router.post(`/currentExam`, getCurrentExamInfo);
router.get(`/allExams/:teacherId`, getAllExams);
router.delete('/deleteCurrentExam/:id' , deleteCurrentExamInfo) ;
router.post('/examSave' , ExamSave) ;
router.post("/updateExam" , updataExam) ;
router.get('/getAvergeMarkById/:id/:classNumber'  , getAvergeMarkById) ;
router.get('/rank_summary/:classNumber', rank_summary) ;
router.get("/monthly_update" ,insertMonthlyUpdate) // Assuming this is the correct endpoint for rank summary
router.get("/allmonth_update/:id" , monthly_update)
router.get("/getallexam_markby_id" ,getAllExamMarkBy_C_S_Subj)  
router.get("/subject-marks" , getAllSubjectMarkById) ;
router.get("/getclass_subject_performace" , getClass_subject_performace)

module.exports = router;