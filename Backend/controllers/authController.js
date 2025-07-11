const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getDB } = require('../config/db.js');
require('dotenv').config();
const { ObjectId } = require("mongodb");

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const db = getDB();

  try {
    const user = await db.collection('users').findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid password' });

    // Exclude password from user object
    const { password: _, ...userWithoutPassword } = user;

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


const AddUser = async (req, res) => {
  console.log(req.body);
  const { password, email, ...rest } = req.body;
  const db = getDB();

  try {
    const existing = await db.collection('users').findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user object with hashed password
    const newUser = {
      ...rest,
      email,
      password: hashedPassword,
      createdAt: new Date(), // optional: track user creation time
    };

    const result = await db.collection('users').insertOne(newUser);
    res.status(201).json({
      message: "User created successfully",
      userId: result.insertedId,
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


const getTeacher = async (req, res) => {
  const db = getDB();
  try {
    const teacher = await db.collection('users').find({ role: "teacher" }).toArray();
    if (!teacher) return res.status(404).json({ message: 'No teacher found' });
    res.json(teacher);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}
const getStudent = async (req, res) => {
  const db = getDB();
    const student = await db.collection('users').find({ role: "student" }).toArray();
    if (!student) return res.status(404).json({ message: 'No student found' }); 
    res.json(student);

}
const DeleteUser = async (req, res) => {
  const db = getDB();
  const { id } = req.params;
  console.log(id);
  try {
    const result = await db.collection('users').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

 const getStudentByClassandSection = async (req, res) => {
  const { class: className } = req.params;
  const db = getDB();

  try {

    const students = await db
      .collection('users')
      .find({ role: "student", class: className }, { projection:  { 
            name: 1,
            photoURL: 1,
            class_roll: 1 ,
            class:1
        } })
      .toArray();

    if (!students || students.length === 0) {
      return res.status(404).json({ message: 'No students found' });
    }

    res.json(students);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getUserbyId = async (req , res) =>{
  const {id} = req.params ; 
  console.log(id) ;
  const db = getDB() ; 
  const user =  await db.collection('users').findOne({_id : new ObjectId(id)}) ;
  if(!user) return res.status(404).json({message : "User not found"}) ;
  res.json(user) ;
}

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const updatedUserData = { ...req.body };

    // ❗ Remove _id if present
    delete updatedUserData._id;

    const db = getDB();
    const usersCollection = db.collection("users");

    const result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updatedUserData },
      { returnDocument: "after" } // Optional: Returns updated document
    );
    console.log(result) ;

    if (!result) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User profile updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Failed to update user", error });
  }
};





module.exports = { loginUser, AddUser, getTeacher, getStudent , DeleteUser , getStudentByClassandSection  , getUserbyId , updateUser};
