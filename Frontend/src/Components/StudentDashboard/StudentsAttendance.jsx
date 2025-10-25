import React, { useEffect, useState } from "react";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";
import useStroge from "../../stroge/useStroge";

const StudentsAttendance = () => {
  const AxiosSecure = useAxiosPrivate();
  const [attendanceData, setAttendanceData] = useState([]);
  const [classInfo, setClassInfo] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useStroge();
  const [selectedClass, setSelectedClass] = useState("");
  const [selectSubjectlist, setSelectSubjectList] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [stats, setStats] = useState({ present: 0, absent: 0, total: 0 });

  // ✅ Fetch all class and subject info on mount
  useEffect(() => {
    const fetchClassInfo = async () => {
      try {
        const response = await AxiosSecure.get("/api/getclassandsub");
        setClassInfo(response.data);
      } catch (error) {
        console.error("Error fetching class info:", error);
      }
    };
    fetchClassInfo();
  }, [AxiosSecure]);

  // ✅ Calculate attendance statistics
  useEffect(() => {
    if (attendanceData.length > 0) {
      const present = attendanceData.filter(
        (record) => record.status === "P"
      ).length;
      const absent = attendanceData.filter(
        (record) => record.status === "A"
      ).length;
      const total = attendanceData.length;

      setStats({ present, absent, total });
    } else {
      setStats({ present: 0, absent: 0, total: 0 });
    }
  }, [attendanceData]);

  // ✅ Fetch attendance data when both class and subject are selected
  useEffect(() => {
    if (!selectedClass || !selectedSubject) return;

    const fetchAttendanceData = async () => {
      setLoading(true);
      try {
        const response = await AxiosSecure.get(
          `/api/attendance/getAttendanceForStudent/${user._id}/${selectedClass}/${selectedSubject}`
        );
        setAttendanceData(response.data);
      } catch (error) {
        console.error("Error fetching attendance data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendanceData();
  }, [AxiosSecure, user._id, selectedClass, selectedSubject]);

  // ✅ Format date like 08102025 → 08/10/2025
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return dateStr.replace(/(\d{2})(\d{2})(\d{4})/, "$1/$2/$3");
  };

  // ✅ Get attendance percentage
  const getAttendancePercentage = () => {
    if (stats.total === 0) return 0;
    return Math.round((stats.present / stats.total) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                📚 Student Attendance
              </h1>
              <p className="text-gray-600">
                Track your attendance records for different classes and subjects
              </p>
            </div>
            {stats.total > 0 && (
              <div className="mt-4 md:mt-0 bg-blue-50 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-700">
                    {getAttendancePercentage()}%
                  </div>
                  <div className="text-sm text-blue-600">
                    Overall Attendance
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Selection Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Class Selection */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              🏫 Select Semester
            </label>
            <select
              value={selectedClass}
              onChange={(e) => {
                const selected = e.target.value;
                setSelectedClass(selected);
                const selectedClassData = classInfo.find(
                  (cls) => cls.class === selected
                );
                setSelectSubjectList(
                  selectedClassData ? selectedClassData.subjects : []
                );
                setSelectedSubject("");
                setAttendanceData([]);
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Choose a Semester...</option>
              {classInfo.map((cls) => (
                <option key={cls.class} value={cls.class}>
                  {cls.class}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Selection */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              📖 Select Course
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              disabled={!selectedClass}
              className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                !selectedClass ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            >
              <option value="">Choose a subject...</option>
              {selectSubjectlist?.map((sub, index) => (
                <option key={index} value={sub.code}>
                  {sub.title} ({sub.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats.total > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-700">
                {stats.present}
              </div>
              <div className="text-sm text-green-600 font-medium">Present</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-red-700">
                {stats.absent}
              </div>
              <div className="text-sm text-red-600 font-medium">Absent</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-700">
                {stats.total}
              </div>
              <div className="text-sm text-blue-600 font-medium">
                Total Classes
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="flex justify-center items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-gray-600 font-medium">
                Loading attendance data...
              </span>
            </div>
          </div>
        )}

        {/* Attendance Data Table */}
        {!loading && attendanceData.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">
                Attendance Records
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Day
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {attendanceData.map((record, index) => {
                    const date = new Date(
                      formatDate(record.date).split("/").reverse().join("-")
                    );
                    const dayName = date.toLocaleDateString("en-US", {
                      weekday: "long",
                    });

                    return (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(record.date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{dayName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              record.status === "P"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {record.status === "P" ? (
                              <>
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                Present
                              </>
                            ) : (
                              <>
                                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                                Absent
                              </>
                            )}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading &&
          selectedClass &&
          selectedSubject &&
          attendanceData.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Attendance Records Found
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                No attendance data available for {selectedSubject} in{" "}
                {selectedClass} class yet.
              </p>
            </div>
          )}

        {/* Initial State */}
        {!selectedClass && !loading && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">🎓</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Welcome to Attendance Tracker
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Select your class and subject to view your attendance records and
              statistics.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentsAttendance;
