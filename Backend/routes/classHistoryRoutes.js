const express = require('express') ;
const { addClassHistory, getClassHistory, class_on_off_status, getclass_on_off_status } = require('../controllers/classHistroyControler');
const router = express.Router() ;
router.post('/save' , addClassHistory) ;
router.get('/byTeacher', getClassHistory) ;
router.post('/class-on-off-status' , class_on_off_status) ;
router.get('/class-on-off-status', getclass_on_off_status);

module.exports = router ;