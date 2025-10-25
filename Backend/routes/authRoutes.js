const express = require('express');
const { loginUser, AddUser, getTeacher, getStudent, DeleteUser, getStudentByClassandSection, getUserbyId, updateUser, updateProfile_photo, update_class_students } = require('../controllers/authController.js');
const { verifyToken } = require('../Middleware/authMiddleware.js');
const router = express.Router();

router.post('/login', loginUser);
router.post('/adduser' , AddUser) ;
router.get('/getTeacher' , getTeacher) ;
router.get('/getstudent' , getStudent) ;
router.delete('/deleteuser/:id', DeleteUser);
router.get('/getStudentByClassandSection/:class', getStudentByClassandSection);
router.get('/getUserbyId/:id' , verifyToken,  getUserbyId) ;
router.put('/updateUser/:id' ,  updateUser) ; // Assuming you have a function to update user
router.put('/updateProfile_photo/:id' , updateProfile_photo) ;
router.put('/update_class_students' , update_class_students) ;
router.get('/protected', verifyToken,   (req, res) => {
  // This route is protected and requires a valid token
  res.status(200).json({ message: 'Protected route accessed successfully!'  , user: req.user });
}
);

module.exports = router;
