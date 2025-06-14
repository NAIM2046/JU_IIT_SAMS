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
} from "recharts";

const StudentHome2 = () => {
  const AxiosSecure = useAxiosPrivate();
  const { user } = useStroge();
  const [chartData, setChartData] = useState([]);
  const [monthlyupdate, setmonthlyUpdate] = useState([]);

  useEffect(() => {
    AxiosSecure.get(`/api/exam/getAvergeMarkById/${user._id}`)
      .then((res) => {
        const rawData = res.data?.subjects || [];

        const processed = rawData.map((item) => {
          const percentage =
            item.sumofTotalMark > 0
              ? Math.round((item.totalGetMark / item.sumofTotalMark) * 100)
              : 0;

          return {
            subject: item.subject,
            percentage,
          };
        });

        setChartData(processed);
      })
      .catch((err) => {
        console.error("Error fetching average mark data:", err);
      });
  }, []);

  useEffect(() => {
    AxiosSecure.get(`/api/exam/allmonth_update/${user._id}`)
      .then((res) => {
        const processed = res.data.map((item) => {
          const percentage =
            item.totalfullMarks > 0
              ? Math.round((item.totalgetMarks / item.totalfullMarks) * 100)
              : 0;

          return {
            ...item,
            percentage,
            label: `${item.month.slice(0, 3)} ${item.year}`,
          };
        });

        setmonthlyUpdate(processed);
      })
      .catch((err) => {
        console.error("Error fetching monthly update", err);
      });
  }, []);

  const getBarColor = (percentage) => {
    if (percentage >= 80) return "#22c55e"; // Green
    if (percentage >= 50) return "#facc15"; // Yellow
    return "#ef4444"; // Red
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      return (
        <div className="bg-white border border-gray-300 p-3 rounded shadow text-sm">
          <p className="font-semibold">{label}</p>
          <p>📊 Percentage: {data.percentage}%</p>
          <p>🏅 Rank: {data.rank}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full px-4 md:px-8 py-6">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
        📊 Subject-wise Performance Summary -{" "}
        <span className="text-blue-600">{user?.name}</span>
      </h2>

      <div className="bg-white p-4 md:p-6 rounded-xl shadow-md mb-10">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Bar dataKey="percentage">
                <LabelList
                  dataKey="percentage"
                  position="top"
                  formatter={(value) => `${value}%`}
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
          <p className="text-gray-500 text-center">
            Loading performance chart...
          </p>
        )}
      </div>

      <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
          📈 Monthly Progress Overview -{" "}
          <span className="text-blue-600">{user?.name}</span>
        </h2>

        {monthlyupdate.length > 0 ? (
          <ResponsiveContainer width="100%" height={450}>
            <LineChart
              data={monthlyupdate}
              margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="percentage"
                stroke="#3b82f6"
                strokeWidth={3}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center">Loading monthly chart...</p>
        )}
      </div>
    </div>
  );
};

export default StudentHome2;
