const  express = require('express') ;
const  {getConversation}  = require('../controllers/MessageControllers.js');

const router = express.Router();
router.get('/allConversation/:id', getConversation);
module.exports = router;