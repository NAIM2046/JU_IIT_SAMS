const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getDB } = require('../config/db.js');
require('dotenv').config();

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const db = getDB();

  try {
    const user = await db.collection('users').findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid password' });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const SignUp = async (req, res) => {
    console.log(req.body) ;
    const { email, password } = req.body;
    const db = getDB();
  
    try {
      const existing = await db.collection('users').findOne({ email });
      if (existing) return res.status(400).json({ message: 'Email already exists' });
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newuser = {
        email,
        password: hashedPassword,
        role: "admin",
      };
  
      const result = await db.collection('users').insertOne(newuser);
  
      res.status(201).json({
        message: "User created successfully",
        userId: result.insertedId,
      });
    } catch (error) {
      console.error("Signup Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  

module.exports = { loginUser , SignUp};
