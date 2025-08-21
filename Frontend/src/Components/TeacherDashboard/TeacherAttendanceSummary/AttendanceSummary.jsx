import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import useAxiosPrivate from "../../../TokenAdd/useAxiosPrivate";
import { FaEdit } from "react-icons/fa";
import { FiAlertCircle } from "react-icons/fi";

const formatDate = (dateStr) => {
  const day = dateStr.slice(0, 2);
  const month = dateStr.slice(2, 4);
  const year = dateStr.slice(4, 8);
  return `${day}/${month}/${year}`;
};

const AttendanceSummary = () => {
  const location = useLocation();
  const { classId, subjectCode, title, batchNumber } = location.state || {};
  const AxiosSecure = useAxiosPrivate();
  console.log(location.state);
  const [attendanceData, setAttendanceData] = useState([]);
  const [allDates, setAllDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAttendanceSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await AxiosSecure.get(
        `/api/attendance/getAttendanceHistoryBY_class_subject/${classId}/${subjectCode}/${batchNumber}`
      );

      const data = response.data || [];
      console.log(data);
      const datesSet = new Set();

      data.forEach((student) => {
        student.attendances.forEach((record) => {
          datesSet.add(record.date);
        });
      });

      const sortedDates = Array.from(datesSet).sort();
      setAllDates(sortedDates);
      setAttendanceData(data);
    } catch (err) {
      console.error("Error fetching attendance summary", err);
      setError("Failed to load attendance data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!classId || !subjectCode) {
      setError("Missing class or subject information");
      return;
    }
    fetchAttendanceSummary();
  }, [classId, subjectCode]);

  const handleEditAttendance = async (studentInfo) => {
    //add user permesons

    try {
      const { roll, name, date, status, studentId } = studentInfo;
      const attendanceRecord = {
        roll,
        name,
        date,
        status: status === "P" ? "A" : "P",
        studentId,
        className: classId,
        subject: subjectCode,
      };

      const result = await AxiosSecure.post(
        "/api/attendance/update-single",
        attendanceRecord
      );

      if (result.data) {
        fetchAttendanceSummary();
      }
    } catch (err) {
      console.error("Error updating attendance", err);
      setError("Failed to update attendance. Please try again.");
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Attendance Summary
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2">
          <p className="text-gray-600">
            <span className="font-medium">Class:</span> {classId} |{" "}
            <span className="font-medium">Subject:</span> {title} ({subjectCode}
            )
          </p>
          <button
            onClick={fetchAttendanceSummary}
            className="mt-2 sm:mt-0 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
          <div className="flex items-center">
            <FiAlertCircle className="text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading attendance data...</p>
        </div>
      ) : attendanceData.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">
            No attendance records found for this class and subject.
          </p>
        </div>
      ) : (
        <div className="relative">
          <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="sticky left-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 z-10">
                    Roll
                  </th>
                  <th className="sticky left-16 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 z-10">
                    Name
                  </th>
                  {allDates.map((date) => (
                    <th
                      key={date}
                      className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs">{formatDate(date)}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceData.map((student, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="sticky left-0 px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-white z-5">
                      {student.roll}
                    </td>
                    <td className="sticky left-16 px-6 py-4 whitespace-nowrap text-sm text-gray-900 bg-white z-5">
                      {student.name}
                    </td>
                    {allDates.map((date) => {
                      const record = student.attendances.find(
                        (a) => a.date === date
                      );
                      const status = record?.status || "-";
                      const isPresent = status === "P";
                      const isAbsent = status === "A";

                      return (
                        <td
                          key={date}
                          className={`px-3 py-4 whitespace-nowrap text-sm text-center relative group ${
                            isPresent
                              ? "text-green-600 bg-green-50"
                              : isAbsent
                                ? "text-red-600 bg-red-50"
                                : "text-gray-400"
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1">
                            <span className="font-medium">{status}</span>
                            {record && (
                              <button
                                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-blue-500 transition-opacity duration-200 p-1"
                                onClick={() =>
                                  handleEditAttendance({
                                    roll: student.roll,
                                    name: student.name,
                                    date: record?.date,
                                    status: record?.status,
                                    studentId: student.studentId,
                                  })
                                }
                                title="Toggle Status"
                              >
                                <FaEdit size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-end space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-600"></div>
              <span className="text-xs text-gray-600">Present</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-600"></div>
              <span className="text-xs text-gray-600">Absent</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceSummary;
