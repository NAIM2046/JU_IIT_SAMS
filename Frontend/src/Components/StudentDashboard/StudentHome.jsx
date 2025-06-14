import React, { useEffect, useState } from "react";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";
import useStroge from "../../stroge/useStroge";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import StudentHome2 from "./StudentHome2";

const COLORS = ["#22c55e", "#3b82f6", "#ef4444"]; // Excellent, Good, Bad colors

const StudentHome = () => {
  const AxiosSecure = useAxiosPrivate();
  const [performance, setPerformance] = useState({});
  const [attendance, setAttendance] = useState({});
  const { user } = useStroge();

  useEffect(() => {
    AxiosSecure.get(`/api/performance/${user._id}/performance-summary`)
      .then((res) => setPerformance(res.data))
      .catch((err) =>
        console.error("Error fetching performance summary:", err)
      );
  }, []);

  useEffect(() => {
    AxiosSecure.get(`/api/attendance/getAttendanceBy_id/${user._id}`)
      .then((res) => setAttendance(res.data))
      .catch((err) => console.error("getAttendanceBy_id error", err));
  }, []);

  const pieData = [
    { name: "Excellent", value: performance.excellent || 0 },
    { name: "Good", value: performance.good || 0 },
    { name: "Bad", value: performance.bad || 0 },
  ];

  const attendanceData = [
    { name: "Present", value: attendance.presentCount || 0 },
    {
      name: "Absent",
      value: (attendance.totalClasses || 0) - (attendance.presentCount || 0),
    },
  ];

  return (
    <div className="p-2 md:p-4">
      <h1 className="text-xl font-semibold mb-4 text-center">
        🎓 Student Home Page
      </h1>

      <div className="mb-6">
        <StudentHome2 />
      </div>

      {/* Performance Chart */}
      {performance.totalTasks ? (
        <div className="flex flex-col items-center w-full max-w-3xl mx-auto">
          <h2 className="text-lg font-medium mb-2 text-center">
            Average Performance Summary ({performance.totalTasks} tasks)
          </h2>
          <div className="w-full h-72 sm:h-80 md:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius="80%"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500">
          Loading performance data or no tasks found.
        </p>
      )}

      {/* Attendance Chart */}
      {attendance.totalClasses ? (
        <div className="mt-8 flex flex-col items-center w-full max-w-3xl mx-auto">
          <h2 className="text-lg font-medium mb-2 text-center">
            Attendance Summary (Total {attendance.totalClasses} classes)
          </h2>
          <div className="w-full h-72 sm:h-80 md:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attendanceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius="80%"
                  dataKey="value"
                >
                  {attendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-4">
          Loading attendance data or no records found.
        </p>
      )}
    </div>
  );
};

export default StudentHome;
