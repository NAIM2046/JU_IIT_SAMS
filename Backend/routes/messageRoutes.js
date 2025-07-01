const  express = require('express') ;
const  {getConversation, createConversation, extisingConversation}  = require('../controllers/MessageControllers.js');

const router = express.Router();
router.get('/allConversation/:id', getConversation);
router.post('/createConversation', createConversation);
router.get('/extisingConversation/:Id', extisingConversation )
module.exports = router;