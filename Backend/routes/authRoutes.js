const express = require('express');
const { loginUser, SignUp } = require('../controllers/authController.js');
const router = express.Router();

router.post('/login', loginUser);
router.post('/signup' , SignUp) ;

module.exports = router;
