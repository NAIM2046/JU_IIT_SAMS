import express from 'express';
import getConversation  from '../controllers/MessageControllers.js';

const router = express.Router();
router.get('/allConversation/:id', getConversation);
export default router;