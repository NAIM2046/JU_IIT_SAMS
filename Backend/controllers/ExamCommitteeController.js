const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db.js');


const add_update_exam_committee = async (req, res) => {
    const db = getDB();
    const { classId , batchNumber, committeeMembers , status } = req.body;
   // console.log("Adding/updating exam committee for class:", classId, "Batch:", batchNumber, "Members:", committeeMembers); // Debugging line
    try {
        const existingCommittee = await db.collection('examCommittees').findOne({ classId, batchNumber });
        if (existingCommittee) {
            // Update existing committee
            await db.collection('examCommittees').updateOne(
                { classId, batchNumber },
                { $set: { committeeMembers , status } }
            );
            res.status(200).json({ message: 'Exam committee updated successfully' });
        } else {
            // Add new committee
            await db.collection('examCommittees').insertOne({ classId, batchNumber, committeeMembers });
            res.status(201).json({ message: 'Exam committee added successfully' });
        }
    } catch (error) {
        console.error('Error adding/updating exam committee:', error);
        res.status(500).json({ message: 'Internal server error' });
    }   
}
const getCommittee = async (req, res) => {
    const db = getDB();
    const { classId, batchNumber } = req.params;
    console.log("Fetching exam committee for class:", classId, "Batch:", batchNumber); // Debugging line
    try {
        const committee = await db.collection('examCommittees').findOne({ classId, batchNumber });
        if (!committee) {
            return res.status(404).json({ message: 'Exam committee not found' });
        }
        res.status(200).json(committee);
    } catch (error) {
        console.error('Error fetching exam committee:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
const deleteCommittee = async(req , res)=>{
   const db = getDB();
  const id = req.params.id;

  try {
    const result = await db
      .collection("examCommittees")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 1) {
      res.status(200).json({ message: "Committee member deleted successfully." });
    } else {
      res.status(404).json({ message: "Committee member not found." });
    }
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Internal server error." });
  }

}
const getTeacherInvolvementCommittee = async (req, res) => {
  try {
    const db = getDB();
    const { teacherId } = req.params;

    const result = await db.collection("examCommittees").find({
      "committeeMembers.teacherId": teacherId,
      
    }).toArray();

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const examiner_Add_Update = async (req , res) =>{
   const db =getDB() ; 
   const examiners = req.body; // Array of subjects with examiners

  if (!Array.isArray(examiners) || examiners.length === 0) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  try {
    const bulkOps = examiners.map((item) => ({
      updateOne: {
        filter: { classId: item.classId, batchNumber: item.batchNumber, subject: item.subject },
        update: { $set: item },
        upsert: true, // Add new if not exists
      },
    }));

    const result = await db.collection("examiners").bulkWrite(bulkOps);
    res.status(200).json({ message: "Second examiners saved or updated", result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
}

const getExaminerall = async (req, res) => {
  try {
    const db = getDB();
    const { classId, batchNumber } = req.params;

    console.log("Received query params:", { classId, batchNumber });

    if (!classId || !batchNumber) {
      return res.status(400).json({ message: "classId and batchNumber are required" });
    }

    const filter = {
      classId: String(classId).trim(),
      batchNumber: String(batchNumber).trim(),
    };

    const examiners = await db.collection("examiners").find(filter).toArray();

    console.log("Matched examiners:", examiners.length);

    res.status(200).json(examiners);
  } catch (err) {
    console.error("Error fetching examiners:", err);
    res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};

const getAteacher2ndExaminersubjectList = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const db = getDB();
    console.log(teacherId)

    const result = await db
      .collection("examiners")
      .find({
        secondExaminerId: teacherId,
        secondExaminerUpdate: true
      })
      .toArray();
      console.log(result) ;

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching second examiner subject list:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


const getAteacher3rdExaminersubjectList = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const db = getDB();
    console.log(teacherId)

    const result = await db
      .collection("examiners")
      .find({
        thirdExaminerId: teacherId,
        thirdExaminerUpdate: true
      })
      .toArray();
      console.log(result) ;

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching second examiner subject list:", error);
    res.status(500).json({ message: "Server Error" });
  }
};



module.exports = {
    add_update_exam_committee,
    getCommittee,
    deleteCommittee,
    getTeacherInvolvementCommittee ,
    examiner_Add_Update ,
    getExaminerall,
    getAteacher2ndExaminersubjectList,
    getAteacher3rdExaminersubjectList
};