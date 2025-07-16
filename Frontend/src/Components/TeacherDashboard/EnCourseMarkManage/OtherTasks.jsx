import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import useAxiosPrivate from "../../../TokenAdd/useAxiosPrivate";
import InputInCourseMark from "./InputInCourseMark";
import OtherTaskList from "./OtherTaskList";

const OtherTasks = () => {
  const location = useLocation();
  const classId = location.state?.classId;
  const subjectCode = location.state?.subjectCode;
  const taskType = location.state?.taskType;

  const AxiosSecure = useAxiosPrivate();
  const [studentMarkList, setStudentMarkList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [number, setNumber] = useState("");
  const [fullMark, setFullMark] = useState("");
  const [isActive, setActive] = useState(false);

  const [bestCount, setBestCount] = useState(2); // default best 2
  const [finalfullmark, setFinalmark] = useState(0);

  // extract all type columns like quiz-1, quiz-2
  const typeColumns = Array.from(
    new Set(
      studentMarkList.flatMap((student) =>
        student.mark.map((m) => m.typeNumber)
      )
    )
  );

  // fetch data
  useEffect(() => {
    const fetchOtherTaskSummary = async () => {
      try {
        const result = await AxiosSecure.get(
          `/api/incoursemark/otherTaskMarkSummary/${classId}/${taskType}/${subjectCode}`
        );
        setStudentMarkList(result.data);
      } catch (error) {
        console.error("Failed to fetch data", error.message);
      }
      setLoading(false);
    };
    fetchOtherTaskSummary();
  }, [classId, subjectCode, taskType]);

  useEffect(() => {
    const saved = localStorage.getItem(
      `mark_${classId}_${subjectCode}_${taskType}`
    );
    if (saved) {
      setActive(true);
    }
  }, [classId, subjectCode, taskType]);

  // compute final mark out of 20
  const computeFinalMark = (marks) => {
    const filterMark = marks.filter(
      (m) => !m.typeNumber.includes(`${taskType}-final`)
    );
    const scores = filterMark.map((m) => (m.mark / m.fullMark) * 100); // percentage
    const bestScores = scores.sort((a, b) => b - a).slice(0, bestCount);
    const totalPercent = bestScores.reduce((sum, s) => sum + s, 0) / bestCount; // average
    return ((totalPercent / 100) * finalfullmark).toFixed(2); // scale to 20
  };

  const handleSaveFinalMarks = async () => {
    try {
      const payload = {
        classId,
        subjectCode,
        Number: "final",
        type: taskType,
        fullMark: parseInt(finalfullmark),
        marks: studentMarkList.map((student) => ({
          studentId: student.studentId,
          mark: parseFloat(computeFinalMark(student.mark)),
        })),
      };

      console.log(payload);

      const res = await AxiosSecure.post(
        "/api/incoursemark/addAttendanceMark",
        payload
      );
      if (res.data) {
        console.log(res.data.message);
        alert("Final marks saved successfully!");
      }
    } catch (err) {
      console.error("Failed to save final marks", err.message);
      alert("Failed to save final marks.");
    }
  };
  console.log(studentMarkList);
  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">
          {classId} , {subjectCode} , {taskType} Summary
        </h1>

        <div className="flex flex-wrap gap-6 items-center">
          {/* Final Calculation Section */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold">Final Full Mark</label>
            <input
              type="number"
              placeholder="e.g. 20"
              value={finalfullmark}
              onChange={(e) => setFinalmark(e.target.value)}
              className="border px-3 py-1 rounded w-36"
            />

            <label className="text-sm font-semibold mt-2">Best Count</label>
            <select
              value={bestCount}
              onChange={(e) => setBestCount(Number(e.target.value))}
              className="border px-3 py-1 rounded w-36"
            >
              <option value={1}>Best 1</option>
              <option value={2}>Best 2</option>
              <option value={3}>Best 3</option>
            </select>
          </div>

          {/* Add Task Section */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold">Task Number</label>
            <input
              type="number"
              placeholder="Number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className="border px-3 py-1 rounded w-36"
            />

            <label className="text-sm font-semibold mt-2">Task Full Mark</label>
            <input
              type="number"
              placeholder="Full Mark"
              value={fullMark}
              onChange={(e) => setFullMark(e.target.value)}
              className="border px-3 py-1 rounded w-36"
            />

            <button
              onClick={() => {
                const taskKey = `${taskType}-${number}`;
                if (typeColumns.includes(taskKey)) {
                  alert(
                    `Task ${taskKey} already exists. Please choose a different number.`
                  );
                } else {
                  setActive(true);
                }
              }}
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              + Add Task
            </button>
          </div>
        </div>
      </div>

      {isActive && (
        <InputInCourseMark
          classId={classId}
          subjectCode={subjectCode}
          number={number}
          taskType={taskType}
          fullMark={fullMark}
          setActive={setActive}
        />
      )}

      {loading ? (
        <p>Loading...</p>
      ) : studentMarkList.length === 0 ? (
        <p className="text-gray-500">No data found for this task.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="py-2 px-4">Photo</th>
                  <th className="py-2 px-4">Name</th>
                  <th className="py-2 px-4">Roll</th>
                  {typeColumns.map((type, idx) => (
                    <th key={idx} className="py-2 px-4">
                      {type}
                    </th>
                  ))}
                  <th className="py-2 px-4">Final {finalfullmark}</th>
                </tr>
              </thead>
              <tbody>
                {studentMarkList.map((student) => (
                  <tr
                    key={student.studentId}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="py-2 px-4">
                      <img
                        src={student.photoURL}
                        alt={student.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </td>
                    <td className="py-2 px-4">{student.name}</td>
                    <td className="py-2 px-4">{student.class_roll}</td>
                    {typeColumns.map((type, idx) => {
                      const markObj = student.mark.find(
                        (m) => m.typeNumber === type
                      );
                      return (
                        <td key={idx} className="py-2 px-4 text-center">
                          {markObj
                            ? `${markObj.mark} / ${markObj.fullMark}`
                            : "-"}
                        </td>
                      );
                    })}
                    <td className="py-2 px-4 text-center font-bold">
                      {computeFinalMark(student.mark)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={handleSaveFinalMarks}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            💾 Save Final Marks
          </button>
        </>
      )}

      <div className="bg-amber-200">
        <OtherTaskList
          classId={classId}
          subjectCode={subjectCode}
          taskType={taskType}
          setActive={setActive}
        ></OtherTaskList>
      </div>
    </div>
  );
};

export default OtherTasks;
