import React, { useEffect, useState } from "react";
import useStroge from "../../stroge/useStroge";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  FiBook,
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiPercent,
} from "react-icons/fi";
import SubjectPer_performance from "./SubjectPer_performance";
import SubjectPer_exam_mark from "./SubjectPer_exam_mark";

const SubjectsSummary = () => {
  const { user } = useStroge();
  const AxiosSecure = useAxiosPrivate();

  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);

  // Soft pastel colors for the pie chart
  const COLORS = ["#7DD3FC", "#FCA5A5", "#FCD34D"];

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await AxiosSecure.get(
          `/api/getsubjectbyclass/${user.class}`
        );
        setSubjects(res.data.subjects);
        if (res.data.subjects.length > 0) {
          setSelectedSubject(res.data.subjects[0]);
        }
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
      }
    };

    fetchSubjects();
  }, [user.class, AxiosSecure]);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!selectedSubject) return;

      setLoading(true);
      try {
        const res = await AxiosSecure.post(
          "/api/attendance/getAttendancebystdId_subject",
          {
            classNumber: user.class,
            subject: selectedSubject,
            studentId: user._id,
          }
        );
        setAttendance(res.data || {});
      } catch (error) {
        console.error("Failed to fetch attendance:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [selectedSubject, user, AxiosSecure]);

  const prepareChartData = () => {
    if (!attendance) return [];
    return [
      { name: "Present", value: attendance.present || 0, color: COLORS[0] },
      { name: "Absent", value: attendance.absent || 0, color: COLORS[1] },
    ];
  };

  const attendancePercentage =
    attendance.present && attendance.absent !== undefined
      ? Math.round(
          (attendance.present / (attendance.present + attendance.absent)) * 100
        )
      : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <FiBook className="mr-2 text-blue-600" />
            Subject Performance Dashboard
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            View your academic performance across all subjects
          </p>
        </div>

        {/* Subject Navigation */}
        <div className="px-6 pt-4 pb-2 border-b border-gray-200">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {subjects.map((subject, index) => (
              <button
                key={index}
                onClick={() => setSelectedSubject(subject)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedSubject === subject
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : selectedSubject ? (
            <>
              {/* Attendance Section */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                  <FiCalendar className="mr-2 text-blue-500" />
                  {selectedSubject} Attendance Summary
                </h3>

                {attendance.present !== undefined ||
                attendance.absent !== undefined ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Pie Chart */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={prepareChartData()}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }) =>
                              `${name}: ${(percent * 100).toFixed(0)}%`
                            }
                            labelLine={false}
                          >
                            {prepareChartData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => [`${value} classes`, "Count"]}
                            contentStyle={{
                              borderRadius: "6px",
                              border: "1px solid #E5E7EB",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                              padding: "8px 12px",
                            }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Attendance Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
                        <div className="flex items-center">
                          <FiCheckCircle className="text-green-500 mr-2" />
                          <span className="text-sm text-gray-600">Present</span>
                        </div>
                        <p className="text-2xl font-semibold mt-2">
                          {attendance.present || 0}
                        </p>
                      </div>

                      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
                        <div className="flex items-center">
                          <FiXCircle className="text-red-500 mr-2" />
                          <span className="text-sm text-gray-600">Absent</span>
                        </div>
                        <p className="text-2xl font-semibold mt-2">
                          {attendance.absent || 0}
                        </p>
                      </div>

                      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
                        <div className="flex items-center">
                          <FiCalendar className="text-blue-500 mr-2" />
                          <span className="text-sm text-gray-600">
                            Total Classes
                          </span>
                        </div>
                        <p className="text-2xl font-semibold mt-2">
                          {(attendance.present || 0) + (attendance.absent || 0)}
                        </p>
                      </div>

                      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
                        <div className="flex items-center">
                          <FiPercent className="text-purple-500 mr-2" />
                          <span className="text-sm text-gray-600">
                            Attendance %
                          </span>
                        </div>
                        <p className="text-2xl font-semibold mt-2">
                          {attendancePercentage}%
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <FiCalendar className="mx-auto text-gray-400 text-4xl mb-3" />
                    <h4 className="text-lg font-medium text-gray-700">
                      No Attendance Data
                    </h4>
                    <p className="text-gray-500 mt-1">
                      No attendance records found for {selectedSubject}
                    </p>
                  </div>
                )}
              </div>

              {/* Performance Components */}
              <div className="space-y-8">
                <SubjectPer_performance selectedSubject={selectedSubject} />
                <SubjectPer_exam_mark selectedSubject={selectedSubject} />
              </div>
            </>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <FiBook className="mx-auto text-gray-400 text-4xl mb-3" />
              <h4 className="text-lg font-medium text-gray-700">
                No Subject Selected
              </h4>
              <p className="text-gray-500 mt-1">
                Please select a subject to view performance data
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubjectsSummary;
