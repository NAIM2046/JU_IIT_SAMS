import React, { useEffect, useState } from "react";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";
import useStroge from "../../stroge/useStroge";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const SubjectPer_performance = ({ selectedSubject }) => {
  const AxiosSecure = useAxiosPrivate();
  const [performance, setPerformance] = useState(null);
  const { user } = useStroge();
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?._id && selectedSubject) {
      setLoading(true);
      AxiosSecure.post("api/performance/getPer_Id_subject", {
        id: user._id,
        subject: selectedSubject,
      })
        .then((res) => {
          setPerformance(res.data);
          if (res.data) {
            const data = [
              {
                name: "Excellent",
                value: res.data.excellentCount || 0,
                color: "#4CAF50",
              },
              {
                name: "Good",
                value: res.data.goodCount || 0,
                color: "#2196F3",
              },
              {
                name: "Needs Improvement",
                value: res.data.badCount || 0,
                color: "#FF5722",
              },
            ];
            setChartData(data);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [user?._id, selectedSubject]);

  const hasChartData = chartData.some((item) => item.value > 0);

  const getEvaluationColor = (evaluation) => {
    switch (evaluation) {
      case "Excellent":
        return "text-green-600 font-bold";
      case "Good":
        return "text-blue-600 font-bold";
      default:
        return "text-orange-600 font-bold";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
          <h1 className="text-2xl font-bold">
            Performance in {selectedSubject}
          </h1>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-600">Loading performance data...</p>
            </div>
          ) : performance ? (
            <div className="space-y-6">
              {/* Performance Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-blue-50 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Latest Evaluation</p>
                  <p
                    className={`text-lg ${getEvaluationColor(performance.latestEvaluation)}`}
                  >
                    {performance.latestEvaluation}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Tasks</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {performance.totalTasks}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="text-lg text-gray-800">
                    {performance.lastUpdated}
                  </p>
                </div>
              </div>

              {/* Chart */}
              {hasChartData ? (
                <div className="mt-8">
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={90}
                          innerRadius={60}
                          paddingAngle={2}
                          dataKey="value"
                          animationBegin={200}
                          animationDuration={1000}
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [`${value} tasks`, "Count"]}
                          contentStyle={{
                            borderRadius: "8px",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                            border: "none",
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
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
                  <svg
                    className="w-16 h-16 text-gray-400 mb-4"
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
                  <p className="text-gray-600">No performance data available</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
              <svg
                className="w-16 h-16 text-gray-400 mb-4"
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
              <p className="text-gray-600">No performance data found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubjectPer_performance;
