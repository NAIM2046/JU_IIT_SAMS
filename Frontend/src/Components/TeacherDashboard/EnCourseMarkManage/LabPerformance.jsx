import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import useAxiosPrivate from "../../../TokenAdd/useAxiosPrivate";
import axios from "axios";
import { FaChalkboardTeacher } from "react-icons/fa";
import {
  FiAward,
  FiBook,
  FiCheckCircle,
  FiTrendingDown,
  FiTrendingUp,
  FiUser,
  FiXCircle,
} from "react-icons/fi";

const LabPerformance = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [fullMarks, setFullMarks] = useState({
    fullGood: 10,
    fullBad: 5,
    fullExcellent: 15,
  });
  const [fullPer, setFullPer] = useState(1);
  const [performanceInfo, setPerformanceInfo] = useState([]);
  const [percentageStat, setPercentageStat] = useState({
    excellentPer: 0,
    goodPer: 0,
    badPer: 0,
  });

  const obj = location.state;
  const axiosSecure = useAxiosPrivate();

  const percentageCalculator = (currMark, fullMark, c) =>
    (parseInt(fullMark) * parseInt(currMark)) / parseInt(c);

  const totalMarkGenerator = (student) => {
    const ans =
      percentageCalculator(
        student.goodCount,
        fullMarks.fullGood,
        student.totalTasks
      ) +
      percentageCalculator(
        student.badCount,
        fullMarks.fullBad,
        student.totalTasks
      ) +
      percentageCalculator(
        student.excellentCount,
        fullMarks.fullExcellent,
        student.totalTasks
      );
    return ans;
  };

  useEffect(() => {
    if (!obj) return;
    axiosSecure.post(`/api/performance/ByClassandSubject`, obj).then((res) => {
      console.log(res.data);

      const countInfo = res.data.countsInfo[0];
      const studentsInfo = res.data.performanceInfo;
      console.log("info", studentsInfo);
      const fullPercentage =
        res.data.performanceInfo.length * studentsInfo[0].totalTasks;
      const percentData = {
        excellentPer: (100 * countInfo.totalExcellent) / fullPercentage,
        goodPer: (100 * countInfo.totalGood) / fullPercentage,
        badPer: (100 * countInfo.totalBad) / fullPercentage,
      };

      setFullPer(studentsInfo[0].totalTasks);
      setPercentageStat(percentData);
      setPerformanceInfo(studentsInfo);
      setIsLoading(false);
    });
  }, [obj]);

  const handleSaveMarks = () => {
    const marksInfo = performanceInfo.map((info) => {
      return {
        studentId: info.studentId,
        performanceMark: totalMarkGenerator(info),
      };
    });

    const fullInfo = {
      classId:obj.courseId,
      subjectCode:obj.courseCode,
      marks:marksInfo,
      Number:"final",
      type:"performance",
      fullMarks
    };

    axiosSecure.post("/api/performance/savePerformanceInfo", fullInfo).then(res => {
      console.log(res.data);
    })
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        {/* statistics showing */}
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex gap-3 justify-between">
              <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
                <FaChalkboardTeacher className="mr-3 text-blue-600" />
                Evaluation Marks
              </h1>
              <button onClick={handleSaveMarks} className="btn btn-primary">
                Save Marks
              </button>
            </div>
            <div className="bg-white rounded-lg mt-5 shadow-sm p-4 mb-4">
              <div className="flex justify-center gap-10 items-center">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-green-500">
                    Excellent:{" "}
                  </h1>
                  <p className="text-xl font-bold">
                    {percentageStat.excellentPer}%
                  </p>
                  <input
                    type="text"
                    className="input"
                    defaultValue={fullMarks.fullExcellent}
                    onKeyUp={(e) =>
                      setFullMarks({
                        ...fullMarks,
                        fullExcellent: e.target.value,
                      })
                    }
                    placeholder="Put Mark"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-green-400">Good: </h1>
                  <p className="text-xl font-bold">{percentageStat.goodPer}%</p>
                  <input
                    type="text"
                    className="input"
                    defaultValue={fullMarks.fullGood}
                    onKeyUp={(e) =>
                      setFullMarks({ ...fullMarks, fullGood: e.target.value })
                    }
                    placeholder="Put Mark"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-red-500">Bad: </h1>
                  <p className="text-xl font-bold">{percentageStat.badPer}%</p>
                  <input
                    type="text"
                    className="input"
                    defaultValue={fullMarks.fullBad}
                    onKeyUp={(e) => {
                      setFullMarks({ ...fullMarks, fullBad: e.target.value });
                      console.log(fullMarks);
                    }}
                    placeholder="Put Mark"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <FiUser className="mr-2" /> Name
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roll
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Marks
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {performanceInfo?.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {student.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {student.classRoll}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <p className="bg-base-300 rounded-full text-green-600 font-bold px-3">
                          {percentageCalculator(
                            student.excellentCount,
                            100,
                            fullPer
                          )}
                          % <span>Excellent</span>
                        </p>
                        <p className="bg-base-300 rounded-full text-green-400 font-bold px-3">
                          {percentageCalculator(
                            student.goodCount,
                            100,
                            fullPer
                          )}
                          % <span>Good</span>
                        </p>
                        <p className="bg-base-300 rounded-full text-red-500 font-bold px-3">
                          {percentageCalculator(student.badCount, 100, fullPer)}
                          % <span>Bad</span>
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {totalMarkGenerator(student)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabPerformance;
