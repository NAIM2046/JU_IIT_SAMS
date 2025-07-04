const { getDB } = require('../config/db.js');
require('dotenv').config();

const addClassAndSub = async (req, res) => {
  const db = getDB();
  const { classNumber, subjects } = req.body;
  console.log("Class and subjects:", classNumber, subjects); // Debugging line
  try {
    await db.collection('classes').insertOne({ class: classNumber, subjects });
    res.status(200).json({ message: 'Class and subjects added successfully' });
  } catch (error) {
    console.error('Error adding class and subjects:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

const getClassAndSub = async (req, res) => {
  const db = getDB();
  try {
    const classes = await db.collection('classes').find({}).toArray();
    res.status(200).json(classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}


const addSubjectToClass = async (req, res) => {
  const db = getDB();
  const { classNumber } = req.params; // Assuming classNumber is passed as a URL parameter
  const { subject } = req.body;
  console.log("Adding subject:", classNumber, subject); // Debugging line
  try {
    await db.collection('classes').updateOne(
      { class: classNumber },
      { $addToSet: { subjects: subject } }
    );
    res.status(200).json({ message: 'Subject added successfully' });
  } catch (error) {
    console.error('Error adding subject to class:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}


const deleteClass = async (req, res) => {
  const db = getDB();
  const { classNumber } = req.params; // Assuming classNumber is passed as a URL parameter
  try {
    const result = await db.collection('classes').deleteOne({ class: classNumber });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.status(200).json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Error deleting class:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


const removeSubjectFromClass = async (req, res) => {
  const db = getDB();
  const { classNumber } = req.params;
  const { subject } = req.body;
  try {
    await db.collection('classes').updateOne(
      { class: classNumber },
      { $pull: { subjects: subject } }
    );
    res.status(200).json({ message: 'Subject removed successfully' });
  } catch (error) {
    console.error('Error removing subject from class:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
const getSubjectbyClass = async (req, res) => {
  const db = getDB();
  const classNumber = req.params.class;
  const result = await db.collection("classes").findOne({ class: classNumber });
  res.status(200).json(result);
}

module.exports = {
  addClassAndSub,
  getClassAndSub,
  addSubjectToClass,
  deleteClass,
  removeSubjectFromClass,
  getSubjectbyClass

}