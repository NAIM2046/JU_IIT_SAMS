import React, { useEffect, useState } from "react";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";
import useStroge from "../../stroge/useStroge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
  LineChart,
  Line,
  Legend,
} from "recharts";

const StudentHome2 = () => {
  const AxiosSecure = useAxiosPrivate();
  const { user } = useStroge();
  const [chartData, setChartData] = useState([]);
  const [monthlyUpdate, setMonthlyUpdate] = useState([]);
  const [loading, setLoading] = useState({
    subjects: true,
    monthly: true,
  });

  useEffect(() => {
    setLoading((prev) => ({ ...prev, subjects: true }));
    AxiosSecure.get(`/api/exam/getAvergeMarkById/${user._id}/${user.class}`)
      .then((res) => {
        const rawData = res.data?.subjects || [];
        console.log(res.data);
        const processed = rawData.map((item) => ({
          subject: item.subject,
          percentage:
            item.sumofTotalMark > 0
              ? Math.round((item.totalGetMark / item.sumofTotalMark) * 100)
              : 0,
          fullMark: item.sumofTotalMark,
          obtainedMark: item.totalGetMark,
        }));
        setChartData(processed);
        setLoading((prev) => ({ ...prev, subjects: false }));
      })
      .catch((err) => {
        console.error("Error fetching average mark data:", err);
        setLoading((prev) => ({ ...prev, subjects: false }));
      });
  }, []);

  useEffect(() => {
    setLoading((prev) => ({ ...prev, monthly: true }));
    AxiosSecure.get(`/api/exam/allmonth_update/${user._id}`)
      .then((res) => {
        const processed = res.data.map((item) => ({
          ...item,
          percentage:
            item.totalfullMarks > 0
              ? Math.round((item.totalgetMarks / item.totalfullMarks) * 100)
              : 0,
          label: `${item.month.slice(0, 3)} ${item.year}`,
          // Normalize rank for display (assuming rank is better when lower)
          normalizedRank: item.rank,
        }));
        setMonthlyUpdate(processed);
        setLoading((prev) => ({ ...prev, monthly: false }));
      })
      .catch((err) => {
        console.error("Error fetching monthly update", err);
        setLoading((prev) => ({ ...prev, monthly: false }));
      });
  }, []);

  const getBarColor = (percentage) => {
    if (percentage >= 80) return "#22c55e"; // Green
    if (percentage >= 50) return "#facc15"; // Yellow
    return "#ef4444"; // Red
  };
  const totalStudents = 10;
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-200">
          <p className="font-bold text-gray-800">{label}</p>
          <div className="mt-2 space-y-1">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="text-sm font-medium text-gray-700">
                  {entry.name}: {entry.value}%
                </span>
              </div>
            ))}
            <p className="text-sm mt-2">
              <span className="font-medium">Rank:</span> {data.rank || "N/A"}
            </p>
            {data.obtainedMark && (
              <p className="text-sm">
                <span className="font-medium">Marks:</span> {data.obtainedMark}/
                {data.fullMark}
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full px-4 md:px-8 py-6 space-y-10">
      {/* Subject Performance Section */}
      <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              📊 Subject Performance
            </h2>
            <p className="text-gray-600">
              Detailed breakdown by subject for {user?.name}
            </p>
          </div>
          <div className="mt-2 md:mt-0 flex space-x-2">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
              <span className="text-xs">≥80%</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-400 mr-1"></div>
              <span className="text-xs">≥50%</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
              <span className="text-xs">&lt;50%</span>
            </div>
          </div>
        </div>

        {loading.subjects ? (
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 mb-4"></div>
              <p className="text-gray-500">Loading subject data...</p>
            </div>
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 20, left: 10, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="subject"
                tick={{ fill: "#6b7280" }}
                axisLine={{ stroke: "#9ca3af" }}
              />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(tick) => `${tick}%`}
                tick={{ fill: "#6b7280" }}
                axisLine={{ stroke: "#9ca3af" }}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "#f3f4f6" }}
              />
              <Bar
                dataKey="percentage"
                radius={[4, 4, 0, 0]}
                animationDuration={1500}
              >
                <LabelList
                  dataKey="percentage"
                  position="top"
                  formatter={(value) => `${value}%`}
                  fill="#4b5563"
                />
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getBarColor(entry.percentage)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-80 flex flex-col items-center justify-center text-gray-500">
            <svg
              className="w-16 h-16 mb-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p>No subject performance data available</p>
          </div>
        )}
      </div>

      {/* Monthly Progress Section */}
      <div className="bg-gradient-to-br from-white to-indigo-50 p-6 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              📈 Monthly Progress & Rank
            </h2>
            <p className="text-gray-600">
              Performance trend over time for {user?.name}
            </p>
          </div>
          <div className="mt-2 md:mt-0 flex space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
              <span className="text-xs">Percentage</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-purple-500 mr-1"></div>
              <span className="text-xs">Rank (inverted)</span>
            </div>
          </div>
        </div>

        {loading.monthly ? (
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-indigo-100 mb-4"></div>
              <p className="text-gray-500">Loading monthly data...</p>
            </div>
          </div>
        ) : monthlyUpdate.length > 0 ? (
          <ResponsiveContainer width="100%" height={450}>
            <LineChart
              data={monthlyUpdate}
              margin={{ top: 20, right: 20, left: 10, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="label"
                tick={{ fill: "#6b7280" }}
                axisLine={{ stroke: "#9ca3af" }}
              />
              <YAxis
                yAxisId="left"
                domain={[0, 100]}
                tickFormatter={(tick) => `${tick}%`}
                tick={{ fill: "#6b7280" }}
                axisLine={{ stroke: "#9ca3af" }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[1, totalStudents]} // totalStudents is your dynamic max rank
                reversed={true} // shows #1 at the top
                tickFormatter={(tick) => `#${tick}`}
                tick={{ fill: "#6b7280" }}
                axisLine={{ stroke: "#9ca3af" }}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "#f3f4f6" }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="percentage"
                name="Percentage"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 8 }}
                animationDuration={1500}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="rank"
                name={`Rank (out of ${totalStudents})`}
                stroke="#8b5cf6"
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ r: 5 }}
                activeDot={{ r: 8 }}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-80 flex flex-col items-center justify-center text-gray-500">
            <svg
              className="w-16 h-16 mb-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p>No monthly progress data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentHome2;
