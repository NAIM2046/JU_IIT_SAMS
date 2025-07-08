import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import useAxiosPrivate from "../../../TokenAdd/useAxiosPrivate";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AttendanceMark = () => {
  const location = useLocation();
  const classId = location.state?.classId;
  const subject = location.state?.subject;
  const AxiosSecure = useAxiosPrivate();

  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalAttendanceMark, setTotalAttendanceMark] = useState(10);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!classId || !subject?.code) return;

    setLoading(true);
    setError(null);

    AxiosSecure.get(
      `/api/attendance/getAttendanceAsubject/${classId}/${subject.code}`
    )
      .then((res) => {
        setAttendanceList(res.data);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to fetch attendance data. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [classId, subject?.code, AxiosSecure]);

  const handleSaveMarks = () => {
    const marksData = attendanceList.map((record) => {
      const total = record.presentCount + record.absentCount;
      const presentPercent =
        total > 0 ? (record.presentCount / total) * 100 : 0;
      const attendanceMark = (
        (presentPercent / 100) *
        totalAttendanceMark
      ).toFixed(2);

      return {
        studentId: record.studentId,
        attendanceMark: parseFloat(attendanceMark),
      };
    });

    setSaving(true);
    AxiosSecure.post("/api/attendance/saveAttendanceMarks", {
      classId,
      subjectCode: subject.code,
      type: "attendance",
      Number: "final",
      marks: marksData,
    })
      .then(() => {
        toast.success("Attendance marks saved successfully!");
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to save attendance marks. Please try again.");
      })
      .finally(() => {
        setSaving(false);
      });
  };

  const getProgressBarColor = (percentage) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6">
        {/* Header Section */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            Attendance Marks for {subject?.title} ({subject?.code})
          </h2>
          <p className="text-gray-600 mt-1">
            Class: {classId} | Total Students: {attendanceList.length}
          </p>
        </div>

        {/* Controls Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-3">
            <label className="font-medium text-gray-700">
              Total Attendance Mark:
            </label>
            <input
              type="number"
              min="1"
              className="w-20 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={totalAttendanceMark}
              onChange={(e) => setTotalAttendanceMark(Number(e.target.value))}
            />
          </div>
          <button
            onClick={handleSaveMarks}
            disabled={saving || loading || attendanceList.length === 0}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              saving || loading || attendanceList.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </span>
            ) : (
              "Save Marks"
            )}
          </button>
        </div>

        {/* Status Indicators */}
        {loading && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
            <div className="bg-blue-600 h-2.5 rounded-full animate-pulse"></div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
            <p>{error}</p>
          </div>
        )}

        {/* Main Content */}
        {attendanceList.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Roll
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Present
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Absent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Attendance %
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Mark
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceList.map((record, idx) => {
                  const total = record.presentCount + record.absentCount;
                  const presentPercent =
                    total > 0 ? (record.presentCount / total) * 100 : 0;
                  const attendanceMark = (
                    (presentPercent / 100) *
                    totalAttendanceMark
                  ).toFixed(2);

                  return (
                    <tr
                      key={idx}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {idx + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.classRoll}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.presentCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.absentCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-500 w-16">
                            {presentPercent.toFixed(2)}%
                          </span>
                          <div className="ml-2 w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getProgressBarColor(
                                presentPercent
                              )}`}
                              style={{ width: `${presentPercent}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {attendanceMark}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          !loading && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                No attendance records found
              </h3>
              <p className="mt-1 text-gray-500">
                There are no attendance records available for this class and
                subject.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default AttendanceMark;
