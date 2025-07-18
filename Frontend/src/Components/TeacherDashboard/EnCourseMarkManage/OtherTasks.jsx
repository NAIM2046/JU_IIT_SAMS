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
  const [error, setError] = useState(null);

  const [number, setNumber] = useState("");
  const [fullMark, setFullMark] = useState("");
  const [isActive, setActive] = useState(false);

  const [bestCount, setBestCount] = useState(2);
  const [finalfullmark, setFinalmark] = useState(20);

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
        setLoading(true);
        setError(null);
        const result = await AxiosSecure.get(
          `/api/incoursemark/otherTaskMarkSummary/${classId}/${taskType}/${subjectCode}`
        );
        setStudentMarkList(result.data);
      } catch (error) {
        console.error("Failed to fetch data", error.message);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchOtherTaskSummary();
  }, [classId, subjectCode, taskType, AxiosSecure]);

  useEffect(() => {
    const saved = localStorage.getItem(
      `mark_${classId}_${subjectCode}_${taskType}`
    );
    if (saved) {
      setActive(true);
    }
  }, [classId, subjectCode, taskType]);

  // compute final mark
  const computeFinalMark = (marks) => {
    const filterMark = marks.filter(
      (m) => !m.typeNumber.includes(`${taskType}-final`)
    );
    const scores = filterMark.map((m) => (m.mark / m.fullMark) * 100);
    if (scores.length === 0) return "0.00";
    const bestScores = scores.sort((a, b) => b - a).slice(0, bestCount);
    const totalPercent = bestScores.reduce((sum, s) => sum + s, 0) / bestCount;
    return ((totalPercent / 100) * finalfullmark).toFixed(2);
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

      const res = await AxiosSecure.post(
        "/api/incoursemark/addAttendanceMark",
        payload
      );
      if (res.data) {
        alert("Final marks saved successfully!");
      }
    } catch (err) {
      console.error("Failed to save final marks", err.message);
      alert("Failed to save final marks. Please try again.");
    }
  };

  const handleAddTask = () => {
    if (!number || !fullMark) {
      alert("Please enter both task number and full mark");
      return;
    }

    const taskKey = `${taskType}-${number}`;
    if (typeColumns.includes(taskKey)) {
      alert(
        `Task ${taskKey} already exists. Please choose a different number.`
      );
    } else {
      setActive(true);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-0">
          {classId} - {subjectCode} - {taskType} Summary
        </h1>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded">
            {error}
          </div>
        )}
      </div>

      {/* Control Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Final Calculation Panel */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Final Calculation
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Final Full Mark
              </label>
              <input
                type="number"
                value={finalfullmark}
                onChange={(e) => setFinalmark(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
                step="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Best Count
              </label>
              <select
                value={bestCount}
                onChange={(e) => setBestCount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={1}>Best 1</option>
                <option value={2}>Best 2</option>
                <option value={3}>Best 3</option>
                <option value={4}>Best 4</option>
              </select>
            </div>
          </div>
        </div>

        {/* Add Task Panel */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Add New Task
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Number
              </label>
              <input
                type="number"
                placeholder="e.g. 1"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
                step="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Full Mark
              </label>
              <input
                type="number"
                placeholder="e.g. 10"
                value={fullMark}
                onChange={(e) => setFullMark(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
                step="1"
              />
            </div>
            <button
              onClick={handleAddTask}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add Task
            </button>
          </div>
        </div>
      </div>

      {/* Input Modal */}
      {isActive && (
        <InputInCourseMark
          classId={classId}
          subjectCode={subjectCode}
          number={number}
          taskType={taskType}
          fullMark={fullMark}
          setFullMark={setFullMark}
          setActive={setActive}
          setNumber={setNumber}
        />
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && studentMarkList.length === 0 && (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No data found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            No student data found for this task.
          </p>
        </div>
      )}

      {/* Data Table */}
      {!loading && studentMarkList.length > 0 && (
        <>
          <div className="overflow-x-auto shadow-md rounded-lg mb-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Photo
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Roll
                  </th>
                  {typeColumns.map((type, idx) => (
                    <th
                      key={idx}
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {type}
                    </th>
                  ))}
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Final ({finalfullmark})
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {studentMarkList.map((student) => (
                  <tr key={student.studentId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={student.photoURL}
                            alt={student.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://via.placeholder.com/40";
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.class_roll}
                    </td>
                    {typeColumns.map((type, idx) => {
                      const markObj = student.mark.find(
                        (m) => m.typeNumber === type
                      );
                      return (
                        <td
                          key={idx}
                          className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500"
                        >
                          {markObj
                            ? `${markObj.mark} / ${markObj.fullMark}`
                            : "-"}
                        </td>
                      );
                    })}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-blue-600">
                      {computeFinalMark(student.mark)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSaveFinalMarks}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Save Final Marks
            </button>
          </div>
        </>
      )}

      {/* Task List */}
      <div className="mt-10 bg-amber-50 p-6 rounded-lg shadow-sm border border-amber-100">
        <OtherTaskList
          classId={classId}
          subjectCode={subjectCode}
          taskType={taskType}
          setActive={setActive}
        />
      </div>
    </div>
  );
};

export default OtherTasks;
