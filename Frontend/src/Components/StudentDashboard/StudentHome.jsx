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
import { motion } from "framer-motion";

const COLORS = ["#22c55e", "#3b82f6", "#ef4444"]; // Green, Blue, Red
const ATTENDANCE_COLORS = ["#22c55e", "#ef4444"]; // Green (Present), Red (Absent)

const StudentHome = () => {
  const AxiosSecure = useAxiosPrivate();
  const [performance, setPerformance] = useState({});
  const [attendance, setAttendance] = useState({});
  const { user } = useStroge();
  const [loading, setLoading] = useState({
    performance: true,
    attendance: true,
  });

  useEffect(() => {
    setLoading((prev) => ({ ...prev, performance: true }));
    AxiosSecure.get(`/api/performance/${user._id}/performance-summary`)
      .then((res) => {
        setPerformance(res.data);
        setLoading((prev) => ({ ...prev, performance: false }));
      })
      .catch((err) => {
        console.error("Error fetching performance summary:", err);
        setLoading((prev) => ({ ...prev, performance: false }));
      });
  }, []);

  useEffect(() => {
    setLoading((prev) => ({ ...prev, attendance: true }));
    AxiosSecure.get(`/api/attendance/getAttendanceBy_id/${user._id}`)
      .then((res) => {
        setAttendance(res.data);
        setLoading((prev) => ({ ...prev, attendance: false }));
      })
      .catch((err) => {
        console.error("getAttendanceBy_id error", err);
        setLoading((prev) => ({ ...prev, attendance: false }));
      });
  }, []);

  const pieData = [
    { name: "Excellent", value: performance.excellent || 0 },
    { name: "Good", value: performance.good || 0 },
    { name: "Needs Work", value: performance.bad || 0 },
  ];

  const attendanceData = [
    { name: "Present", value: attendance.presentCount || 0 },
    {
      name: "Absent",
      value: (attendance.totalClasses || 0) - (attendance.presentCount || 0),
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="p-4 md:p-6 max-w-7xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          Welcome Back, {user.name}!
        </h1>
        <p className="text-gray-600">
          Here's your academic overview for this year
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={itemVariants} className="mb-6">
        <StudentHome2 />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Chart */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Performance Summary
            </h2>
            {performance.totalTasks && (
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                {performance.totalTasks} tasks
              </span>
            )}
          </div>

          {loading.performance ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-gray-200 h-12 w-12"></div>
              </div>
            </div>
          ) : performance.totalTasks ? (
            <div className="h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} tasks`, "Count"]}
                    contentStyle={{
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ paddingTop: "20px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-gray-500">
              <svg
                className="w-16 h-16 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p>No performance data available</p>
            </div>
          )}
        </motion.div>

        {/* Attendance Chart */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl shadow-md p-6 pb-10 hover:shadow-lg transition-shadow"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Attendance Summary
            </h2>
            {attendance.totalClasses && (
              <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                {attendance.totalClasses} classes
              </span>
            )}
          </div>

          {loading.attendance ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-gray-200 h-12 w-12"></div>
              </div>
            </div>
          ) : attendance.totalClasses ? (
            <div className="h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attendanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {attendanceData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={ATTENDANCE_COLORS[index]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} classes`, "Count"]}
                    contentStyle={{
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ paddingTop: "20px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {attendance.presentCount && (
                <div className="mt-4 text-center pb-4">
                  <p className="text-sm text-gray-600">
                    Attendance Rate:{" "}
                    {(
                      (attendance.presentCount / attendance.totalClasses) *
                      100
                    ).toFixed(1)}
                    %
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-gray-500">
              <svg
                className="w-16 h-16 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p>No attendance records found</p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StudentHome;
