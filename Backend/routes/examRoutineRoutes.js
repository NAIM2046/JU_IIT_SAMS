const express = require('express');
const { exam_routine_add_update, get_exam_routines } = require('../controllers/ExamRoutineController');
const router = express.Router();

router.post("/add_update" ,exam_routine_add_update ) 
router.get("/get/:classId/:batchNumber" , get_exam_routines)
 




module.exports = router;