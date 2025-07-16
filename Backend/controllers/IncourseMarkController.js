const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db.js");


const addAttendanceMark = async (req, res) => {
  try {
    const db = getDB();
    const { classId, subjectCode, type, Number, marks, fullMark } = req.body;

    if (!classId || !subjectCode || !type || !Number || !marks || !fullMark) {
      return res.status(400).json({ message: "All fields are required." });
    }

    console.log("Updating attendance marks...");

    const filter = { classId, subjectCode, type , Number };
    console.log(filter) ;
    const updateDoc = {
      $set: {
        
        fullMark,
        marks,
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    };

    const result = await db.collection("incourse_marks").updateOne(filter, updateDoc, { upsert: true });

    console.log(result);

    if (result.upsertedCount > 0) {
      res.status(201).json({ message: "New attendance marks inserted." });
    } else {
      res.status(200).json({ message: "Attendance marks updated." });
    }

  } catch (error) {
    console.error("Error saving attendance marks:", error);
    res.status(500).json({ message: "Server error." });
  }
};

const otherTaskMarkSummary = async(req , res)=>{
       const {classId , task_type , subject } = req.params
       //console.log(classId , task_type , subject) 
        const db = getDB() ; 
  try{
    if(!classId || !subject){
      return res.status(400).json({message: "class and subject are required"})
    }
    const students =  await db.collection("users").find({role: "student" , class: classId}, {projection: {name: 1 , class_roll: 1 , photoURL: 1 }}).toArray() ;
    //console.log(students) ;
    const studentIds =  students.map(s => s._id.toString()) ;
   // console.log(studentIds)
 const summary = await db.collection("incourse_marks").aggregate([
  {
    $match: { classId: classId, subjectCode: subject, type: task_type }
  },
  {
    $unwind: "$marks"
  },
  {
    $match: { "marks.studentId": { $in: studentIds } }
  },
  {
    $project: {
      studentId: "$marks.studentId",
      typeNumber: {
        $concat: ["$type", "-", "$Number"]
      },
      mark: "$marks.mark",
      fullMark: "$fullMark"
    }
  },
  {
    $group: {
      _id: "$studentId",
      mark: {
        $push: {
          typeNumber: "$typeNumber",
          mark: "$mark",
          fullMark: "$fullMark"
        }
      }
    }
  }
]).toArray();

   //console.log(summary) ;


  const summaryMap = {} 
  summary.forEach(s=>{
    summaryMap[s._id.toString()] = s.mark ; 
  })
 const finalList = students.map(student => {
  const marks = summaryMap[student._id.toString()] || [];
  return {
    studentId: student._id,
    name: student.name,
    class_roll: student.class_roll,
    photoURL: student.photoURL,
    mark: marks
  };
});
  return res.json(finalList) ;

  }catch(err){
    console.error("Error in getAttendanceSummary:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

const otherTaskList =async (req , res)=>{
  const { classId, task_type, subject } = req.params;
  const db = getDB();

  try {
    // 1️⃣ Get students of the class
    const students = await db.collection("users").find(
      { role: "student", class: classId },
      { projection: { _id: 1, name: 1, class_roll: 1, photoURL: 1 } }
    ).toArray();

    // if no students found
    if (!students.length) {
      return res.status(404).json({ message: "No students found for this class." });
    }

    // 2️⃣ Build studentIds array (as ObjectId if your marks.studentId is stored as ObjectId)
    const studentIds = students.map(s => s._id.toString());

    // 3️⃣ Query incourse_marks for matching tasks
    const TaskList = await db.collection("incourse_marks").aggregate([
      {
        $match: {
          classId: classId,
          subjectCode: subject,
          type: task_type,
          marks: {
            $elemMatch: {
              studentId: { $in: studentIds }
            }
          }
        }
      }
    ]).toArray();

    // 4️⃣ Return result
    return res.status(200).json({
      message: "Task list fetched successfully.",
      count: TaskList.length,
      data: TaskList
    });

  } catch (error) {
    console.error("Error fetching other task list:", error);
    return res.status(500).json({ message: "Internal server error." });
  }


}
const backEidteFromate = async(req , res)=>{
  try {
    const db = getDB();
    const id = req.params.id;

    const result = await db.collection("incourse_marks").aggregate([
      { $match: { _id: new ObjectId(id) } },
      { $unwind: "$marks" },
      {
        $lookup: {
          from: "users",
          let: { stuId: "$marks.studentId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", { $toObjectId: "$$stuId" }] } } },
            { $project: { name: 1, class_roll: 1, photoURL: 1 } }
          ],
          as: "studentInfo"
        }
      },
      { $unwind: "$studentInfo" },
      {
        $project: {
          _id: 0,
          studentId: "$studentInfo._id",
          name: "$studentInfo.name",
          class_roll: "$studentInfo.class_roll",
          photoURL: "$studentInfo.photoURL",
          mark: "$marks.mark",
          Number: "$Number",
          fullMark: "$fullMark"
        }
      }
    ]).toArray();

    res.status(200).json(result);

  } catch (error) {
    console.error("Error in backEditFormat aggregation:", error);
    res.status(500).json({ message: "Server error" });
  }
}
const finalMarkSummary = async(req , res) =>{
  const { classId , subjectCode } = req.params ; 
  const db = getDB() ;
          
  try{
    if(!classId || !subjectCode){
      return res.status(400).json({message: "class and subject are required"})
    }
    const students =  await db.collection("users").find({role: "student" , class: classId}, {projection: {name: 1 , class_roll: 1 , photoURL: 1 }}).toArray() ;
    //console.log(students) ;
    const studentIds =  students.map(s => s._id.toString()) ;
   // console.log(studentIds)
 const summary = await db.collection("incourse_marks").aggregate([
  {
    $match: { classId: classId, subjectCode: subjectCode, Number: "final" }
  },
  {
    $unwind: "$marks"
  },
  {
    $match: { "marks.studentId": { $in: studentIds } }
  },
  {
    $project: {
      studentId: "$marks.studentId",
      typeNumber: {
        $concat: ["$type", "-", "$Number"]
      },
      mark: "$marks.mark",
      fullMark: "$fullMark"
    }
  },
  {
    $group: {
      _id: "$studentId",
      mark: {
        $push: {
          typeNumber: "$typeNumber",
          mark: "$mark",
          fullMark: "$fullMark"
        }
      }
    }
  }
]).toArray();

   //console.log(summary) ;


  const summaryMap = {} 
  summary.forEach(s=>{
    summaryMap[s._id.toString()] = s.mark ; 
  })
 const finalList = students.map(student => {
  const marks = summaryMap[student._id.toString()] || [];
  return {
    studentId: student._id,
    name: student.name,
    class_roll: student.class_roll,
    photoURL: student.photoURL,
    mark: marks
  };
});
  return res.json(finalList) ;

  }catch(err){
    console.error("Error in getAttendanceSummary:", err);
    return res.status(500).json({ message: "Internal server error" });
  }

}
module.exports = {
    addAttendanceMark, 
    otherTaskMarkSummary ,
    otherTaskList ,
    backEidteFromate,
    finalMarkSummary
   
}