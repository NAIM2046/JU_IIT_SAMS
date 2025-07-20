import React, { useEffect, useState } from "react";
import useAxiosPrivate from "../../../TokenAdd/useAxiosPrivate";

const InputInCourseMark = ({
  classId,
  subjectCode,
  number,
  taskType,
  fullMark,
  setActive,
  setFullMark,
  setNumber,
}) => {
  const AxiosSecure = useAxiosPrivate();
  const [markinputlist, setmarkinputlist] = useState([]);

  useEffect(() => {
    const storageKey = `mark_${classId}_${subjectCode}_${taskType}`;
    const fetchStudent = async () => {
      try {
        const result = await AxiosSecure.get(
          `/api/auth/getStudentByClassandSection/${classId}`
        );
        const students = result.data.map((s) => ({
          studentId: s._id,
          class_roll: s.class_roll,
          name: s.name,
          photoURL: s.photoURL || "https://via.placeholder.com/40",
          fullMark: fullMark,
          Number: number,
          mark: "",
        }));
        setmarkinputlist(students);
        localStorage.setItem(storageKey, JSON.stringify(students));
      } catch (error) {
        console.error("Failed to fetch students", error.message);
      }
    };

    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved) {
      setmarkinputlist(saved);
      setFullMark(saved[0].fullMark);
      setNumber(saved[0].Number);
    } else {
      fetchStudent();
    }
  }, [classId, subjectCode, taskType, number]);

  const handleMarkChange = (index, value) => {
    // Allow only numbers or empty string
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      const num = parseFloat(value);
      if (num > fullMark) {
        alert(`❌ Mark cannot exceed full mark (${fullMark})`);
        return;
      }
      if (num < 0) {
        alert("❌ Mark cannot be negative");
        return;
      }

      const updatedList = [...markinputlist];
      updatedList[index].mark = value; // Keep it as string for input
      setmarkinputlist(updatedList);
      localStorage.setItem(
        `mark_${classId}_${subjectCode}_${taskType}`,
        JSON.stringify(updatedList)
      );
    }
  };

  const handleSave = async () => {
    const hasEmpty = markinputlist.some(
      (s) => s.mark === "" || isNaN(Number(s.mark))
    );

    if (hasEmpty) {
      alert("❌ Please fill in all marks with valid numbers before saving.");
      return;
    }

    const payload = {
      classId,
      subjectCode,
      Number: markinputlist[0].Number,
      type: taskType,
      fullMark: parseInt(markinputlist[0].fullMark),
      marks: markinputlist.map((s) => ({
        studentId: s.studentId,
        mark: parseFloat(s.mark),
      })),
    };

    try {
      const res = await AxiosSecure.post(
        "/api/incoursemark/addAttendanceMark",
        payload
      );

      if (res.data) {
        alert("✅ Marks saved successfully!");
        setActive(false);
        localStorage.removeItem(`mark_${classId}_${subjectCode}_${taskType}`);
        window.location.reload();
      }
    } catch (error) {
      console.error("❌ Failed to save marks", error.message);
      alert("❌ Failed to save marks.");
    }
  };

  return (
    <div className="relative min-h-screen p-4 md:p-10 bg-gray-100">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-white to-purple-100 opacity-50 blur-sm z-0 rounded-xl" />
      <div className="relative z-10 max-w-6xl mx-auto bg-white/80 backdrop-blur-md p-6 md:p-10 rounded-2xl shadow-xl">
        <div className="mb-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-blue-800">
            Input Marks for {taskType} - {subjectCode}
          </h2>
          <p className="text-gray-600 mt-2">
            📚 Class: <strong>{classId}</strong> &nbsp;|&nbsp; ✏️ Task No:{" "}
            <strong>{number}</strong> &nbsp;|&nbsp; 🎯 Full Mark:{" "}
            <strong>{fullMark}</strong>
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl shadow">
          <table className="min-w-full text-sm md:text-base border border-gray-200 bg-white">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="py-3 px-4 border">📸 Photo</th>
                <th className="py-3 px-4 border">👤 Name</th>
                <th className="py-3 px-4 border">🔢 Roll</th>
                <th className="py-3 px-4 border">✍️ Mark</th>
              </tr>
            </thead>
            <tbody>
              {markinputlist.map((student, idx) => (
                <tr
                  key={student.studentId}
                  className="hover:bg-gray-50 transition border-b"
                >
                  <td className="py-2 px-4 border text-center">
                    <img
                      src={student.photoURL}
                      alt={student.name}
                      className="w-10 h-10 rounded-full object-cover mx-auto"
                    />
                  </td>
                  <td className="py-2 px-4 border">{student.name}</td>
                  <td className="py-2 px-4 border text-center">
                    {student.class_roll}
                  </td>
                  <td className="py-2 px-4 border text-center">
                    <input
                      type="text"
                      value={student.mark}
                      onChange={(e) => handleMarkChange(idx, e.target.value)}
                      className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder={`0 - ${fullMark}`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleSave}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition duration-300"
          >
            ✅ Save Marks
          </button>
          <button
            onClick={() => {
              setActive(false);
              localStorage.removeItem(
                `mark_${classId}_${subjectCode}_${taskType}`
              );
            }}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition duration-300"
          >
            ❌ Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputInCourseMark;
