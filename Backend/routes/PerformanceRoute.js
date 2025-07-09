const express = require('express') ;
const { UpdatePerformance, getPerformanceByClassAndSubject, performanceSummaryByStudentId, getPerformanceById_subeject, savePerformanceInfo } = require('../controllers/PerformanceController');
const router = express.Router() ;

router.post('/updata' ,UpdatePerformance) ;
router.post('/ByClassandSubject' , getPerformanceByClassAndSubject) ;
router.get('/:studentid/performance-summary' ,performanceSummaryByStudentId ) ;
router.post('/getPer_Id_subject' ,getPerformanceById_subeject) ;
router.post('/savePerformanceInfo', savePerformanceInfo);

module.exports = router ;