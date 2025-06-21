import React, { useEffect, useState } from "react";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";
import useStroge from "../../stroge/useStroge";
import {
  FiUser,
  FiHash,
  FiAward,
  FiPercent,
  FiSave,
  FiTrash2,
  FiBook,
  FiHome,
} from "react-icons/fi";
import { FaChalkboardTeacher } from "react-icons/fa";
import { ImSpinner8 } from "react-icons/im";

const CurrentExam = () => {
  const AxiosSecure = useAxiosPrivate();
  const { user } = useStroge();

  const [currentExam, setCurrentExam] = useState(null);
  const [updatedMarks, setUpdatedMarks] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchCurrentExam = async () => {
      try {
        const res = await AxiosSecure.post("/api/exam/currentExam", {
          teacherId: user._id,
        });
        console.log("Current Exam Info:", res.data);
        if (res.data) {
          setCurrentExam(res.data);
          const markData = {};
          res.data.studentsInfo.forEach((student) => {
            markData[student.studentId] = student.marks ?? 0; // Default to 0 if marks is null/undefined
          });
          setUpdatedMarks(markData);
        }
      } catch (err) {
        console.error("Error fetching current exam info:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentExam();
  }, [user._id, AxiosSecure]);

  const handleMarkChange = async (studentId, value) => {
    const newValue = Math.min(Math.max(0, value), currentExam.totalMark);
    setUpdatedMarks((prev) => ({
      ...prev,
      [studentId]: newValue,
    }));

    try {
      await AxiosSecure.post("/api/exam/updateOneStudentMark", {
        examId: currentExam._id,
        studentId: studentId,
        marks: newValue,
      });
    } catch (err) {
      console.error("Error updating marks:", err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await AxiosSecure.post("/api/exam/examSave", { examId: currentExam._id });
      window.location.reload();
    } catch (err) {
      console.error("Error saving marks:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this exam?")) return;

    setDeleting(true);
    try {
      await AxiosSecure.delete(
        `/api/exam/deleteCurrentExam/${currentExam._id}`
      );
      setCurrentExam(null);
    } catch (err) {
      console.error("Error deleting exam:", err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ImSpinner8 className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  if (!currentExam || !currentExam.studentsInfo?.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <FiBook className="text-gray-400 text-3xl" />
        </div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          No Current Exam
        </h3>
        <p className="text-gray-500">There is no active exam to display.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Exam Header */}
      <div className="bg-blue-50 p-6 border-b border-blue-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <FiAward className="mr-3 text-blue-600" />
          Current Exam
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center">
            <FiHome className="text-blue-500 mr-2" />
            <span className="font-medium">Class:</span>
            <span className="ml-2">{currentExam.class}</span>
          </div>
          <div className="flex items-center">
            <FiBook className="text-blue-500 mr-2" />
            <span className="font-medium">Subject:</span>
            <span className="ml-2">{currentExam.subject}</span>
          </div>
          <div className="flex items-center">
            <FaChalkboardTeacher className="text-blue-500 mr-2" />
            <span className="font-medium">Type:</span>
            <span className="ml-2">{currentExam.examType}</span>
          </div>
          <div className="flex items-center">
            <FiPercent className="text-blue-500 mr-2" />
            <span className="font-medium">Total Marks:</span>
            <span className="ml-2">{currentExam.totalMark}</span>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <FiUser className="mr-2" /> Student
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <FiHash className="mr-2" /> Roll
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Marks
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Percentage
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentExam.studentsInfo.map((student) => {
              const mark = updatedMarks[student.studentId] || 0;
              const percent = (
                (Number(mark) / Number(currentExam.totalMark)) *
                100
              ).toFixed(2);

              return (
                <tr key={student.studentId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {student.Name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {student.roll}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      value={updatedMarks[student.studentId]}
                      onChange={(e) =>
                        handleMarkChange(
                          student.studentId,
                          e.target.value === "" ? 0 : parseInt(e.target.value)
                        )
                      }
                      className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      max={currentExam.totalMark}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        percent >= 80
                          ? "bg-green-100 text-green-800"
                          : percent >= 50
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {percent}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Action Buttons */}
      <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className={`flex items-center px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md transition-colors ${
            deleting ? "opacity-75 cursor-not-allowed" : ""
          }`}
        >
          {deleting ? (
            <>
              <ImSpinner8 className="animate-spin mr-2" />
              Deleting...
            </>
          ) : (
            <>
              <FiTrash2 className="mr-2" />
              Cancel Exam
            </>
          )}
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-colors ${
            saving ? "opacity-75 cursor-not-allowed" : ""
          }`}
        >
          {saving ? (
            <>
              <ImSpinner8 className="animate-spin mr-2" />
              Publishing...
            </>
          ) : (
            <>
              <FiSave className="mr-2" />
              Publish Marks
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CurrentExam;
