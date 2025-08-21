const { ObjectId } = require('mongodb');
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
  const { subjectCode } = req.body;
  try {
    await db.collection('classes').updateOne(
      { class: classNumber },
      { $pull: { subjects:{code: subjectCode} } }
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

const addNewBatch = async (req, res) => {
  const db = getDB();
  const { batchNumber, session } = req.body;
  try {
    await db.collection('batches').insertOne({ batchNumber, session });
    res.status(200).json({ message: 'Batch added successfully' });
  } catch (error) {
    console.error('Error adding batch:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
const getBatch = async (req, res) => {
  const db = getDB();
  try {
    const batches = await db.collection('batches').find({}).toArray();
    res.status(200).json(batches);
  } catch (error) {
    console.error('Error fetching batches:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
const deleteBatch = async (req, res) => {
  const db = getDB();
  const { id} = req.params; // Assuming batchNumber is passed as a URL parameter
  console.log("Deleting batch:", id); // Debugging line
  try {
    const result = await db.collection('batches').deleteOne({ _id : new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    res.status(200).json({ message: 'Batch deleted successfully' });
  } catch (error) {
    console.error('Error deleting batch:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

const semesterUdateBatchNumber = async (req, res) => {
  const db = getDB();
  const { batchNumber, id } = req.body;
  console.log(req.body); // Debugging line
  try {
    const result = await db.collection('classes').updateOne(
      { _id: new ObjectId(id) },
      { $set: { batchNumber } }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    res.status(200).json({ message: 'Batch number updated successfully' });
  } catch (error) {
    console.error('Error updating batch number:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}


module.exports = {
  addClassAndSub,
  getClassAndSub,
  addSubjectToClass,
  deleteClass,
  removeSubjectFromClass,
  getSubjectbyClass ,
  addNewBatch , 
  getBatch,
  deleteBatch ,
  semesterUdateBatchNumber

}