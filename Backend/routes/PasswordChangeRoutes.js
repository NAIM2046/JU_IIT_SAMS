const express = require('express');
const { PasswordChangeController, forgetPassword, resetPassword } = require('../controllers/PasswordChangeController');

const router = express.Router();
router.put('/changePassword/:id', PasswordChangeController);
router.post('/forgetPassword', forgetPassword);
router.post('/resetPassword', resetPassword);
module.exports = router;