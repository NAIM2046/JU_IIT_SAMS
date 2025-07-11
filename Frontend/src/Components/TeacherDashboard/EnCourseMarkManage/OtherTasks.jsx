import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAxiosPrivate from "../../../TokenAdd/useAxiosPrivate";

const OtherTasks = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const classId = location.state?.classId;
  const subjectCode = location.state?.subjectCode;
  const taskType = location.state?.taskType;

  const AxiosSecure = useAxiosPrivate();
  const [studentMarkList, setStudentMarkList] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Other Task Summary</h1>
        <button
          onClick={() =>
            navigate("/add-task", { state: { classId, subjectCode, taskType } })
          }
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          + Add New Task
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : studentMarkList.length === 0 ? (
        <p className="text-gray-500">No data found for this task.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="py-2 px-4">Photo</th>
                <th className="py-2 px-4">Name</th>
                <th className="py-2 px-4">Roll</th>
                <th className="py-2 px-4">Marks</th>
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
                  <td className="py-2 px-4">
                    <div className="space-y-1">
                      {student.mark.map((m, idx) => (
                        <div key={idx}>
                          <span className="font-medium">{m.typeNumber}:</span>{" "}
                          {m.mark} / {m.fullMark}
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OtherTasks;
