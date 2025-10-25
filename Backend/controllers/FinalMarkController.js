const { getDB } = require("../config/db.js");
const { ObjectId } = require("mongodb");
const add_update_Question_Tamplate = async (req, res) => {
  try {
    let { classId, subject, batchNumber, questionMark, holdquestionfullmark, holdquestionobtionmark } = req.body;

    // Validate inputs
    if (!classId || !subject || !batchNumber) {
      return res.status(400).json({ message: "All fields are required" });
    }

    subject = subject.trim();

    const db = getDB();
    const collection = db.collection("question_templates");
    const users = db.collection("users");
    const final_marks = db.collection("final_marks");

    // Get all student IDs for the class
    const students = await users
      .find({ role: "student", class: classId }, { projection: { _id: 1 } })
      .toArray();

    const studentIds = students.map(s => s._id.toString());

    // --- Upsert question template ---
    await collection.updateOne(
      { classId, subject, batchNumber },
      {
        $set: {
          classId,
          subject,
          batchNumber,
          questionMark,
          holdquestionfullmark,
          holdquestionobtionmark,
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true }
    );

    // --- Prepare examiner list once ---
    const examinerList = ["1st", "2nd", "3rd"].map(examiner => ({
      examiner,
      holdquestionfullmark,
      holdquestionobtionmark,
      questionMark,
      teacherId: "",
    }));

    // --- Prepare bulk operations for students ---
    const bulkOps = studentIds.map(studentId => ({
      updateOne: {
        filter: { studentId, classId, subject, batchNumber },
        update: {
          $set: {
            studentId,
            classId,
            subject,
            batchNumber,
            holdquestionfullmark,
            holdquestionobtionmark,
            examinerList,
            updatedAt: new Date(),
          },
          $setOnInsert: { createdAt: new Date() },
        },
        upsert: true,
      },
    }));

    if (bulkOps.length) {
      await final_marks.bulkWrite(bulkOps);
    }

    return res.status(200).json({
      message: "Template upserted and student examiner entries synced"
    });

  } catch (error) {
    console.error("Error in add_update_Question_Tamplate:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const get_question_template = async (req, res) => {
  try {
    let { classId, subject, batchNumber } = req.params;
   // console.log( "quwnknkv", req.params)

    if (!classId || !subject || !batchNumber) {
      return res.status(400).json({ message: "Missing parameters" });
    }

    subject = subject.trim();
    const db = getDB();
    const collection = db.collection("question_templates");

    const template = await collection.findOne({ classId, subject, batchNumber });

   

    return res.status(200).json(template);
  } catch (error) {
    console.error("Error in get_question_template:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



const get_students_mark = async (req, res) => {
  let { classId, subject, batchNumber, examiner } = req.params;
  subject = subject.trim();
  const db = getDB();
  const collection = db.collection("final_marks");

  try {
    const pipeline = [
      {
        $match: { classId, subject, batchNumber }
      },
      {
        $addFields: {
          firstExaminer: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$examinerList",
                  as: "ex",
                  cond: { $eq: ["$$ex.examiner", "1st"] }
                }
              },
              0
            ]
          },
          secondExaminer: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$examinerList",
                  as: "ex",
                  cond: { $eq: ["$$ex.examiner", "2nd"] }
                }
              },
              0
            ]
          },
          examinerData: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$examinerList",
                  as: "ex",
                  cond: { $eq: ["$$ex.examiner", examiner] }
                }
              },
              0
            ]
          },
          studentObjectId: { $toObjectId: "$studentId" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "studentObjectId",
          foreignField: "_id",
          as: "studentInfo"
        }
      },
      { $unwind: "$studentInfo" },
      {
        $project: {
          _id: 1,
          batchNumber: 1,
          classId: 1,
          subject: 1,
          createdAt: 1,
          updatedAt: 1,
          holdquestionfullmark: "$examinerData.holdquestionfullmark",
          holdquestionobtionmark: "$examinerData.holdquestionobtionmark",
          questionMark: "$examinerData.questionMark",
          studentName: "$studentInfo.name",
          class_roll: "$studentInfo.class_roll",
          studentId: "$studentInfo._id",
          teacherId: "$examinerData.teacherId",
          firstMark: {
            $cond: [
              { $ne: ["$firstExaminer.holdquestionobtionmark", ""] },
              { $toDouble: "$firstExaminer.holdquestionobtionmark" },
              null
            ]
          },
          secondMark: {
            $cond: [
              { $ne: ["$secondExaminer.holdquestionobtionmark", ""] },
              { $toDouble: "$secondExaminer.holdquestionobtionmark" },
              null
            ]
          }
        }
      },
      { $addFields: { isRetake: false } }, // mark normal students
      { $sort: { class_roll: 1 } }
    ];

    if (examiner === "3rd") {
      pipeline.push({
        $addFields: {
          diff: { $abs: { $subtract: ["$firstMark", "$secondMark"] } }
        }
      });
      pipeline.push({ $match: { diff: { $gte: 11 } } });
    }

    // Main student results
    let results = await collection.aggregate(pipeline).toArray();

    // Retake students list
    const retakeStudents = await db
      .collection("failed_subjects")
      .find({ classId, subjectCode: subject })
      .toArray();

    if (retakeStudents.length > 0) {
      const retakeIds = retakeStudents.map(s => s.studentId);

      // Retake pipeline with flag
      const retakeMarks = await collection
        .aggregate([
          { $match: { classId, subject, studentId: { $in: retakeIds } } },
          ...pipeline.slice(1), // reuse steps (skip first $match)
          { $addFields: { isRetake: true } } // mark retake students
        ])
        .toArray();

      results.push(...retakeMarks);
    }

    const seen = new Map();
    results.forEach(item => {
      if (!seen.has(item.studentId.toString())) {
        seen.set(item.studentId.toString(), item);
      }else{
        // If already exists, update to mark retake = true
        const existing = seen.get(item.studentId.toString());
        existing.isRetake = existing.isRetake || item.isRetake;
        seen.set(item.studentId.toString(), existing);

      }
    });
    results = Array.from(seen.values());

    res.status(200).json(results);
  } catch (error) {
    console.error("Error getting students marks:", error);
    res.status(500).json({ message: "Server error" });
  }
};



const updata_students_marks = async (req, res) => {
  try {
    const db = getDB();
    const updates = req.body.students;
    const teacherId = req.body.teacherId;
    const submitInfo = req.body.submitInfo;

    // Validate incoming data
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid or empty data" });
    }

    const examinerType = submitInfo?.examinerType; // e.g. "1st", "2nd"
    if (!examinerType) {
      return res.status(400).json({ success: false, message: "Examiner type is required" });
    }
    const updateCheckField =
        examinerType === "1st"
          ? "firstExaminerId"
          : examinerType === "2nd"
          ? "secondExaminerId"
          : "thirdExaminerId";

          


    // Build bulk update operations
    const bulkOps = updates.map((student) => {
      if (!student._id) return null;

      return {
        updateOne: {
          filter: { _id: new ObjectId(student._id) , "examinerList.examiner": examinerType },
          update: {
            $set: {
              "examinerList.$.holdquestionfullmark": Number(student.holdquestionfullmark) || 0,
              "examinerList.$.holdquestionobtionmark": Number(student.holdquestionobtionmark) || 0,
              "examinerList.$.questionMark": Array.isArray(student.questionMark) ? student.questionMark : [],
              "examinerList.$.teacherId": teacherId || "",
              updatedAt: new Date()
            }
          }
        }
      };
    }).filter(Boolean);

    if (bulkOps.length === 0) {
      return res.status(400).json({ success: false, message: "No valid updates provided" });
    }

    const result = await db.collection("final_marks").bulkWrite(bulkOps);

    // If updates successful and submitInfo provided, mark examiner submission as complete
    if (result.modifiedCount > 0 && submitInfo) {

       //console.log("Examiner submission marked as complete");
      let { classId, batchNumber, subject } = submitInfo;
      subject = subject.trim();
     // console.log({ classId, batchNumber, subject, examinerType });

      // Dynamically build update field in examiners collection
      const submitField =
        examinerType === "1st"
          ? "firstExaminerSubmit"
          : examinerType === "2nd"
          ? "secondExaminerSubmit"
          : "thirdExaminerSubmit";
          console.log("Submit field:", submitField);


      await db.collection("examiners").updateOne(
        { classId, batchNumber, subject },
        {
          $set: {
            [submitField]: true,
            updatedAt: new Date(),
          },
        }
      );
    }
  

    res.json({
      success: true,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      message: `${result.modifiedCount} student marks updated successfully`
    });

  } catch (error) {
    console.error("Bulk update error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};



const get1st_2nd_3rd_ExaminerFinalMarks = async (req, res) => {
  try {
    const db = getDB();
    let { classId, batchNumber, subject } = req.params;

    if (!classId || !batchNumber || !subject) {
      return res.status(400).json({ success: false, message: "Missing filters" });
    }

    subject = subject.trim();

    const collection = db.collection("final_marks"); // ✅ define collection

    const pipeline = [
      {
        $match: {
          classId,
          batchNumber,
          subject
        }
      },
      {
        $addFields: {
          studentObjId: { $toObjectId: "$studentId" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "studentObjId",
          foreignField: "_id",
          as: "studentInfo"
        }
      },
      {
        $unwind: {
          path: "$studentInfo",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          studentId: "$studentInfo._id",
          name: "$studentInfo.name",
          class_roll: "$studentInfo.class_roll",
          examinerList: 1,
          createdAt: 1,
          updatedAt: 1
        }
      },
      {
        $sort: {
          class_roll: 1
        }
      },
      { $addFields: { isRetake: false } } // ✅ mark normal students
    ];

    // Main results
    const results = await collection.aggregate(pipeline).toArray();

    // Retake students
    const retakeStudents = await db
      .collection("failed_subjects")
      .find({ classId, subjectCode: subject })
      .toArray();

    if (retakeStudents.length > 0) {
      const retakeIds = retakeStudents.map(s => s.studentId);

      const retakeMarks = await collection
        .aggregate([
          { $match: { classId, subject, studentId: { $in: retakeIds } } },
          ...pipeline.slice(1), // reuse after first $match
          { $addFields: { isRetake: true } } // ✅ mark retake students
        ])
        .toArray();

      results.push(...retakeMarks);
    }

    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching final marks:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};


const getDiffStudentsBySubject = async (req, res) => {
  try {
    const db = getDB();
    const { classId, batchNumber } = req.params;

    if (!classId || !batchNumber) {
      return res.status(400).json({ success: false, message: "Missing filters" });
    }

    const result = await db.collection("final_marks").aggregate([
      // 1️⃣ Filter by class + batch
      { $match: { classId, batchNumber } },

      // 2️⃣ Reshape examinerList into { "1st": mark, "2nd": mark }
      {
        $project: {
          subject: 1,
          studentId: 1,
          marks: {
            $arrayToObject: {
              $map: {
                input: {
                  $filter: {
                    input: "$examinerList",
                    cond: { $in: ["$$this.examiner", ["1st", "2nd"]] }
                  }
                },
                as: "m",
                in: [
                  "$$m.examiner",
                  {
                    $cond: [
                      { $ne: ["$$m.holdquestionobtionmark", ""] },
                      { $toDouble: "$$m.holdquestionobtionmark" },
                      null
                    ]
                  }
                ]
              }
            }
          }
        }
      },

      // 3️⃣ Add diff = |1st - 2nd|
      {
        $addFields: {
          firstMark: "$marks.1st",
          secondMark: "$marks.2nd",
          diff: { $abs: { $subtract: ["$marks.1st", "$marks.2nd"] } }
        }
      },

      // 4️⃣ Only students with diff ≥ 11
      { $match: { diff: { $gte: 11 } } },

      // 5️⃣ Count per subject
      {
        $group: {
          _id: "$subject",
          stdNum: { $sum: 1 }
        }
      },

      // 6️⃣ Clean output
      {
        $project: {
          _id: 0,
          subject: "$_id",
          stdNum: 1
        }
      }
    ]).toArray();

    // Convert to map { subject: count }
    const finalMap = Object.fromEntries(result.map(r => [r.subject, r.stdNum]));

    res.status(200).json(finalMap);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateExamCommiteFinalMark = async(req , res) =>{
  const db = getDB();
 const{ payload , committeeUpdate} = req.body;
// console.log(req.body)
// console.log("Update payload:", payload);
console.log("Committee update:", committeeUpdate);
  try {
     const bulkOps = payload.map(student => ({
       updateOne: {
         filter: { _id: new ObjectId(student._id) },
         update: { $set: { holdquestionobtionmark: Number(student.finalMark) } }
       }
     }));

     const result = await db.collection("final_marks").bulkWrite(bulkOps);

     // Update exam committee information
     if (committeeUpdate) {
       await db.collection("examCommittees").updateOne(
         { _id: new ObjectId(committeeUpdate._id) },
          { $addToSet: { final_mark_submit: committeeUpdate.subject } }
       );
     }

    // console.log("Bulk update result:", result);
     res.status(200).json({ success: true, result });
  } catch (error) {
     console.error("Error updating final marks:", error);
     res.status(500).json({ success: false, error: error.message });
  }
}


module.exports = {
    add_update_Question_Tamplate,
    get_question_template ,
    get_students_mark,
    updata_students_marks,
    get1st_2nd_3rd_ExaminerFinalMarks ,
    getDiffStudentsBySubject,
    updateExamCommiteFinalMark

}