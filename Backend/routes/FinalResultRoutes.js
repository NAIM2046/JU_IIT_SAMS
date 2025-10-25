const express = require('express'); 
const { getFinalResults, final_mark_insert } = require('../controllers/FinalResultController');
const router = express.Router();

router.get('/getFinalResults/:classId/:batchNumber', getFinalResults);
router.post('/finalMarkInsert', final_mark_insert);

module.exports = router;
