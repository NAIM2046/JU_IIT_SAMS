import React, { useEffect, useState } from "react";
import useAxiosPrivate from "../../../TokenAdd/useAxiosPrivate";

const InputInCourseMark = ({
  classId,
  subjectCode,
  number,
  taskType,
  fullMark,
  setActive,
}) => {
  const AxiosSecure = useAxiosPrivate();
  const [markinputlist, setmarkinputlist] = useState([]);

  useEffect(() => {
    const storageKey = `mark_${classId}_${subjectCode}_${taskType}`;
    const fatchStudent = async () => {
      const result = await AxiosSecure.get(
        `/api/auth/getStudentByClassandSection/${classId}`
      );
      const students = result.data.map((s) => ({
        studentId: s._id,
        roll: s.class_roll,
        name: s.name,
        fullMark,
        Number: number,
        mark: "",
      }));
      setmarkinputlist(students);
      localStorage.setItem(storageKey, JSON.stringify(students));
    };

    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setmarkinputlist(JSON.parse(saved));
    } else {
      fatchStudent();
    }
  }, [classId, subjectCode, taskType, number]);

  console.log(markinputlist);

  const handleMarkChange = (index, value) => {
    const newList = [...markinputlist];
    newList[index].mark = value;
    setmarkinputlist(newList);
    localStorage.setItem(
      `mark_${classId}_${subjectCode}_${taskType}`,
      JSON.stringify(newList)
    );
  };

  const handleSave = async () => {
    try {
      const payload = {
        classId,
        subjectCode,
        Number: markinputlist[0].Number,
        type: taskType,
        fullMark: parseInt(markinputlist[0].fullMark),
        marks: markinputlist.map((s) => ({
          studentId: s.studentId,
          mark: parseInt(s.mark),
        })),
      };
      console.log(payload);
      const res = await AxiosSecure.post(
        "/api/incoursemark/addAttendanceMark",
        payload
      );
      if (res.data) {
        alert("Marks saved successfully!");
        setActive(false);
        localStorage.removeItem(`mark_${classId}_${subjectCode}_${taskType}`);
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to save marks", error.message);
      alert("Failed to save marks.");
    }
  };

  return (
    <div className="p-6">
      <table className="min-w-full bg-white border">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="py-2 px-4">Photo</th>
            <th className="py-2 px-4">Name</th>
            <th className="py-2 px-4">Roll</th>
            <th className="py-2 px-4">Mark</th>
          </tr>
        </thead>
        <tbody>
          {markinputlist.map((student, idx) => (
            <tr key={student.studentId} className="border-b hover:bg-gray-50">
              <td className="py-2 px-4">
                <img
                  src={student.photoURL}
                  alt={student.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              </td>
              <td className="py-2 px-4">{student.name}</td>
              <td className="py-2 px-4">{student.roll}</td>
              <td className="py-2 px-4">
                <input
                  type="number"
                  value={student.mark}
                  onChange={(e) => handleMarkChange(idx, e.target.value)}
                  className="border px-3 py-1 rounded w-24"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={handleSave}
        className="mt-4 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
      >
        Save Marks
      </button>
      <button
        onClick={() => {
          setActive(false);
          localStorage.removeItem(`mark_${classId}_${subjectCode}_${taskType}`);
        }}
        className="mt-4 px-6 py-2 bg-red-600 text-white rounded  transition cursor-pointer"
      >
        Cancel
      </button>
    </div>
  );
};

export default InputInCourseMark;
