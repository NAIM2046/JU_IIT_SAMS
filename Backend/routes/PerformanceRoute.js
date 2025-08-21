const express = require('express') ;
const { UpdatePerformance, getPerformanceByClassAndSubject, performanceSummaryByStudentId, getPerformanceById_subeject, savePerformanceInfo, getFullMarksInfo, add_updatePerformace } = require('../controllers/PerformanceController');
const router = express.Router() ;

router.post('/updata' ,UpdatePerformance) ;
router.get('/ByClassandSubject/:classId/:subjectCode/:batchNumber' , getPerformanceByClassAndSubject) ;
router.get('/:studentid/performance-summary' ,performanceSummaryByStudentId ) ;
router.post('/getPer_Id_subject' ,getPerformanceById_subeject) ;
router.post('/savePerformanceInfo', savePerformanceInfo);
router.post('/getFullMarksInfo', getFullMarksInfo);
router.post('/add_update' , add_updatePerformace)

module.exports = router ;