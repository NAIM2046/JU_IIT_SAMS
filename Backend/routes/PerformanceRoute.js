const express = require('express') ;
const { UpdatePerformance, getPerformanceByClassAndSubject, performanceSummaryByStudentId, getPerformanceById_subeject } = require('../controllers/PerformanceController');
const router = express.Router() ;

router.post('/updata' ,UpdatePerformance) ;
router.get('/ByClassandSubject/:className/:subject' , getPerformanceByClassAndSubject) ;
router.get('/:studentid/performance-summary' ,performanceSummaryByStudentId ) ;
router.post('/getPer_Id_subject' ,getPerformanceById_subeject) ;

module.exports = router ;