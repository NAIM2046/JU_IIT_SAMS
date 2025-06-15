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

const SubjectPerformance = ({ selectedSubject }) => {
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
            setChartData([
              {
                name: "Excellent",
                value: res.data.excellentCount || 0,
                color: "#10B981",
              },
              {
                name: "Good",
                value: res.data.goodCount || 0,
                color: "#3B82F6",
              },
              {
                name: "Needs Work",
                value: res.data.badCount || 0,
                color: "#EF4444",
              },
            ]);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [user?._id, selectedSubject]);

  const hasChartData = chartData.some((item) => item.value > 0);

  const getEvaluationColor = (evaluation) => {
    switch (evaluation) {
      case "Excellent":
        return "bg-green-100 text-green-800";
      case "Good":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-red-100 text-red-800";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {selectedSubject} Performance Analysis
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Detailed breakdown of your performance metrics
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent"></div>
              <p className="text-gray-600">Loading performance data...</p>
            </div>
          ) : performance ? (
            <div className="space-y-8">
              {/* Performance Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
                  <p className="text-sm font-medium text-gray-500">
                    Latest Evaluation
                  </p>
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${getEvaluationColor(performance.latestEvaluation)}`}
                  >
                    {performance.latestEvaluation}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
                  <p className="text-sm font-medium text-gray-500">
                    Total Tasks
                  </p>
                  <p className="text-2xl font-semibold text-gray-800 mt-1">
                    {performance.totalTasks}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
                  <p className="text-sm font-medium text-gray-500">
                    Last Updated
                  </p>
                  <p className="text-gray-800 mt-2">
                    {performance.lastUpdated}
                  </p>
                </div>
              </div>

              {/* Chart Section */}
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Performance Distribution
                </h3>

                {hasChartData ? (
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="h-72 w-full">
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
                            outerRadius={80}
                            innerRadius={50}
                            paddingAngle={2}
                            dataKey="value"
                            animationDuration={800}
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => [`${value} tasks`, "Count"]}
                            contentStyle={{
                              borderRadius: "6px",
                              border: "1px solid #E5E7EB",
                              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                              padding: "8px 12px",
                              fontSize: "14px",
                            }}
                            itemStyle={{ padding: 0 }}
                          />
                          <Legend
                            layout="horizontal"
                            verticalAlign="bottom"
                            align="center"
                            wrapperStyle={{ paddingTop: "20px" }}
                            iconType="circle"
                            iconSize={10}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <h4 className="mt-3 text-sm font-medium text-gray-700">
                      No data available
                    </h4>
                    <p className="mt-1 text-sm text-gray-500">
                      Performance metrics will appear here
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h4 className="mt-3 text-sm font-medium text-gray-700">
                No performance data found
              </h4>
              <p className="mt-1 text-sm text-gray-500">
                Complete some tasks to see your performance metrics
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubjectPerformance;
