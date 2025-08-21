const { getDB } = require("../config/db.js");
const { ObjectId } = require("mongodb");
const add_update_Question_Tamplate = async (req, res) => {
  try {
    let { classId, subject, batchNumber, questionMark , holdquestionfullmark , holdquestionobtionmark} = req.body;

    if (!classId || !subject || !batchNumber ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    subject = subject.trim();
    const db = getDB();
    const collection = db.collection("question_templates");
    const users = db.collection("users");
    const final_marks = db.collection("final_marks");

    // Fetch student IDs in the class
    const userids = await users
      .find({ role: "student", class: classId }, { projection: { _id: 1 } })
      .toArray();
    const studentIds = userids.map(u => u._id.toString());

    // Upsert question template
    const templateFilter = { classId, subject, batchNumber };
    const templateUpdate = {
      $set: { classId, subject, batchNumber, questionMark , holdquestionfullmark , holdquestionobtionmark},
    };
    const templateOptions = { upsert: true };
    await collection.updateOne(templateFilter, templateUpdate, templateOptions);

    // Prepare bulk operations for final_marks: for each student, for examiner "first" and "second"
    const bulkOps = [];
    for (const studentId of studentIds) {
      ["1st", "2nd"].forEach(examiner => {
        const filter = {
          studentId,
          classId,
          subject,
          batchNumber,
          examiner,
        };
        const update = {
          $set: {
            studentId,
            classId,
            subject,
            batchNumber,
            holdquestionfullmark ,
            holdquestionobtionmark,
            questionMark,
            examiner,
            teacherId :"",
            updatedAt: new Date(),
          },
          
          $setOnInsert: {
          
            createdAt: new Date(),
          },
        };
        bulkOps.push({
          updateOne: {
            filter,
            update,
            upsert: true,
          },
        });
      });
    }

    if (bulkOps.length) {
      await final_marks.bulkWrite(bulkOps);
    }

    return res
      .status(200)
      .json({ message: "Template upserted and student examiner entries synced" });
  } catch (error) {
    console.error("Error in add_update_Question_Tamplate:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const get_question_template = async (req, res) => {
  try {
    let { classId, subject, batchNumber } = req.params;
    console.log(req.params)

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
  let { classId, subject, batchNumber , examiner } = req.params;
  console.log(req.params)
  subject = subject.trim() ;
  const db = getDB();
  const collection = db.collection("final_marks");

  try {
    const results = await collection.aggregate([
      {
        $match: { classId, subject, batchNumber, examiner}
      },
      {
        $addFields: {
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
      {
        $unwind: "$studentInfo"
      },
      {
        $project: {
          _id: 1,
          batchNumber: 1,
          classId: 1,
          subject: 1,
          examiner: 1,
          createdAt: 1,
          holdquestionfullmark: 1,
          holdquestionobtionmark: 1,
          questionMark: 1,
          updatedAt: 1,
          studentName: "$studentInfo.name",
          class_roll: "$studentInfo.class_roll"
        }
      },
      {
        $sort: {class_roll : 1}
      }
    ]).toArray();

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
    const teacherId = req.body.teacherId ;
    const submitInfo = req.body.submitInfo ;
    console.log(submitInfo) ;

    // Validate incoming data
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid or empty data" });
    }

    

    const bulkOps = updates.map((student) => {
      if (!student._id) return null; // skip if no ID

      return {
        updateOne: {
          filter: { _id: new ObjectId(student._id) },
          update: {
            $set: {
              holdquestionfullmark: Number(student.holdquestionfullmark) || 0,
              holdquestionobtionmark: Number(student.holdquestionobtionmark) || 0,
              questionMark: Array.isArray(student.questionMark) ? student.questionMark : [],
              teacherId: teacherId|| "",
              updatedAt: new Date()
            }
          }
        }
      };
    }).filter(Boolean); // remove nulls

    if (bulkOps.length === 0) {
      return res.status(400).json({ success: false, message: "No valid updates provided" });
    }

    const result = await db.collection("final_marks").bulkWrite(bulkOps);

    if (result.modifiedCount > 0 && submitInfo) {
      let { classId, batchNumber, subject, examinerType } = submitInfo;
      console.log(submitInfo) ;
      subject = subject.trim() ;

      // Dynamically build update field (firstExaminerSubmit / secondExaminerSubmit)
      const submitField =
        examinerType === "1st"
          ? "firstExaminerSubmit"
          : "secondExaminerSubmit";

      await db.collection("examiners").updateOne(
        { classId, batchNumber, subject }, // find examiner record
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


const get1stand2ndExaminerFinalMarks = async (req, res) => {
  try {
    const db = getDB();
    let { classId, batchNumber, subject } = req.params;
    subject = subject.trim();

    if (!classId || !batchNumber || !subject) {
      return res.status(400).json({ success: false, message: "Missing filters" });
    }

    const results = await db.collection("final_marks").aggregate([
      {
        $match: { classId, batchNumber, subject }
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
      { $unwind: "$studentInfo" },
      {
        $group: {
          _id: "$studentId",
          name: { $first: "$studentInfo.name" },
          class_roll: { $first: "$studentInfo.class_roll" },
          examiner1: {
            $max: {
              $cond: [
                { $eq: ["$examiner", "1st"] },
                {
                  holdquestionfullmark: "$holdquestionfullmark",
                  holdquestionobtionmark: "$holdquestionobtionmark",
                  questionMark: "$questionMark",
                  teacherId: "$teacherId",
                  updatedAt: "$updatedAt"
                },
                null
              ]
            }
          },
          examiner2: {
            $max: {
              $cond: [
                { $eq: ["$examiner", "2nd"] },
                {
                  holdquestionfullmark: "$holdquestionfullmark",
                  holdquestionobtionmark: "$holdquestionobtionmark",
                  questionMark: "$questionMark",
                  teacherId: "$teacherId",
                  updatedAt: "$updatedAt"
                },
                null
              ]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          studentId: "$_id",
          name: 1,
          class_roll: 1,
          examiner1: 1,
          examiner2: 1
        }
      },
      {
        $sort: {
          class_roll: 1
        }
      }
    ]).toArray();

    res.json(results);
  } catch (error) {
    console.error("Error fetching final marks:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
const getDiffStudentsBySubject = async (req, res) => {
  try {
    const db = getDB();
    const { classId, batchNumber } = req.params;
    console.log(req.params)

    if (!classId || !batchNumber) {
      return res.status(400).json({ success: false, message: "Missing filters" });
    }

    const result = await db.collection("final_marks").aggregate([
      // 1️⃣ Filter by classId and batchNumber
      {
        $match: { classId, batchNumber }
      },
      // 2️⃣ Group by student + subject and collect both examiner marks
      {
        $group: {
          _id: {
            subject: "$subject",
            studentId: "$studentId"
          },
          marks: {
            $push: {
              examiner: "$examiner",
              mark: { $toDouble: "$holdquestionobtionmark" }
            }
          }
        }
      },
      // // 3️⃣ Keep only those who have both examiners
      {
        $match: {
          "marks.examiner": { $all: ["1st", "2nd"] }
        }
      },
      {
  $project: {
    subject: "$_id.subject",
    studentId: "$_id.studentId",
    firstMark: {
      $ifNull: [
        {
          $getField: {
            field: "mark",
            input: {
              $first: {
                $filter: {
                  input: "$marks",
                  cond: { $eq: ["$$this.examiner", "1st"] }
                }
              }
            }
          }
        },
        0
      ]
    },
    secondMark: {
      $ifNull: [
        {
          $getField: {
            field: "mark",
            input: {
              $first: {
                $filter: {
                  input: "$marks",
                  cond: { $eq: ["$$this.examiner", "2nd"] }
                }
              }
            }
          }
        },
        0
      ]
    }
  }
},
{
  $addFields: {
    diff: { $abs: { $subtract: ["$firstMark", "$secondMark"] } }
  }
},
 {
          $match: { diff: { $gte: 5 } },
        },
        {
          $group: {
            _id: "$subject",
            stdNum: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            subject: "$_id",
            stdNum: 1,
          },
        }
     
    ]).toArray();
    const finalMap = {};
result.forEach(item => {
  finalMap[item.subject] = item.stdNum;
});

    res.status(200).json(finalMap);

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
    add_update_Question_Tamplate,
    get_question_template ,
    get_students_mark,
    updata_students_marks,
    get1stand2ndExaminerFinalMarks ,
    getDiffStudentsBySubject

}