const  express = require('express') ;
const  {getConversation, createConversation, extisingConversation, sendMessage, getMessages, sendFileMessage, getTotalunseenMessage, getIndividualUnseenMessage, updateSeenInfo}  = require('../controllers/MessageControllers.js');
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });
const router = express.Router();
router.post("/sendFileMessage", upload.single("file"), sendFileMessage);


router.get('/allConversation/:id', getConversation);
router.post('/createConversation', createConversation);
router.get('/extisingConversation/:Id', extisingConversation );
router.post('/sendMessage', sendMessage);
router.get("/getMessages/:roomId" , getMessages) ;
router.get('/getTotalunseenMessage/:userId', getTotalunseenMessage) ; 
router.get('/getIndividualUnseenMessage/:userId', getIndividualUnseenMessage) ; 
router.post('/updateSeenInfo', updateSeenInfo);

module.exports = router;