import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";
import {
  FiUser,
  FiBook,
  FiCheckCircle,
  FiXCircle,
  FiAward,
  FiTrendingUp,
  FiTrendingDown,
  FiSave,
} from "react-icons/fi";
import { FaChalkboardTeacher } from "react-icons/fa";

const EveryClass = () => {
  const location = useLocation();
  const schedule = location.state?.schedule;
  const DateFormate = location.state?.formattedDate;
  const teacherName = location.state?.teacherName;
  const [students, setStudents] = useState([]);
  const [defaultAttendance, setDefaultAttendance] = useState("");
  const [isAttendanceSubmitted, setIsAttendanceSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const AxiosSecure = useAxiosPrivate();
  console.log("Schedule:", schedule);
  console.log("Date:", DateFormate);
  console.log("Teacher Name:", teacherName);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        if (!schedule?.classId || !schedule?.subject) return;

        // 1. Get student list
        const res = await AxiosSecure.get(
          `/api/auth/getStudentByClassandSection/${schedule.classId}`
        );

        let updatedStudents = res.data.map((student) => ({
          ...student,
          attendance: "",
          totalTasks: 0,
          latestEvaluation: "",
        }));

        // 2. Check attendance record
        try {
          const attendanceRes = await AxiosSecure.get(
            `/api/attendance/check/${schedule.classId}/${schedule.subject}/${DateFormate}`
          );

          const existingAttendance = attendanceRes.data;
          if (existingAttendance && existingAttendance.records) {
            setIsAttendanceSubmitted(true);
            updatedStudents = updatedStudents.map((student) => {
              const match = existingAttendance.records.find(
                (rec) => rec.studentId === student._id
              );
              return {
                ...student,
                attendance: match ? match.status : "",
              };
            });
          }
        } catch (error) {
          console.error("Attendance not found:", error);
          setIsAttendanceSubmitted(false);
        }

        // 3. Get performance data
        try {
          const performanceRes = await AxiosSecure.get(
            `/api/performance/byClassAndSubject/${schedule.classId}/${schedule.subject}`
          );
          const performanceData = performanceRes.data;

          updatedStudents = updatedStudents.map((student) => {
            const performance = performanceData.find(
              (perf) => perf.studentId === student._id
            );
            return {
              ...student,
              totalTasks: performance?.totalTasks || 0,
              latestEvaluation: performance?.latestEvaluation || "",
            };
          });
        } catch (err) {
          console.error("Failed to fetch performance:", err);
        }

        setStudents(updatedStudents);
      } catch (err) {
        console.error("Failed to fetch students:", err);
        setError("Failed to load student data");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [schedule?.classId, schedule?.subject, DateFormate, AxiosSecure]);

  const updateSingleStudentAttendance = async (studentId, roll, status) => {
    if (!schedule?.classId || !schedule?.subject) return;

    try {
      const res = await AxiosSecure.post("/api/attendance/update-single", {
        className: schedule.classId,
        subject: schedule.subject,
        date: DateFormate,
        studentId,
        roll,
        status,
        students,
      });

      setStudents((prev) =>
        prev.map((student) =>
          student._id === studentId
            ? { ...student, attendance: status }
            : student
        )
      );
    } catch (err) {
      console.error("Failed to update single student attendance:", err);
    }
  };

  const handleDefaultAttendanceChange = async (status) => {
    if (!schedule?.classId || !schedule?.subject) return;

    try {
      await AxiosSecure.post("/api/attendance/set-default", {
        className: schedule.classId,
        subject: schedule.subject,
        date: DateFormate,
        students,
        defaultStatus: status,
      });

      setStudents((prev) =>
        prev.map((student) => ({
          ...student,
          attendance: status,
        }))
      );
      setDefaultAttendance(status);
    } catch (err) {
      console.error("Failed to set default attendance:", err);
    }
  };

  const updateStudentPerformance = async (
    studentId,

    evaluation
  ) => {
    try {
      const res = await AxiosSecure.post("/api/performance/updata", {
        studentId,
        subject: schedule.subject,
        className: schedule.classId,
        evaluation,
      });

      const { totalTasks } = res.data;

      setStudents((prev) =>
        prev.map((student) =>
          student._id === studentId
            ? {
                ...student,
                totalTasks: totalTasks || 0,
                latestEvaluation: evaluation,
              }
            : student
        )
      );
    } catch (err) {
      console.error("Failed to update performance:", err);
    }
  };

  const handleSaveClass = async () => {
    try {
      const response = await AxiosSecure.post("/api/classHistory/save", {
        className: schedule.classId,
        subject: schedule.subject,
        date: DateFormate,
        teacherName: teacherName,
        status: "Completed",
        totalStudents: students.length,
        totalPresent: students.filter((s) => s.attendance === "P").length,
        totalAbsent: students.filter((s) => s.attendance === "A").length,
      });

      if (response.data) {
        alert("Class saved successfully!");
      }
    } catch (error) {
      console.error("Failed to save class history", error);
      alert("Failed to save class. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiXCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
            <FaChalkboardTeacher className="mr-3 text-blue-600" />
            Class Management
          </h1>
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <FiBook className="text-blue-500 mr-2" />
                <span className="font-medium">Subject:</span>
                <span className="ml-2">{schedule?.subject.title}</span>
              </div>
              <div className="flex items-center">
                <FiUser className="text-blue-500 mr-2" />
                <span className="font-medium">Class:</span>
                <span className="ml-2">{schedule?.classId}</span>
              </div>
              <div className="flex items-center">
                <FiAward className="text-blue-500 mr-2" />
                <span className="font-medium">Teacher:</span>
                <span className="ml-2">{teacherName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Controls */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <h2 className="text-xl font-semibold mb-2 sm:mb-0">Attendance</h2>
            <div className="flex space-x-4">
              <button
                onClick={() => handleDefaultAttendanceChange("P")}
                disabled={isAttendanceSubmitted}
                className={`flex items-center px-4 py-2 rounded-lg ${
                  defaultAttendance === "P"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 hover:bg-gray-200"
                } ${isAttendanceSubmitted ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <FiCheckCircle className="mr-2" />
                Mark All Present
              </button>
              <button
                onClick={() => handleDefaultAttendanceChange("A")}
                disabled={isAttendanceSubmitted}
                className={`flex items-center px-4 py-2 rounded-lg ${
                  defaultAttendance === "A"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 hover:bg-gray-200"
                } ${isAttendanceSubmitted ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <FiXCircle className="mr-2" />
                Mark All Absent
              </button>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
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
                    Roll
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attendance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students?.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {student.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {student.class_roll}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="flex space-x-2 mb-2">
                          <button
                            onClick={() =>
                              updateStudentPerformance(
                                student._id,

                                "Bad"
                              )
                            }
                            className={`flex items-center 
                              ${student.attendance !== "P" ? "opacity-50 cursor-not-allowed" : ""}
                              
                              px-3 py-1 rounded-full text-xs ${
                                student.latestEvaluation === "Bad"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 hover:bg-gray-200"
                              }  `}
                          >
                            <FiTrendingDown className="mr-1" /> Bad
                          </button>
                          <button
                            onClick={() =>
                              updateStudentPerformance(
                                student._id,

                                "Good"
                              )
                            }
                            className={`flex items-center px-3 py-1 
                              ${student.attendance !== "P" ? "opacity-50 cursor-not-allowed" : ""}
                              rounded-full text-xs ${
                                student.latestEvaluation === "Good"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 hover:bg-gray-200"
                              }`}
                          >
                            <FiTrendingUp className="mr-1" /> Good
                          </button>
                          <button
                            onClick={() =>
                              updateStudentPerformance(
                                student._id,

                                "Excellent"
                              )
                            }
                            className={`flex items-center px-3 
                              ${student.attendance !== "P" ? "opacity-50 cursor-not-allowed" : ""}
                              py-1 rounded-full text-xs ${
                                student.latestEvaluation === "Excellent"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 hover:bg-gray-200"
                              }`}
                          >
                            <FiAward className="mr-1" /> Excellent
                          </button>
                        </div>
                        <div className="text-xs text-gray-500">
                          Tasks: {student.totalTasks || 0}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex justify-center space-x-4">
                        <button
                          onClick={() =>
                            updateSingleStudentAttendance(
                              student._id,
                              student.class_roll,
                              "P"
                            )
                          }
                          className={`flex items-center px-3 py-1 rounded-full text-xs ${
                            student.attendance === "P"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 hover:bg-gray-200"
                          }`}
                        >
                          <FiCheckCircle className="mr-1" /> Present
                        </button>
                        <button
                          onClick={() =>
                            updateSingleStudentAttendance(
                              student._id,
                              student.class_roll,
                              "A"
                            )
                          }
                          className={`flex items-center px-3 py-1 rounded-full text-xs ${
                            student.attendance === "A"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 hover:bg-gray-200"
                          }`}
                        >
                          <FiXCircle className="mr-1" /> Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSaveClass}
            className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-colors"
          >
            <FiSave className="mr-2" /> Save Class Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default EveryClass;
