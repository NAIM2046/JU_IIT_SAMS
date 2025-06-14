const express = require('express');
const { addClassAndSub, getClassAndSub, addSubjectToClass, deleteClass, removeSubjectFromClass, getSubjectbyClass } = require('../controllers/classAndSubController');
const router = express.Router();
router.post('/addclassandsub', addClassAndSub);
router.get('/getclassandsub' , getClassAndSub) ;
router.put('/classes/:classNumber/add-subject', addSubjectToClass);
router.delete('/classes/:classNumber', deleteClass); 
router.put('/classes/:classNumber/remove-subject' , removeSubjectFromClass)// Assuming you have a deleteClass function in 
// your controller
router.get("/getsubjectbyclass/:class" , getSubjectbyClass) ;
 
module.exports = router;