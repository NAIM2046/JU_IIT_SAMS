const  express = require('express') ;
const  {getConversation, createConversation}  = require('../controllers/MessageControllers.js');

const router = express.Router();
router.get('/allConversation/:id', getConversation);
router.post('/createConversation', createConversation);
module.exports = router;