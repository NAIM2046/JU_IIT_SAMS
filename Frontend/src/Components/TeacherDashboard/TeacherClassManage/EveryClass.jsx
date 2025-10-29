import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import useAxiosPrivate from "../../../TokenAdd/useAxiosPrivate";
import {
  FiUser,
  FiBook,
  FiCheckCircle,
  FiXCircle,
  FiAward,
  FiTrendingUp,
  FiTrendingDown,
  FiSave,
  FiLoader,
  FiAlertCircle,
  FiInfo,
  FiSmartphone,
} from "react-icons/fi";
import { FaChalkboardTeacher } from "react-icons/fa";


const EveryClass = () => {
  const location = useLocation();
  const schedule = location.state?.schedule;
  const DateFormate = location.state?.formattedDate;
  const teacherName = location.state?.teacherName;
  const batchNumber = location.state?.batchNumber;
  
  const [students, setStudents] = useState([]);
  const [defaultAttendance, setDefaultAttendance] = useState("");
  const [isAttendanceSubmitted, setIsAttendanceSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const LoStrKey = `${schedule.classId}-${schedule.subject}-${batchNumber}-attendance-${DateFormate}`;
  const [updataButton, setUpdateButton] = useState(false);
  const [saveWithPerformance, setSaveWithPerformance] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const AxiosSecure = useAxiosPrivate();

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);
        const savedData = localStorage.getItem(LoStrKey);

        if (savedData) {
          const studentList = JSON.parse(savedData);
          setStudents(studentList);
          setUpdateButton(true);
        } else {
          const res = await AxiosSecure.get(
            `/api/attendance/getAttendacneAndPerformanceByClass/${schedule.classId}/${batchNumber}/${schedule.subject}/${DateFormate}`
          );
          setStudents(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch students:", err);
        setError("Failed to load student data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [schedule?.classId, schedule?.subject, DateFormate, AxiosSecure]);
  console.log(students) ;

  const handleSaveClass = async () => {
    try {
      const info = {
        classId: schedule.classId,
        subject: schedule.subject,
        type: schedule.type,
        date: DateFormate,
        batchNumber,
        teacherName: schedule.teacherName,
        teacherId: schedule.teacherId,
        status: "Completed",
        totalStudents: students.length,
        totalPresent: students.filter((s) => s.attendance === "P").length,
        totalAbsent: students.filter((s) => s.attendance === "A").length,
      };

      await AxiosSecure.post("/api/classHistory/save", info);
    } catch (error) {
      console.error("Failed to save class history", error);
      throw new Error("Failed to save class history");
    }
  };

  const setLocalStorgeDefaultAttendance = (state) => {
    const LoStrSaveData = students.map((student) => ({
      _id: student._id,
      name: student.name,
      class_roll: student.class_roll,
      attendance: state,
      latestEvaluation: student.latestEvaluation || null,
      totalTasks: student.totalTasks || 0,
    }));
    localStorage.setItem(LoStrKey, JSON.stringify(LoStrSaveData));
    setStudents(LoStrSaveData);
    setDefaultAttendance(state);
    setUpdateButton(true);
    setSuccess(
      `All students marked as ${state === "P" ? "Present" : "Absent"}`
    );
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleChangeattendance = (studentId, state) => {
    const updatelist = students.map((student) => {
      if (student._id === studentId) {
        return { ...student, attendance: state };
      }
      return student;
    });
    setStudents(updatelist);
    localStorage.setItem(LoStrKey, JSON.stringify(updatelist));
    setUpdateButton(true);
  };

  const handleChangePerformace = (studentId, value) => {
    const updatelist = students.map((student) => {
      if (student._id === studentId && student.attendance === "P") {
        return { ...student, performance: value };
      }
      return student;
    });
    setStudents(updatelist);
    localStorage.setItem(LoStrKey, JSON.stringify(updatelist));
    setUpdateButton(true);
  };

  const handleSaveAttendance = async () => {
    try {
      setSaving(true);
      setError(null);

      const Payload = {
        classId: schedule.classId,
        subject: schedule.subject,
        batchNumber,
        date: DateFormate,
        records: students.map((std) => ({
          studentId: std._id,
          status: std.attendance,
        })),
      };

      await AxiosSecure.post("api/attendance/add_update", Payload);

      if (schedule.type === "Lab" && saveWithPerformance) {
        const payload2 = students
          .filter((std) => std.attendance === "P")
          .map((std) => ({
            classId: schedule.classId,
            batchNumber,
            date: DateFormate,
            studentId: std._id,
            value: std.performance,
            subject: schedule.subject,
          }));

        if (payload2.length > 0) {
          await AxiosSecure.post("/api/performance/add_update", payload2);
        }
      }

      await handleSaveClass();
      localStorage.removeItem(LoStrKey);
      setUpdateButton(false);
      setIsAttendanceSubmitted(true);
      setSuccess("Attendance saved successfully!");
      setTimeout(() => setSuccess(""), 5000);
    } catch (error) {
      console.error("Failed to save attendance:", error);
      setError("Failed to save attendance. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Mobile Student Card Component
  const MobileStudentCard = ({ student, index }) => (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 ${
        index % 2 === 0 ? "bg-white" : "bg-gray-50"
      }`}
    >
      {/* Student Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
            <FiUser className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <div className="font-medium text-gray-900 text-sm">
              {student.name}
            </div>
            <div className="text-xs text-gray-500">
              Roll: {student.class_roll}
            </div>
          </div>
        </div>
        <div
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            student.attendance === "P"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {student.attendance === "P" ? "Present" : "Absent"}
        </div>
      </div>

      {/* Attendance Buttons */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <button
          onClick={() => handleChangeattendance(student._id, "P")}
          disabled={saving}
          className={`flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            student.attendance === "P"
              ? "bg-green-500 text-white shadow-md"
              : "bg-green-100 text-green-800 hover:bg-green-200"
          } ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <FiCheckCircle className="mr-1" /> Present
        </button>
        <button
          onClick={() => handleChangeattendance(student._id, "A")}
          disabled={saving}
          className={`flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            student.attendance === "A"
              ? "bg-red-500 text-white shadow-md"
              : "bg-red-100 text-red-800 hover:bg-red-200"
          } ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <FiXCircle className="mr-1" /> Absent
        </button>
      </div>

      {/* Performance Section for Lab */}
      {schedule.type === "Lab" && (
        <div className="border-t border-gray-200 pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Performance:
            </span>
            <div className="text-xs text-gray-500">
              Tasks: {student.totalTasks || 0} | Last:{" "}
              {student.latestEvaluation || "N/A"}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {["Bad", "Good", "Excellent"].map((level) => (
              <button
                key={level}
                onClick={() => handleChangePerformace(student._id, level)}
                disabled={student.attendance !== "P" || saving}
                className={`flex flex-col items-center p-2 rounded-lg text-xs font-medium transition-all ${
                  student.performance === level
                    ? level === "Bad"
                      ? "bg-red-500 text-white shadow-md"
                      : level === "Good"
                        ? "bg-yellow-500 text-white shadow-md"
                        : "bg-green-500 text-white shadow-md"
                    : level === "Bad"
                      ? "bg-red-100 text-red-800 hover:bg-red-200"
                      : level === "Good"
                        ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                        : "bg-green-100 text-green-800 hover:bg-green-200"
                } ${
                  student.attendance !== "P" || saving
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {level === "Bad" && <FiTrendingDown className="mb-1" />}
                {level === "Good" && <FiTrendingUp className="mb-1" />}
                {level === "Excellent" && <FiAward className="mb-1" />}
                {level}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Enhanced Loading Component
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Loading Class Data
          </h2>
          <p className="text-gray-500">
            Please wait while we load the student information...
          </p>
        </div>
      </div>
    );
  }

  // Enhanced Error Component
  if (error && students.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-sm">
            <div className="flex items-start">
              <FiAlertCircle className="h-6 w-6 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-medium text-red-800 mb-2">
                  Unable to Load Data
                </h3>
                <p className="text-red-700 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const presentCount = students.filter((s) => s.attendance === "P").length;
  const absentCount = students.filter((s) => s.attendance === "A").length;

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Mobile View Indicator */}
        {isMobile && (
          <div className="mb-4 flex items-center justify-center bg-blue-50 border border-blue-200 rounded-lg p-3">
            <FiSmartphone className="text-blue-500 mr-2" />
            <span className="text-sm text-blue-700">
              Mobile View - Scroll vertically to see all students
            </span>
          </div>
        )}

        {/* Status Messages */}
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-center">
              <FiAlertCircle className="h-5 w-5 text-red-500 mr-3" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
            <div className="flex items-center">
              <FiCheckCircle className="h-5 w-5 text-green-500 mr-3" />
              <p className="text-green-700">{success}</p>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3 md:mb-0 flex items-center">
              <FaChalkboardTeacher className="mr-3 text-blue-600" />
              Class Management
            </h1>
            {updataButton && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">
                <FiInfo className="text-blue-500" />
                <span>You have unsaved changes</span>
              </div>
            )}
          </div>

          {/* Compact Info Cards for Mobile */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-4 border border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <div className="flex items-center p-2 md:p-3 bg-blue-50 rounded-lg">
                <FiBook className="text-blue-600 text-lg md:text-xl mr-2 md:mr-3" />
                <div className="min-w-0">
                  <p className="text-xs md:text-sm font-medium text-gray-600 truncate">
                    Course
                  </p>
                  <p className="text-sm md:font-semibold text-gray-800 truncate">
                    {schedule?.subjectName} ({schedule?.subject})
                  </p>
                </div>
              </div>

              <div className="flex items-center p-2 md:p-3 bg-green-50 rounded-lg">
                <FiUser className="text-green-600 text-lg md:text-xl mr-2 md:mr-3" />
                <div className="min-w-0">
                  <p className="text-xs md:text-sm font-medium text-gray-600">
                    Semester
                  </p>
                  <p className="text-sm md:font-semibold text-gray-800 truncate">
                    {schedule?.classId}
                  </p>
                </div>
              </div>

              <div className="flex items-center p-2 md:p-3 bg-purple-50 rounded-lg">
                <FiAward className="text-purple-600 text-lg md:text-xl mr-2 md:mr-3" />
                <div className="min-w-0">
                  <p className="text-xs md:text-sm font-medium text-gray-600">
                    Teacher
                  </p>
                  <p className="text-sm md:font-semibold text-gray-800 truncate">
                    {teacherName}
                  </p>
                </div>
              </div>

              <div className="flex items-center p-2 md:p-3 bg-orange-50 rounded-lg">
                <FiUser className="text-orange-600 text-lg md:text-xl mr-2 md:mr-3" />
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600">
                    Students
                  </p>
                  <p className="text-sm md:font-semibold text-gray-800">
                    {students.length} Total
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
          <div className="bg-white rounded-lg md:rounded-xl shadow-sm p-3 md:p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600">
                  Present
                </p>
                <p className="text-lg md:text-2xl font-bold text-gray-800">
                  {presentCount}
                </p>
              </div>
              <FiCheckCircle className="h-6 w-6 md:h-8 md:w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg md:rounded-xl shadow-sm p-3 md:p-4 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600">
                  Absent
                </p>
                <p className="text-lg md:text-2xl font-bold text-gray-800">
                  {absentCount}
                </p>
              </div>
              <FiXCircle className="h-6 w-6 md:h-8 md:w-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg md:rounded-xl shadow-sm p-3 md:p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600">
                  Rate
                </p>
                <p className="text-lg md:text-2xl font-bold text-gray-800">
                  {students.length > 0
                    ? Math.round((presentCount / students.length) * 100)
                    : 0}
                  %
                </p>
              </div>
              <FiTrendingUp className="h-6 w-6 md:h-8 md:w-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Attendance Controls */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6 border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-3 lg:mb-0">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-1">
                Attendance Management
              </h2>
              <p className="text-xs md:text-sm text-gray-600">
                Mark attendance for all students at once
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setLocalStorgeDefaultAttendance("P")}
                disabled={isAttendanceSubmitted || saving}
                className={`flex items-center justify-center px-4 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl text-sm font-medium transition-all ${
                  defaultAttendance === "P"
                    ? "bg-green-500 text-white shadow-md"
                    : "bg-green-100 text-green-800 hover:bg-green-200"
                } ${isAttendanceSubmitted || saving ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <FiCheckCircle className="mr-2" />
                Mark All Present
              </button>
              <button
                onClick={() => setLocalStorgeDefaultAttendance("A")}
                disabled={isAttendanceSubmitted || saving}
                className={`flex items-center justify-center px-4 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl text-sm font-medium transition-all ${
                  defaultAttendance === "A"
                    ? "bg-red-500 text-white shadow-md"
                    : "bg-red-100 text-red-800 hover:bg-red-200"
                } ${isAttendanceSubmitted || saving ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <FiXCircle className="mr-2" />
                Mark All Absent
              </button>
            </div>
          </div>
        </div>

        {/* Students List - Mobile Cards / Desktop Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-base md:text-lg font-semibold text-gray-800 flex items-center">
              <FiUser className="mr-2" />
              Student List ({students.length} students)
            </h3>
          </div>

          {/* Mobile View - Cards */}
          {isMobile ? (
            <div className="p-3 md:p-4">
              {students?.map((student, index) => (
                <MobileStudentCard
                  key={student._id}
                  student={student}
                  index={index}
                />
              ))}
            </div>
          ) : (
            /* Desktop View - Table */
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Student Information
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Roll Number
                    </th>
                    {schedule.type === "Lab" && (
                      <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Lab Performance
                      </th>
                    )}
                    <th className="px-4 md:px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Attendance Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students?.map((student, index) => (
                    <tr
                      key={student._id}
                      className={`hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-4 md:px-6 py-3 md:py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 md:h-10 md:w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <FiUser className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm md:font-medium text-gray-900">
                              {student.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs md:text-sm font-medium bg-gray-100 text-gray-800">
                          {student.class_roll}
                        </span>
                      </td>
                      {schedule.type === "Lab" && (
                        <td className="px-4 md:px-6 py-3 md:py-4">
                          <div className="flex flex-col space-y-2">
                            <div className="flex flex-wrap gap-1 md:gap-2">
                              {["Bad", "Good", "Excellent"].map((level) => (
                                <button
                                  key={level}
                                  onClick={() =>
                                    handleChangePerformace(student._id, level)
                                  }
                                  disabled={
                                    student.attendance !== "P" || saving
                                  }
                                  className={`inline-flex items-center px-2 py-1 md:px-3 md:py-2 rounded-lg text-xs font-medium transition-all ${
                                    student.performance === level
                                      ? level === "Bad"
                                        ? "bg-red-500 text-white shadow-md"
                                        : level === "Good"
                                          ? "bg-yellow-500 text-white shadow-md"
                                          : "bg-green-500 text-white shadow-md"
                                      : level === "Bad"
                                        ? "bg-red-100 text-red-800 hover:bg-red-200"
                                        : level === "Good"
                                          ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                                          : "bg-green-100 text-green-800 hover:bg-green-200"
                                  } ${
                                    student.attendance !== "P" || saving
                                      ? "opacity-50 cursor-not-allowed"
                                      : ""
                                  }`}
                                >
                                  {level === "Bad" && (
                                    <FiTrendingDown className="mr-1" />
                                  )}
                                  {level === "Good" && (
                                    <FiTrendingUp className="mr-1" />
                                  )}
                                  {level === "Excellent" && (
                                    <FiAward className="mr-1" />
                                  )}
                                  <span className="hidden sm:inline">
                                    {level}
                                  </span>
                                  <span className="sm:hidden">
                                    {level === "Bad"
                                      ? "B"
                                      : level === "Good"
                                        ? "G"
                                        : "E"}
                                  </span>
                                </button>
                              ))}
                            </div>
                            <div className="flex items-center text-xs text-gray-500 space-x-3 md:space-x-4">
                              <span>Tasks: {student.totalTasks || 0}</span>
                              <span>
                                Last: {student.latestEvaluation || "N/A"}
                              </span>
                            </div>
                          </div>
                        </td>
                      )}
                      <td className="px-4 md:px-6 py-3 md:py-4">
                        <div className="flex justify-center space-x-2 md:space-x-3">
                          <button
                            onClick={() =>
                              handleChangeattendance(student._id, "P")
                            }
                            disabled={saving}
                            className={`inline-flex items-center px-3 py-1 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                              student.attendance === "P"
                                ? "bg-green-500 text-white shadow-md"
                                : "bg-green-100 text-green-800 hover:bg-green-200"
                            } ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            <FiCheckCircle className="mr-1 md:mr-2" /> Present
                          </button>
                          <button
                            onClick={() =>
                              handleChangeattendance(student._id, "A")
                            }
                            disabled={saving}
                            className={`inline-flex items-center px-3 py-1 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                              student.attendance === "A"
                                ? "bg-red-500 text-white shadow-md"
                                : "bg-red-100 text-red-800 hover:bg-red-200"
                            } ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            <FiXCircle className="mr-1 md:mr-2" /> Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Save Section */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Save Class Data
              </h3>
              <p className="text-sm text-gray-600">
                {updataButton
                  ? "You have unsaved changes. Don't forget to save before leaving."
                  : "All changes have been saved successfully."}
              </p>

              {schedule.type === "Lab" && (
                <div className="mt-3 flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
                  <span className="font-medium text-gray-700 text-sm">
                    Include Performance:
                  </span>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="savePerformance"
                        checked={saveWithPerformance === true}
                        onChange={() => setSaveWithPerformance(true)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="text-gray-700 text-sm">Yes</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="savePerformance"
                        checked={saveWithPerformance === false}
                        onChange={() => setSaveWithPerformance(false)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="text-gray-700 text-sm">No</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              {updataButton && (
                <button
                  onClick={handleSaveAttendance}
                  disabled={saving}
                  className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] md:min-w-[160px]"
                >
                  {saving ? (
                    <>
                      <FiLoader className="animate-spin mr-2" />
                      <span className="text-sm md:text-base">Saving...</span>
                    </>
                  ) : (
                    <>
                      <FiSave className="mr-2" />
                      <span className="text-sm md:text-base">Save Data</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EveryClass;
