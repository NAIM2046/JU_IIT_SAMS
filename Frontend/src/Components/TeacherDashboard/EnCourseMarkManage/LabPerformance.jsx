import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import useAxiosPrivate from "../../../TokenAdd/useAxiosPrivate";
import { FiUser, FiTrendingUp, FiAward, FiTrendingDown } from "react-icons/fi";

const LabPerformance = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState([]);
  const axiosSecure = useAxiosPrivate();
  const obj = location.state;

  useEffect(() => {
    if (!obj) return;
    const fetchPerformanceData = async () => {
      try {
        const response = await axiosSecure.get(
          `/api/performance/ByClassandSubject/${obj.classId}/${obj.subjectCode}`
        );
        const data = response.data;
        setPerformanceData(data);
      } catch (error) {
        console.error("Error fetching performance data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPerformanceData();
  }, [obj]);

  const calculatePercentage = (count, total) => {
    if (!total || total === 0) return "0%";
    return `${((count / total) * 100).toFixed(1)}%`;
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
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Lab Performance Table
      </h2>

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
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {performanceData.map((student, index) => (
              <tr key={student._id} className="hover:bg-gray-50">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{student.name}</td>
                <td className="px-4 py-2">{student.totalTasks}</td>
                <td className="px-4 py-2 text-green-700 font-semibold">
                  {calculatePercentage(
                    student.excellentCount,
                    student.totalTasks
                  )}
                </td>
                <td className="px-4 py-2 text-blue-600 font-semibold">
                  {calculatePercentage(student.goodCount, student.totalTasks)}
                </td>
                <td className="px-4 py-2 text-red-500 font-semibold">
                  {calculatePercentage(student.badCount, student.totalTasks)}
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
