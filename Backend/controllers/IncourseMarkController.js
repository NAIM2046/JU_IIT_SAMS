const { getDB } = require("../config/db.js");


const addAttendanceMark = async(req , res) =>{
     try {
    const db = getDB();
    const { classId, subjectCode, type, Number, marks , fullMark } = req.body;

    if (!classId || !subjectCode || !type || !Number || !marks) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const filter = { classId, subjectCode, type, Number , fullMark };
    const updateDoc = {
      $set: {
        marks,
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    };

    const result = await db.collection("incourse_marks").updateOne(
      filter,
      updateDoc,
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      res.status(201).json({ message: "New attendance marks inserted." });
    } else {
      res.status(200).json({ message: "Attendance marks updated." });
    }

  } catch (error) {
    console.error("Error saving attendance marks:", error);
    res.status(500).json({ message: "Server error." });
  }
}
const otherTaskMarkSummary = async(req , res)=>{
       const {classId , task_type , subject } = req.params
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
    $match: { class: classId, subject: subject, type: task_type }
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

  // console.log(summary) ;

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
    otherTaskMarkSummary
   
}