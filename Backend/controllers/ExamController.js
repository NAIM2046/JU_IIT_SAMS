const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db.js");
require("dotenv").config();

const createNewExam = async(req, res) => {
    const db = getDB();
    const examInfo = req.body;
    const students = await db
      .collection('users')
      .find({ role: "student", class: examInfo.classNumber }, { projection: { password: 0} })
      .toArray();

    const newDoc = {
        examType: examInfo.examType,
        examNumber: examInfo.examNumber,
        class: examInfo.classNumber,
        subject: examInfo.subject,
        totalMark: examInfo.totalMark,
        teacherId: examInfo.teacherId,
        teacherName: examInfo.teacherName,
        date: new Date(),
        studentsInfo:[]
    }
    students.forEach(item => newDoc.studentsInfo.push({
        Name: item.name,
        roll: parseInt(item.roll),
        studentId: item._id,
        marks: 0
    }));
    const currentExamObj = await db.collection('currentExamId').find({teacherId: examInfo.teacherId}).toArray();
     
    if(currentExamObj.length > 0){
      const insertResult = await db.collection('examHistory').insertOne(currentExamObj[0]);
     
      const deletePrevious = await db.collection('currentExamId').deleteMany({teacherId: examInfo.teacherId});
  }

    
    const insertNewId = await db.collection('currentExamId').insertOne(newDoc);

    res.send({message: "new exam Created successfully"});
}

const getCurrentExamInfo = async (req, res) => {
  const db = getDB();
  const teacherId = req.body.teacherId;
  const currentExamObj = await db.collection('currentExamId').find({teacherId: teacherId}).toArray();
  if(currentExamObj.length === 0){
    return res.send({message: "No current exam found for this teacher"});
  }
  res.send(currentExamObj[0]);
}

const getAllExams = async (req, res) => {
  const db = getDB();
  const teacherId = req.params.teacherId;
  console.log(teacherId) ;
  const currentExamObj = await db.collection('examHistory').find({ teacherId: teacherId}).toArray();
  res.send(currentExamObj);
}


const deleteCurrentExamInfo = async (req, res) => {
  const db = getDB();
  const {id} = req.params ; 
  const deletePrevious = await db.collection('currentExamId').deleteOne({ _id: new ObjectId(id)});
  res.send({"message":"successfully deleted current exam info" , deletePrevious});
  if(deletePrevious.deletedCount === 0){
    return res.status(404).send({message: "No current exam found with this ID"});
  } 
}

const updateOneStudentMarks = async(req, res) => {
  const { examId, studentId, marks } = req.body;
  //console.log("Exam ID:", examId, "Student ID:", studentId, "Marks:", marks);
  const db = getDB();
  try {
    const collection = db.collection('currentExamId');
    const result = await collection.updateOne(
      {
        _id: new ObjectId( examId),
        "studentsInfo.studentId": new ObjectId( studentId )
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

const ExamSave = async (req, res) => {
  const db = getDB();
   const { examId } = req.body;
  if (!examId) {
    return res.status(400).send({ message: "Exam ID is required" });
  }

  const currentExamObj = await db.collection('currentExamId').find({ _id: new ObjectId(examId)}).toArray();
  if(currentExamObj.length){
   const deletePrevious =  await db.collection('currentExamId').deleteOne({_id: new ObjectId(examId)}) ;
  }
 

 
  const examData = currentExamObj[0];

  const alreadyExists = await db.collection('examHistory').findOne({ subject: examData.subject, class: examData.class, examType: examData.examType, examNumber: examData.examNumber });
  if (alreadyExists) {
    return res.status(400).send({ message: "Exam already exists for this subject, class, exam type, and exam number" });
  }


  const insertResult = await db.collection('examHistory').insertOne(examData);
  
  if (insertResult.acknowledged) {
    res.send({ message: "Exam saved successfully", examId: insertResult.insertedId });
  } else {
    res.status(500).send({ message: "Failed to save exam" });
  }
}
const updataExam =async (req , res)=>{
  const db = getDB() ;
    const {examId , teacherId} =  req.body ; 
    const result = await  db.collection("currentExamId").find({teacherId: teacherId}).toArray() ; 
    if(result.length>0){
          const insertId = await db.collection("examHistory").insertOne(result[0]) ;
          const deletePrevious =  await db.collection("currentExamId").deleteOne({teacherId: teacherId}) ; 
    }
    const examResult = await db.collection("examHistory").find({_id: new ObjectId(examId)}).toArray() ;
    const curInsert = await db.collection("currentExamId").insertOne(examResult[0]) ; 
    const deleteHistroy = await db.collection("examHistory").deleteOne({_id: new ObjectId(examId)}) ;
    res.json({message: "read for update "}) ;

}
  const getAvergeMarkById =  async(req , res) =>{
    const db = getDB() ; 
    const {id } = req.params ;
    const ExamCollection =  db.collection("examHistory") ;
     const result =  await ExamCollection.aggregate([
       {
        $unwind: "$studentsInfo"
       } ,
       {
        $match: {"studentsInfo.studentId": new ObjectId(id)}
       } ,
       {
        $project: {
          studentId: "$studentsInfo.studentId",
          name: "$studentsInfo.Name" ,
          subject: 1, 
          totalMark: {$toInt: "$totalMark"} , 
          getMark: {$toInt: "$studentsInfo.marks"}
        }
       },
       {
        $group: {
          _id: {
            studentId : "$studentId",
            name: "$name" , 
            subject: "$subject"
          } , 
          sumofTotalMark: {$sum: "$totalMark"},
          totalGetMark: {$sum: "$getMark"}
        }
       },
       {
        $group: {
          _id: {
            studentId: "$_id.studentId",
            name: "$_id.name"
          } ,
          subjects: {
            $push: {
              subject: "$_id.subject" , 
              sumofTotalMark: "$sumofTotalMark" ,
              totalGetMark: "$totalGetMark"
            }
          }
        }
       },
       {
        $project: {
          _id: 0,
          studentId: "$_id.studentId",
          name: "$_id.name",
          subjects: 1,
          
        }
       }
     ])
      .toArray() ;
    if(result.length === 0){
      return res.status(404).send({message: "No exam found for this student"}) ;
    } 
    res.json(result[0]) ;

  }

  const rank_summary = async (req , res) =>{
    const db = getDB() ; 
    const { classNumber } = req.params  ; 
    const result =   await db.collection("examHistory").aggregate([
      {
        $match: {class: classNumber}
      } ,
      {
        $unwind: "$studentsInfo"
      },
      {
        $project: {
          studentId: "$studentsInfo.studentId",
          name: "$studentsInfo.Name" , 
          mark : {$toDouble: "$studentsInfo.marks"} ,
          fullMark: {$toDouble: "$totalMark"},
        }
      } ,
      {
        $group: {
          _id: "$studentId" ,
          name: { $first: "$name"} , 
          totalGetMarks: {$sum: "$mark"} ,
          totalFullMark: {$sum: "$fullMark"}
        }
      } ,
      { $sort: {totalGetMarks: -1}} , 
      {
        $setWindowFields: {
          sortBy: {totalGetMarks: -1 } , 
          output: {
            rank: {$rank: {}}
          }
        }
      }
    ]).toArray() ; 
    if(result.length === 0){
      return res.status(404).send({message: "No exam found for this class"}) ;
    }
    res.json(result) ;
    

  }
  const monthly_update = async(req , res) =>{
      const db = getDB() ; 
      const monthlyCol = db.collection("month_performance_update") ;
      const id = req.params.id ;
      const result = await monthlyCol.aggregate([
        {
          $match:{
            studentId: new ObjectId(id)
          }
        } ,
        {
          $addFields: {
            monthOrder:{
              $indexOfArray:[
                ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
          "$month"
              ]
            }
          }
        } ,
        {
          $sort: {year:1 , monthOrder:1}
        } ,
        {
          $project: {
            _id:0 ,
            month: 1 , 
            year: 1,
            totalgetMarks:1 , 
            totalfullMarks: 1 ,
            rank:1
          }
        }

      ]).toArray() ;
      res.json(result) ;
  }

  const getAllExamMarkBy_C_S_Subj = async(req , res) =>{
    const {  className, subject, studentId } = req.query;

     console.log(className,subject , studentId) ;
    const db =  getDB() ; 
    const coll = db.collection("examHistory")
    const result = await coll.aggregate([
      {
    $match: {
      class: className, // 👈 Filter by class
      subject: subject // 👈 Filter by subject
    }
  },
  {
    $unwind: "$studentsInfo" // 👈 Flatten the studentsInfo array
  },
  {
    $match: {
      "studentsInfo.studentId": new ObjectId(studentId) // 👈 Match specific student
    }
  },
  {
    $project: {
      _id: 0,
      examType: 1,
      examNumber: 1,
      totalMark: 1,
      marks: "$studentsInfo.marks"
    }
  },
  {
    $sort: {
      examType: 1,
      examNumber: 1
    }
  }
    ]).toArray() ;
    res.json(result) ;
  }

  const getAllSubjectMarkById = async (req, res) => {
  try {
    const db = getDB();
    const { classNumber, Id } = req.query;
    console.log(classNumber , Id)

    if (!classNumber || !Id) {
      return res.status(400).json({ message: "classNumber and Id are required." });
    }

    const pipeline = [
      {
        $match: { class: classNumber }
      },
      {
        $unwind: "$studentsInfo"
      },
      {
        $match: {
          "studentsInfo.studentId": new ObjectId(Id)
        }
      },
      {
        $project: {
          _id: 0,
          subject: 1,
          examName: {
            $concat: ["$examType", " ", { $toString: "$examNumber" }]
          },
          fullMark: { $toDouble: "$totalMark" },
          obtained: { $toDouble: "$studentsInfo.marks" }
        }
      },
      {
        $group: {
          _id: "$subject",
          exams: {
            $push: {
              examName: "$examName",
              fullMark: "$fullMark",
              obtained: "$obtained"
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          exams: 1
        }
      }
    ];

    const results = await db.collection("examHistory").aggregate(pipeline).toArray();

    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching subject marks:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
    createNewExam,
    getCurrentExamInfo,
    updateOneStudentMarks,
    deleteCurrentExamInfo,
    getAllExams ,
    ExamSave ,
    
   updataExam,

    getAvergeMarkById ,
    rank_summary ,
    monthly_update,
    getAllExamMarkBy_C_S_Subj,
    getAllSubjectMarkById

}