const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db.js");
require("dotenv").config();

const createNewExam = async(req, res) => {
    const db = getDB();
    const examInfo = req.body;
    const students = await db
      .collection('users')
      .find({ role: "student", class: examInfo.class }, { projection: { password: 0} })
      .toArray();

    const newDoc = {
        examType: examInfo.examType,
        class: examInfo.class,
        subject: examInfo.subject,
        totalMark: examInfo.totalMark,
        teacherId: examInfo.teacherId,
        date: new Date(),
        studentsInfo:[]
    }
    students.forEach(item => newDoc.studentsInfo.push({
        Name: item.name,
        roll: parseInt(item.roll),
        stdId: item._id,
        marks: 0
    }));

    const examHistory = await db.collection('examHistory').insertOne(newDoc);
    const deletePrevious = await db.collection('currentExamId').deleteMany({});
    const insertNewId = await db.collection('currentExamId').insertOne({examId: examHistory.insertedId});

    res.send({message: "new exam Created successfully", examHistory});
}

const getCurrentExamInfo = async (req, res) => {
  const db = getDB();
  let currentExamId = req.body.examId;
  if(currentExamId==1){
    const currentExamObj = await db.collection('currentExamId').find({}).toArray();
    currentExamId = currentExamObj[0].examId;
  }
  const filter = {_id: new ObjectId(currentExamId)};
  const currentExamInfo = await db.collection('examHistory').findOne(filter);
  res.send({currentExamInfo, currentExamId});
}

const getAllExams = async (req, res) => {
  const db = getDB();
  const currentExamObj = await db.collection('examHistory').find({}).toArray();
  res.send(currentExamObj);
}


const deleteCurrentExamInfo = async (req, res) => {
  const db = getDB();
  const deletePrevious = await db.collection('currentExamId').deleteMany({});
  res.send({"message":"successfully deleted current exam info"});
}

const updateOneStudentMarks = async(req, res) => {
  const { examId, roll, marks } = req.body;
  const db = getDB();
  try {
    const collection = db.collection('examHistory');
    const result = await collection.updateOne(
      {
        _id: new ObjectId(examId),
        "studentsInfo.roll": parseInt(roll)
      },
      {
        $set: {
          "studentsInfo.$.marks": marks
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Document or student not found" });
    }

    res.json({ message: "Marks updated", modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error(error);
    res.status(500).send("Update failed");
  } 
}

module.exports = {
    createNewExam,
    getCurrentExamInfo,
    updateOneStudentMarks,
    deleteCurrentExamInfo,
    getAllExams
}