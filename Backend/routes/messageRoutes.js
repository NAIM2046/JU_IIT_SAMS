const  express = require('express') ;
const  {getConversation, createConversation, extisingConversation, sendMessage, getMessages}  = require('../controllers/MessageControllers.js');

const router = express.Router();
router.get('/allConversation/:id', getConversation);
router.post('/createConversation', createConversation);
router.get('/extisingConversation/:Id', extisingConversation );
router.post('/sendMessage', sendMessage);
router.get("/getMessages/:roomId" , getMessages) ;
module.exports = router;