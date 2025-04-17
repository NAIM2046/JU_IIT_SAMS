const express = require('express');
const { loginUser, AddUser } = require('../controllers/authController.js');
const router = express.Router();

router.post('/login', loginUser);
router.post('/adduser' , AddUser) ;

module.exports = router;
