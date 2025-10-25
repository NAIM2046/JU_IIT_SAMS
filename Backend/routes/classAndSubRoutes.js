const express = require('express');
const { addClassAndSub, getClassAndSub, addSubjectToClass, deleteClass, removeSubjectFromClass, getSubjectbyClass, addNewBatch, getBatch, deleteBatch, semesterUdateBatchNumber } = require('../controllers/classAndSubController');

const router = express.Router();
router.post('/addclassandsub', addClassAndSub);
router.get('/getclassandsub' , getClassAndSub) ;
router.put('/classes/:classNumber/add-subject', addSubjectToClass);
router.delete('/classes/:classNumber', deleteClass); 
router.put('/classes/:classNumber/remove-subject' , removeSubjectFromClass)
router.get("/getsubjectbyclass/:class" , getSubjectbyClass) ;

// batch management routes
router.post('/addnewbatch', addNewBatch);
router.get('/getbatch', getBatch);
router.delete('/deletebatch/:id', deleteBatch); // Assuming batchNumber is passed as a URL parameter
router.post('/update-running-batches' ,semesterUdateBatchNumber) ;


 
module.exports = router;