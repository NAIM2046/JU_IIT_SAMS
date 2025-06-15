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
  Legend,
  ResponsiveContainer,
  LabelList,
  Cell,
} from "recharts";
import { FiAlertCircle, FiBarChart2 } from "react-icons/fi";

const SubjectExamMarks = ({ selectedSubject }) => {
  const AxiosSecure = useAxiosPrivate();
  const { user } = useStroge();
  const [examData, setExamData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExamData = async () => {
      if (!user?._id || !selectedSubject || !user?.class) return;

      setLoading(true);
      try {
        const res = await AxiosSecure.get(
          `/api/exam/getallexam_markby_id?className=${user.class}&subject=${selectedSubject}&studentId=${user._id}`
        );

        const processedData = res.data.map((item) => {
          const percentage =
            item.totalMark && item.marks != null
              ? ((item.marks / item.totalMark) * 100).toFixed(2)
              : 0;

          return {
            ...item,
            percentage: parseFloat(percentage),
            name: `${item.examType} ${item.examNumber}`,
            label: `${percentage}%`,
            fullLabel: `${item.marks}/${item.totalMark} (${percentage}%)`,
          };
        });

        setExamData(processedData);
      } catch (error) {
        console.error("Failed to load exam marks:", error);
        setExamData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExamData();
  }, [AxiosSecure, user, selectedSubject]);

  const getBarColor = (percentage) => {
    if (percentage < 50) return "#EF4444"; // Red
    if (percentage < 75) return "#3B82F6"; // Blue
    return "#10B981"; // Green
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <FiBarChart2 className="mr-2 text-blue-600" />
          Exam Performance:{" "}
          <span className="text-blue-600 ml-1">{selectedSubject}</span>
        </h2>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : examData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FiAlertCircle className="text-gray-400 text-4xl mb-3" />
            <h3 className="text-lg font-medium text-gray-700">
              No Exam Data Available
            </h3>
            <p className="text-gray-500 mt-1">
              No exam results found for {selectedSubject}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
                <p className="text-sm font-medium text-gray-500">Total Exams</p>
                <p className="text-2xl font-semibold text-gray-800 mt-1">
                  {examData.length}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
                <p className="text-sm font-medium text-gray-500">
                  Average Score
                </p>
                <p className="text-2xl font-semibold text-gray-800 mt-1">
                  {(
                    examData.reduce((sum, item) => sum + item.percentage, 0) /
                    examData.length
                  ).toFixed(2)}
                  %
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
                <p className="text-sm font-medium text-gray-500">
                  Highest Score
                </p>
                <p className="text-2xl font-semibold text-gray-800 mt-1">
                  {Math.max(...examData.map((item) => item.percentage))}%
                </p>
              </div>
            </div>

            {/* Chart */}
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={examData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tickFormatter={(tick) => `${tick}%`}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value, name, props) => {
                      const { payload } = props;
                      return [
                        `Score: ${payload.percentage}%`,
                        `Marks: ${payload.marks}/${payload.totalMark}`,
                      ];
                    }}
                    labelFormatter={(label) => `Exam: ${label}`}
                    contentStyle={{
                      borderRadius: "6px",
                      border: "1px solid #E5E7EB",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      padding: "8px 12px",
                      fontSize: "14px",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="percentage"
                    name="Score (%)"
                    isAnimationActive={true}
                    animationDuration={1500}
                  >
                    {examData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getBarColor(entry.percentage)}
                      />
                    ))}
                    <LabelList
                      dataKey="fullLabel"
                      position="right"
                      style={{
                        fontSize: 12,
                        fill: "#374151",
                        fontWeight: "500",
                      }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectExamMarks;
