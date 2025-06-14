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
import SubjectPer_performance from "./SubjectPer_performance";
import SubjectPer_exam_mark from "./SubjectPer_exam_mark";

const SubjectsPer_Summ = () => {
  const { user } = useStroge();
  const AxiosSecure = useAxiosPrivate();

  const [classlist, setClassList] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [attendance, setAttendance] = useState({});
  const [chartData, setChartData] = useState([]);

  // Colors for the pie chart segments
  const COLORS = ["#0088FE", "#FF8042", "#FFBB28"];

  useEffect(() => {
    AxiosSecure.get(`/api/getsubjectbyclass/${user.class}`).then((res) => {
      const subjects = res.data.subjects;
      setClassList(subjects);
      if (subjects.length > 0) {
        setSelectedSubject(subjects[0]); // Select first subject by default
      }
    });
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      AxiosSecure.post("/api/attendance/getAttendancebystdId_subject", {
        classNumber: user.class,
        subject: selectedSubject,
        studentId: user._id,
      }).then((res) => {
        setAttendance(res.data);

        // Prepare data for the pie chart
        if (res.data) {
          const data = [
            { name: "Present", value: res.data.present || 0 },
            { name: "Absent", value: res.data.absent || 0 },
          ];
          setChartData(data);
        }
      });
    }
  }, [selectedSubject]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">
        Subject-wise Attendance Summary
      </h2>

      {/* Subject Tabs (X-axis line) */}
      <div className="flex space-x-4 border-b mb-6 overflow-x-auto">
        {classlist.map((subject, index) => (
          <button
            key={index}
            onClick={() => setSelectedSubject(subject)}
            className={`px-4 py-2 border-b-2 transition-all whitespace-nowrap ${
              selectedSubject === subject
                ? "border-blue-500 text-blue-600 font-semibold"
                : "border-transparent"
            }`}
          >
            {subject}
          </button>
        ))}
      </div>

      {/* Selected Subject Info */}
      {selectedSubject ? (
        <div className="mt-4 p-4 border rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">{selectedSubject}</h3>

          {chartData.length > 0 ? (
            <div className="flex flex-col md:flex-row items-center">
              <div className="w-full md:w-1/2 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="w-full md:w-1/2 p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Total Classes</p>
                    <p className="text-xl font-bold">
                      {attendance.present + attendance.absent || 0}
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Present</p>
                    <p className="text-xl font-bold">
                      {attendance.present || 0}
                    </p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Absent</p>
                    <p className="text-xl font-bold">
                      {attendance.absent || 0}
                    </p>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Attendance Percentage</p>
                  <p className="text-2xl font-bold">
                    {attendance
                      ? `${Math.round((attendance.present / (attendance.present + attendance.absent)) * 100)}%`
                      : "0%"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p>No attendance data available for {selectedSubject}.</p>
          )}
        </div>
      ) : (
        <p>No subject selected.</p>
      )}

      <div>
        <SubjectPer_performance
          selectedSubject={selectedSubject}
        ></SubjectPer_performance>
      </div>
      <div>
        <SubjectPer_exam_mark
          selectedSubject={selectedSubject}
        ></SubjectPer_exam_mark>
      </div>
    </div>
  );
};

export default SubjectsPer_Summ;
