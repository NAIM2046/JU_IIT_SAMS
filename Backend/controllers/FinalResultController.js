const { getDB } = require("../config/db.js");

const getGradeAndPoint = (markPercent) => {
  if (markPercent >= 80) return { grade: "A+", point: 4.00 };
  if (markPercent >= 75) return { grade: "A", point: 3.75 };
  if (markPercent >= 70) return { grade: "A-", point: 3.50 };
  if (markPercent >= 65) return { grade: "B+", point: 3.25 };
  if (markPercent >= 60) return { grade: "B", point: 3.00 };
  if (markPercent >= 55) return { grade: "B-", point: 2.75 };
  if (markPercent >= 50) return { grade: "C+", point: 2.50 };
  if (markPercent >= 45) return { grade: "C", point: 2.25 };
  if (markPercent >= 40) return { grade: "D", point: 2.00 };
  return { grade: "F", point: 0.00 };
};

const getFinalResults = async (req, res) => {
  const db = getDB();
  const { classId, batchNumber } = req.params;
  console.log("Fetching final results for:", { classId, batchNumber });

  try {
    // 1. Students
    let results = await db.collection("users").find(
      { class: classId },
      { projection: { _id: 1, name: 1, class_roll: 1 } }
    ).toArray();

    results = results.map(st => ({
      studentId: st._id.toString(),
      name: st.name,
      class_roll: st.class_roll,
      classId,
      batchNumber,
      isRetake: false,
      cgpa: 0,
      subjectList: []
    }));

    // 2. Subjects
    const courseInfo = await db.collection("classes").findOne({
      class: classId,
      batchNumber: batchNumber
    });
    const subjects = courseInfo?.subjects || [];

        const subjectCodes = courseInfo.subjects.map(s => s.code.trim());
   // console.log("Subject Codes:", subjectCodes);

     let retakeStudents = await db.collection("failed_subjects").aggregate([
      { $match: { subjectCode: { $in: subjectCodes } } },
      { $group: { _id: "$studentId",
          studentName: { $first: "$studentName" },
          classId: { $first: "$classId" },
          batchNumber: { $first: "$batchNumber" } ,
          class_roll: { $first: "$class_roll" } }
      },
      {
        $project: {
          _id: 0,
          studentId: "$_id",
          studentName: 1,
          classId: 1,
          batchNumber: 1,
          class_roll:1

        }
      }
    ]).toArray();
     retakeStudents = retakeStudents.map(rs =>({
      studentId: rs.studentId,
      name: rs.studentName,
      classId: rs.classId,
      batchNumber: rs.batchNumber,
      isRetake: true,
      subjectList: [],
      cgpa: 0,
      class_roll: rs.class_roll

    })) ;
    results = results.concat(retakeStudents);

    const seen = new Map();
results.forEach(st => {
  if (!seen.has(st.studentId)) {
    seen.set(st.studentId, st);
  } else {
    // If already exists, update to mark retake = true
    const existing = seen.get(st.studentId);
    existing.isRetake = existing.isRetake || st.isRetake;
  }
});
results = Array.from(seen.values());

    results = results.map(st => ({
      ...st,
      subjectList: subjects.map(sub => ({
        subjectCode: sub.code.trim(),
        subjectName: sub.title.trim(),
        incourseMark: 0,
        finalMark: 0,
        totalMark: 0,
        percentage: 0,
        fullMark: 100,
        grade: "",
        point: 0,
        credit: Number(sub.credit)
      }))
    }));
   // console.log("Initial Results:", results);



    // 3. In-course marks
  const incourseMarks = await db.collection("incourse_marks").aggregate([
  {
    $match: { 
      type: "incoursefinal", 
      subjectCode: { $in: subjectCodes }, // ✅ singular
      classId 
    } 
  },
  { $unwind: "$marks" },
  { 
    $match: { 
      "marks.studentId": { $in: results.map(r => r.studentId) } 
    } 
  },
  { 
    $project: { 
      _id: 0,
      subjectCode: 1, 
      studentId: "$marks.studentId", // ✅ flatten
      mark: "$marks.mark" 
    } 
  }
]).toArray();

   console.log("In-course Marks:", incourseMarks);

    const incourseMap = new Map();
    incourseMarks.forEach(entry => {

        const key = `${entry.studentId}_${entry.subjectCode}`;
        incourseMap.set(key, entry.mark);

    });
  
    // 4. Final marks
    const finalMarks = await db.collection("final_marks").aggregate([
      { $match: { subject: { $in: subjectCodes }, classId } },
      { $match: { studentId: { $in: results.map(r => r.studentId) } } },
      { $project: { studentId: 1, subject: 1, holdquestionobtionmark: 1, holdquestionfullmark: 1 } }
    ]).toArray();
   //console.log("Final Marks:", finalMarks);

    const finalMap = new Map(
      finalMarks.map(m => [`${m.studentId}_${m.subject}`, m])
    );

    // 5. Merge + Grade + CGPA
    results = results.map(student => {
      let totalCredits = 0;
      let weightedPoints = 0;

      const subjectList = student.subjectList.map(subject => {
        const key = `${student.studentId}_${subject.subjectCode}`;

        // In-course
        if (incourseMap.has(key)) {
          subject.incourseMark = incourseMap.get(key);
        }

        // Final
        if (finalMap.has(key)) {
          const entry = finalMap.get(key);
          subject.finalMark = entry.holdquestionobtionmark;
         // subject.fullMark = entry.holdquestionfullmark;
        }

        // Total
        subject.totalMark = subject.incourseMark + subject.finalMark;

        // % calculation (out of fullMark)
        const percent = (subject.totalMark / subject.fullMark) * 100;

        subject.percentage = percent;

        // Grade + Point
        const { grade, point } = getGradeAndPoint(percent);
        subject.grade = grade;
        subject.point = point;

        // For CGPA
        totalCredits += subject.credit;
        weightedPoints += subject.credit * point;

        return subject;
      });

      const cgpa = totalCredits > 0 ? (weightedPoints / totalCredits).toFixed(2) : "0.00";

      return {
        ...student,
        subjectList,
        cgpa
      };
    });

   
   
   

    
    // console.log("Retake Students:", retakeStudents);
    res.status(200).json(results);

  } catch (error) {
    console.error("Error fetching final results:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const final_mark_insert = async (req, res) => {
  const db = getDB();
  const studentResultList = req.body;
  console.log("Inserting final marks for:", studentResultList.length, "students");

  try {
    // Bulk update for semester_final_results
    const bulkOps = studentResultList.map(student => ({
      updateOne: {
        filter: { studentId: student.studentId, classId: student.classId, batchNumber: student.batchNumber },
        update: { $set: { subjectList: student.subjectList, cgpa: student.cgpa } },
        upsert: true
      }
    }));

    await db.collection("semester_final_results").bulkWrite(bulkOps);

    // Now handle fail subjects
    for (const student of studentResultList) {
      for (const subject of student.subjectList) {
        const isFail = subject.percentage < 40; // <-- adjust fail condition
        const failFilter = {
          studentId: student.studentId,
          subjectCode: subject.subjectCode,
        };

        if (isFail) {
          // If failed → upsert into failed_subjects
          await db.collection("failed_subjects").updateOne(
            failFilter,
            {
              $set: {
                studentId: student.studentId,
                studentName: student.name,
                classId: student.classId,
                class_roll: student.class_roll,
                batchNumber: student.batchNumber,
                subjectCode: subject.subjectCode,
                subjectName: subject.subjectName,
                obtainedMarks: subject.obtainedMarks,
                fullMarks: subject.fullMarks,
                percentage: subject.percentage,
                failedAt: new Date(),
              },
            },
            { upsert: true }
          );
        } else {
          // If passed now → remove from failed_subjects if it existed before
          await db.collection("failed_subjects").deleteOne(failFilter);
        }
      }
    }

    res.status(200).json({ message: "Final marks and fail subjects updated successfully" });
  } catch (error) {
    console.error("Error inserting final marks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getFinalResultsAstudent = async (req, res) => {
  const db = getDB();
  const { studentId, classId } = req.params;
  console.log("Fetching final results for student:", { studentId, classId });

  try {
    const result = await db.collection("semester_final_results").findOne({
      studentId,
      classId
     
    });

    if (!result) {
      return res.status(404).json({ error: "Final results not found" });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching final results:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getFailSubjects = async (req, res) => {
  const db = getDB();
  const { studentId } = req.params;
  console.log("Fetching fail subjects for student:", studentId);
  try {
    const failSubjects = await db.collection("failed_subjects").find({ studentId }).toArray();
    res.status(200).json(failSubjects);
  } catch (error) {
    console.error("Error fetching fail subjects:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


module.exports = { getFinalResults, final_mark_insert, getFinalResultsAstudent , getFailSubjects };
