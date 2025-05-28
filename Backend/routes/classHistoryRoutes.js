const express = require('express') ;
const { addClassHistory, getClassHistory } = require('../controllers/classHistroyControler');
const router = express.Router() ;
router.post('/save' , addClassHistory) ;
router.get('/byTeacher', getClassHistory) ;

module.exports = router ;