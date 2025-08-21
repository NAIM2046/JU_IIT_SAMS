import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import useAxiosPrivate from "../../../TokenAdd/useAxiosPrivate";
import {
  FiUser,
  FiTrendingUp,
  FiAward,
  FiTrendingDown,
  FiPercent,
} from "react-icons/fi";
import useStroge from "../../../stroge/useStroge";

const LabPerformance = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState([]);
  const [overallStats, setOverallStats] = useState({
    totalTasks: 0,
    excellentCount: 0,
    goodCount: 0,
    badCount: 0,
  });
  const [markWeights, setMarkWeights] = useState({
    excellentMark: 0,
    goodMark: 0,
    badMark: 0,
  });
  const { user } = useStroge();

  const axiosSecure = useAxiosPrivate();
  const obj = location.state;
  console.log(obj);

  useEffect(() => {
    if (!obj) return;
    const fetchPerformanceData = async () => {
      try {
        const response = await axiosSecure.get(
          `/api/performance/ByClassandSubject/${obj.classId}/${obj.subjectCode}/${obj.batchNumber}`
        );
        console.log("Performance data fetched:", response.data);
        const data = response.data.performanceInfo;
        console.log("Performance Data:", data);
        const markWeight = response.data?.markWeights[0]?.markWeights || {
          excellentMark: 0,
          goodMark: 0,
          badMark: 0,
        };
        // console.log("Mark Weights:", markWeight);
        // console.log("Performance Data:", data);
        setPerformanceData(data);
        setMarkWeights(markWeight);

        const stats = data.reduce(
          (acc, student) => {
            return {
              totalTasks: acc.totalTasks + student.totalTasks,
              excellentCount: acc.excellentCount + student.excellentCount,
              goodCount: acc.goodCount + student.goodCount,
              badCount: acc.badCount + student.badCount,
            };
          },
          { totalTasks: 0, excellentCount: 0, goodCount: 0, badCount: 0 }
        );

        setOverallStats(stats);
      } catch (error) {
        console.error("Error fetching performance data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPerformanceData();
  }, [obj]);

  const calculatePercentage = (count, total) => {
    if (!total || total === 0) return 0;
    return ((count / total) * 100).toFixed(1);
  };

  const calculateFinalMark = (student) => {
    if (student.totalTasks === 0) return 0;

    const excellentWeight =
      (student.excellentCount / student.totalTasks) * markWeights.excellentMark;
    const goodWeight =
      (student.goodCount / student.totalTasks) * markWeights.goodMark;
    const badWeight =
      (student.badCount / student.totalTasks) * markWeights.badMark;

    return (excellentWeight + goodWeight + badWeight).toFixed(1);
  };

  const handleMarkChange = (e) => {
    const { name, value } = e.target;
    setMarkWeights((prev) => ({
      ...prev,
      [name]: Math.min(100, Math.max(0, parseInt(value))),
    }));
  };

  const saveFinalMarks = async () => {
    if (performanceData.length === 0) {
      alert("No performance data available to save.");
      return;
    }

    const fullMark = markWeights.excellentMark; // Assuming full mark is based on excellent mark
    if (fullMark <= 0) {
      alert("Please set a valid full mark.");
      return;
    }

    console.log("Saving final marks with weights:", markWeights);
    console.log("Performance Data:", performanceData);
    if (!markWeights || !markWeights.excellentMark) {
      alert("Please set valid mark weights before saving.");
      return;
    }
    if (
      markWeights.excellentMark <= 0 ||
      markWeights.goodMark <= 0 ||
      markWeights.badMark <= 0
    ) {
      alert("Mark weights must be greater than zero.");
      return;
    }

    try {
      const marksArray = performanceData.map((student) => ({
        studentId: student.studentId, // Ensure _id is studentId
        mark: parseFloat(calculateFinalMark(student)),
      }));

      const finalMarkData = {
        Number: "final",
        subjectCode: obj.subjectCode,
        type: "performance",
        classId: obj.classId,
        fullMark: fullMark,
        marks: marksArray,
        markWeights,
        batchNumber: obj.batchNumber,
        teacherId: user._id,
      };
      console.log("Final Mark Data:", finalMarkData);

      const res = await axiosSecure.post(
        "/api/performance/savePerformanceInfo",
        finalMarkData
      );
      if (res.data) {
        alert("✅ Final marks saved successfully!");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error saving final marks:", error);
      alert("Failed to save final marks.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">
        Lab Performance Table
      </h2>

      {/* Mark Weights Input */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-1">
          {obj.classId} - {obj.title}- {obj.subjectCode}
        </h3>
      </div>

      {/* Overall Statistics Header */}
      <div className="flex justify-center gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm text-center min-w-[120px]">
          <div className="text-green-600 font-bold flex items-center justify-center gap-1">
            <FiTrendingUp /> %E
          </div>
          <div className="text-xl font-semibold">
            {calculatePercentage(
              overallStats.excellentCount,
              overallStats.totalTasks
            )}
            %
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm text-center min-w-[120px]">
          <div className="text-blue-500 font-bold flex items-center justify-center gap-1">
            <FiAward /> %G
          </div>
          <div className="text-xl font-semibold">
            {calculatePercentage(
              overallStats.goodCount,
              overallStats.totalTasks
            )}
            %
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm text-center min-w-[120px]">
          <div className="text-red-500 font-bold flex items-center justify-center gap-1">
            <FiTrendingDown /> %B
          </div>
          <div className="text-xl font-semibold">
            {calculatePercentage(
              overallStats.badCount,
              overallStats.totalTasks
            )}
            %
          </div>
        </div>
        <div className="text-center mt-6 ">
          <button
            onClick={saveFinalMarks}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition"
          >
            Save Final Marks
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-green-600 mb-1">
            Excellent Mark (%)
          </label>
          <input
            type="number"
            name="excellentMark"
            value={markWeights.excellentMark}
            onChange={handleMarkChange}
            min="0"
            max="100"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-blue-500 mb-1">
            Good Mark (%)
          </label>
          <input
            type="number"
            name="goodMark"
            value={markWeights.goodMark}
            onChange={handleMarkChange}
            min="0"
            max="100"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-red-500 mb-1">
            Bad Mark (%)
          </label>
          <input
            type="number"
            name="badMark"
            value={markWeights.badMark}
            onChange={handleMarkChange}
            min="0"
            max="100"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3 flex items-center gap-1">
                <FiUser /> Name
              </th>
              <th className="px-4 py-3">Total Tasks</th>
              <th className="px-4 py-3  items-center gap-1 text-green-600">
                <FiTrendingUp /> Excellent (%)
              </th>
              <th className="px-4 py-3  items-center gap-1 text-blue-500">
                <FiAward /> Good (%)
              </th>
              <th className="px-4 py-3  items-center gap-1 text-red-500">
                <FiTrendingDown /> Bad (%)
              </th>
              <th className="px-4 py-3  items-center gap-1 font-bold text-purple-600">
                Final Mark (%)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {performanceData.map((student, index) => (
              <tr
                key={student._id}
                className="hover:bg-green-300 border-b border-gray-200"
              >
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{student.name}</td>
                <td className="px-4 py-2">{student.totalTasks}</td>
                <td className="px-4 py-2 text-green-700 font-semibold">
                  {calculatePercentage(
                    student.excellentCount,
                    student.totalTasks
                  )}
                  %
                </td>
                <td className="px-4 py-2 text-blue-600 font-semibold">
                  {calculatePercentage(student.goodCount, student.totalTasks)}%
                </td>
                <td className="px-4 py-2 text-red-500 font-semibold">
                  {calculatePercentage(student.badCount, student.totalTasks)}%
                </td>
                <td className="px-4 py-2 font-bold text-purple-600">
                  {calculateFinalMark(student)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LabPerformance;
