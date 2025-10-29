const express = require('express'); 
const { getFinalResults, final_mark_insert, getFinalResultsAstudent, getFailSubjects } = require('../controllers/FinalResultController');
const router = express.Router();

router.get('/getFinalResults/:classId/:batchNumber', getFinalResults);
router.post('/finalMarkInsert', final_mark_insert);
router.get('/getFinalResultsAstudent/:studentId/:classId', getFinalResultsAstudent);
router.get('/getFailSubjects/:studentId', getFailSubjects);

module.exports = router;
