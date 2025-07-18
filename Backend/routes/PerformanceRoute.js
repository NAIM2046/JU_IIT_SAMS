const express = require('express') ;
const { UpdatePerformance, getPerformanceByClassAndSubject, performanceSummaryByStudentId, getPerformanceById_subeject, savePerformanceInfo, getFullMarksInfo } = require('../controllers/PerformanceController');
const router = express.Router() ;

router.post('/updata' ,UpdatePerformance) ;
router.get('/ByClassandSubject/:classId/:subjectCode' , getPerformanceByClassAndSubject) ;
router.get('/:studentid/performance-summary' ,performanceSummaryByStudentId ) ;
router.post('/getPer_Id_subject' ,getPerformanceById_subeject) ;
router.post('/savePerformanceInfo', savePerformanceInfo);
router.post('/getFullMarksInfo', getFullMarksInfo);

module.exports = router ;