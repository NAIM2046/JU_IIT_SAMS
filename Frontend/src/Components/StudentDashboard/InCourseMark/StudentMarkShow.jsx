import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
} from "recharts";

const StudentMarkShow = ({ data, loading = false }) => {
  // Show loading state
  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="animate-pulse">
          {/* Loading header */}
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-6"></div>

          {/* Loading summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 p-4 rounded-2xl h-20"></div>
            ))}
          </div>

          {/* Loading charts */}
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-gray-200 p-6 rounded-2xl mb-10 h-96"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  // Show empty state if no data
  if (!data || data.length === 0) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="text-center py-12 bg-white rounded-2xl shadow border">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-24 h-24 mx-auto"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-600 mb-3">
            No Data Available
          </h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            No marks data found for the selected class and subject. Please check
            back later or contact your instructor.
          </p>
          <div className="bg-blue-50 inline-flex items-center p-3 rounded-lg">
            <svg
              className="w-5 h-5 text-blue-500 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-blue-700 text-sm">
              Select a different subject or check with your teacher
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 🔹 Convert obtained marks into percentage
  const processedData = data.map((group) => ({
    ...group,
    records: group.records.map((r) => ({
      ...r,
      percentage: Number(((r.obtainedMark / r.fullMark) * 100).toFixed(2)), // ensure number, not string
    })),
  }));

  const totalMarks = processedData
    .flatMap((d) => d.records.map((r) => r.percentage))
    .reduce((a, b) => a + b, 0);

  const totalExams = processedData.flatMap((d) => d.records).length;
  const avgMark = (totalMarks / totalExams).toFixed(2);

  // Get performance level and color
  const getPerformanceLevel = (avg) => {
    if (avg >= 80)
      return {
        level: "Excellent 🏆",
        color: "text-green-600",
        bg: "bg-green-100",
      };
    if (avg >= 60)
      return { level: "Good 👍", color: "text-blue-600", bg: "bg-blue-100" };
    if (avg >= 40)
      return {
        level: "Average ⚙️",
        color: "text-yellow-600",
        bg: "bg-yellow-100",
      };
    return {
      level: "Needs Improvement 📉",
      color: "text-red-600",
      bg: "bg-red-100",
    };
  };

  const performance = getPerformanceLevel(avgMark);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-3 flex items-center justify-center">
          <span className="mr-3 text-blue-600">📊</span>
          Student Performance Dashboard
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Detailed analysis of your academic performance across different
          examination types
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-2xl text-center shadow-lg border border-blue-200 transition-transform hover:scale-105">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500 rounded-full mb-3">
            <span className="text-white font-bold text-lg">📝</span>
          </div>
          <p className="text-gray-600 font-medium mb-2">Total Exams</p>
          <h3 className="text-3xl font-bold text-blue-700">{totalExams}</h3>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-2xl text-center shadow-lg border border-green-200 transition-transform hover:scale-105">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500 rounded-full mb-3">
            <span className="text-white font-bold text-lg">📈</span>
          </div>
          <p className="text-gray-600 font-medium mb-2">Average Percentage</p>
          <h3 className="text-3xl font-bold text-green-700">{avgMark}%</h3>
        </div>

        <div
          className={`bg-gradient-to-br ${performance.bg} p-5 rounded-2xl text-center shadow-lg border transition-transform hover:scale-105`}
        >
          <div
            className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${performance.color.replace(
              "text-",
              "bg-"
            )} bg-opacity-20`}
          >
            <span className={`text-lg ${performance.color}`}>
              {performance.level.includes("Excellent")
                ? "🏆"
                : performance.level.includes("Good")
                  ? "👍"
                  : performance.level.includes("Average")
                    ? "⚙️"
                    : "📉"}
            </span>
          </div>
          <p className="text-gray-600 font-medium mb-2">Performance Level</p>
          <h3 className={`text-xl font-bold ${performance.color}`}>
            {performance.level}
          </h3>
        </div>
      </div>

      {/* Performance Trend Indicator */}
      <div className="bg-white p-5 rounded-2xl shadow border mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              Overall Performance Trend
            </h4>
            <p className="text-gray-600 text-sm">
              Based on {totalExams} exam{totalExams !== 1 ? "s" : ""} across all
              categories
            </p>
          </div>
          <div
            className={`px-4 py-2 rounded-full ${performance.bg} ${performance.color} font-semibold`}
          >
            {performance.level}
          </div>
        </div>
        <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full ${
              avgMark >= 80
                ? "bg-green-500"
                : avgMark >= 60
                  ? "bg-blue-500"
                  : avgMark >= 40
                    ? "bg-yellow-500"
                    : "bg-red-500"
            }`}
            style={{ width: `${Math.min(100, avgMark)}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Charts by Type */}
      {processedData.map((group, index) => (
        <div
          key={index}
          className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-10 transition-all hover:shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800 capitalize flex items-center">
              <span className="mr-3 text-purple-500">
                {group.type === "quiz"
                  ? "🧠"
                  : group.type === "assignment"
                    ? "📋"
                    : group.type === "midterm"
                      ? "📝"
                      : "🏁"}
              </span>
              {group.type}
            </h3>
            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
              {group.records.length} exam{group.records.length !== 1 ? "s" : ""}
            </span>
          </div>

          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={group.records}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="Number"
                label={{
                  value: "Exam Number",
                  position: "insideBottom",
                  dy: 10,
                  fontSize: 12,
                  fill: "#666",
                }}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                yAxisId="left"
                domain={[0, 100]}
                label={{
                  value: "Percentage (%)",
                  angle: -90,
                  position: "insideLeft",
                  fontSize: 12,
                  fill: "#666",
                }}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{
                  value: "Marks",
                  angle: -90,
                  position: "insideRight",
                  fontSize: 12,
                  fill: "#666",
                }}
                tick={{ fontSize: 12 }}
              />

              {/* ✅ Enhanced Custom Tooltip */}
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const record = payload[0]?.payload;
                    const percentage = record.percentage;
                    const performanceColor =
                      percentage >= 80
                        ? "text-green-600"
                        : percentage >= 60
                          ? "text-blue-600"
                          : percentage >= 40
                            ? "text-yellow-600"
                            : "text-red-600";

                    return (
                      <div className="bg-white p-4 shadow-2xl rounded-xl border border-gray-200 text-sm backdrop-blur-sm">
                        <p className="font-semibold text-gray-800 border-b pb-2 mb-2">
                          Exam #{label}
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Percentage:</span>
                            <span className={`font-bold ${performanceColor}`}>
                              {percentage}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Obtained:</span>
                            <span className="font-bold text-green-600">
                              {record.obtainedMark}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Full Marks:</span>
                            <span className="font-bold text-red-600">
                              {record.fullMark}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                wrapperStyle={{
                  paddingTop: "20px",
                  fontSize: "12px",
                }}
              />

              {/* 🟦 Bar + 🟩🟥 Lines */}
              <Bar
                yAxisId="left"
                dataKey="percentage"
                fill="#4F46E5"
                name="Percentage (%)"
                radius={[4, 4, 0, 0]}
                className="hover:opacity-80 transition-opacity"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="obtainedMark"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ r: 5, fill: "#10B981", strokeWidth: 2 }}
                name="Obtained Marks"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="fullMark"
                stroke="#EF4444"
                strokeWidth={3}
                dot={{ r: 5, fill: "#EF4444", strokeWidth: 2 }}
                name="Full Marks"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ))}

      {/* Footer Note */}
      <div className="text-center text-gray-500 text-sm mt-8">
        <p>Data last updated: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default StudentMarkShow;
