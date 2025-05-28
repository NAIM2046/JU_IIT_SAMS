const express = require('express');
const { createNewExam, updateOneStudentMarks, getCurrentExamInfo, getAllExams } = require('../controllers/ExamController');
const router = express.Router();

router.post(`/createNewExam`, createNewExam);
router.post(`/updateOneStudentMark`, updateOneStudentMarks);
router.post(`/currentExam`, getCurrentExamInfo);
router.get(`/allExams`, getAllExams);
module.exports = router;