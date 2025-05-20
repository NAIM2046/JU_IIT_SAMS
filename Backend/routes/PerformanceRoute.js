const express = require('express') ;
const { UpdatePerformance, getPerformanceByClassAndSubject } = require('../controllers/PerformanceController');
const router = express.Router() ;

router.post('/updata' ,UpdatePerformance) ;
router.get('/ByClassandSubject/:className/:subject' , getPerformanceByClassAndSubject) ;

module.exports = router ;