const  express = require('express') ;
const  {getConversation, createConversation, extisingConversation, sendMessage}  = require('../controllers/MessageControllers.js');

const router = express.Router();
router.get('/allConversation/:id', getConversation);
router.post('/createConversation', createConversation);
router.get('/extisingConversation/:Id', extisingConversation );
router.post('/sendMessage', sendMessage);
module.exports = router;