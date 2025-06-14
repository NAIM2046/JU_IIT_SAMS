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

const SubjectPer_exam_mark = ({ selectedSubject }) => {
  const AxiosSecure = useAxiosPrivate();
  const { user } = useStroge();

  const [examData, setExamData] = useState([]);
  const [loading, setLoading] = useState(true);

  const studentId = user?._id;
  const studentClass = user?.class;

  useEffect(() => {
    const fetchExamData = async () => {
      if (!studentId || !selectedSubject || !studentClass) return;

      try {
        const res = await AxiosSecure.get(
          `/api/exam/getallexam_markby_id?className=${studentClass}&subject=${selectedSubject}&studentId=${studentId}`
        );

        const processedData = res.data.map((item) => {
          const percentage =
            item.totalMark && item.marks != null
              ? ((item.marks / item.totalMark) * 100).toFixed(2)
              : 0;

          return {
            ...item,
            percentage: parseFloat(percentage),
            name: `${item.examType}-${item.examNumber}`,
            label: `${item.marks} / ${item.totalMark} (${percentage}%)`,
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
  }, [AxiosSecure, studentClass, selectedSubject, studentId]);

  if (loading) return <p>Loading exam data...</p>;

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-3">
        Exam Results for:{" "}
        <span className="text-blue-600">{selectedSubject}</span>
      </h2>

      {examData.length === 0 ? (
        <p>No exam data found for this subject.</p>
      ) : (
        <ResponsiveContainer width="100%" height={500}>
          <BarChart
            data={examData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} />
            <Tooltip
              formatter={(value, name, props) => {
                const { payload } = props;
                return [
                  `${value}%`,
                  `Marks: ${payload.marks} / ${payload.totalMark}`,
                ];
              }}
              labelFormatter={(label) => `Exam: ${label}`}
            />
            <Legend />
            <Bar
              dataKey="percentage"
              name="Percentage"
              isAnimationActive={false}
            >
              {examData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.percentage < 50 ? "#ef4444" : "#4f46e5"} // red or blue
                />
              ))}
              <LabelList
                dataKey="label"
                position="top"
                style={{
                  fontSize: 12,
                  fill: "#000",
                  fontWeight: "bold",
                  textAnchor: "middle",
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default SubjectPer_exam_mark;
