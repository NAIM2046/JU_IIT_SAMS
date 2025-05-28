import React, { useEffect, useState } from "react";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";
import useStroge from "../../stroge/useStroge";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#22c55e", "#3b82f6", "#ef4444"]; // Excellent, Good, Bad colors

const StudentHome = () => {
  const AxiosSecure = useAxiosPrivate();
  const [performance, setPerformance] = useState({});
  const [attendance, setAttendance] = useState({});
  const { user } = useStroge();

  useEffect(() => {
    AxiosSecure.get(`/api/performance/${user._id}/performance-summary`)
      .then((res) => {
        setPerformance(res.data);
      })
      .catch((err) => {
        console.error("Error fetching performance summary:", err);
      });
  }, []);
  console.log("Performance data:", performance);

  useEffect(() => {
    AxiosSecure.get(`/api/attendance/getAttendanceBy_id/${user._id}`)
      .then((res) => {
        console.log(res.data);
        setAttendance(res.data);
      })
      .catch((err) => {
        console.error("getAttendanceBy_id error", err);
      });
  }, []);
  // Prepare pie chart data
  const pieData = [
    {
      name: "Excellent",
      value: performance.excellent || 0,
    },
    { name: "Good", value: performance.good || 0 },
    { name: "Bad", value: performance.bad || 0 },
  ];

  const attendanceData = [
    { name: "Present", value: attendance.presentCount || 0 },
    {
      name: "Absent",
      value: attendance.totalClasses - (attendance.presentCount || 0),
    },
  ];

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Student Home Page</h1>

      {performance.totalTasks ? (
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-medium mb-2">
            Avarge Performance Summary ({performance.totalTasks} tasks)
          </h2>
          <PieChart width={400} height={300}>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      ) : (
        <p>Loading performance data or no tasks found.</p>
      )}
      {attendance.totalClasses ? (
        <div className="mt-8 flex flex-col items-center">
          <h2 className="text-lg font-medium mb-2">
            Attendance Summary ( Total {attendance.totalClasses} classes)
          </h2>
          <PieChart width={400} height={300}>
            <Pie
              data={attendanceData}
              cx={"50%"}
              cy={"50%"}
              labelLine={false}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {attendanceData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      ) : (
        <p>Loading attendance data or no records found.</p>
      )}
    </div>
  );
};

export default StudentHome;
