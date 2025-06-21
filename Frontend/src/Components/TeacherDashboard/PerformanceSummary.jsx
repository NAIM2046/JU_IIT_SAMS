import React, { useEffect, useState } from "react";
import useStroge from "../../stroge/useStroge";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";
import {
  FiBook,
  FiAward,
  FiAlertTriangle,
  FiUsers,
  FiBarChart2,
} from "react-icons/fi";
import { FaChalkboardTeacher } from "react-icons/fa";

const PerformanceSummary = () => {
  const AxiosSecure = useAxiosPrivate();
  const [performaceList, setPerformaceList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useStroge();
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [stats, setStats] = useState(null);
  const teacherName = user.name;
  // Fetch all teacher classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await AxiosSecure.get(
          `/api/getteacherschedule/${teacherName}`
        );
        setTeacherClasses(res.data);
      } catch (error) {
        console.error("Failed to fetch classes:", error);
      }
    };
    fetchClasses();
  }, [AxiosSecure]);

  // When class is selected, extract all its subjects
  const handleClassChange = (e) => {
    const classNumber = e.target.value;
    setSelectedClass(classNumber);
    setSelectedSubject("");
    setPerformaceList([]);
    setStats(null);

    const selectedClassData = teacherClasses.find(
      (cls) => cls.classId === classNumber
    );
    if (selectedClassData) {
      setSubjects(selectedClassData.subjects || []);
    } else {
      setSubjects([]);
    }
  };

  // When subject is selected, fetch performance data
  const handleSubjectChange = async (e) => {
    const subject = e.target.value;
    setSelectedSubject(subject);
    setIsLoading(true);

    try {
      const res = await AxiosSecure.get(
        `/api/exam/getclass_subject_performace?classNumber=${selectedClass}&subject=${subject}`
      );
      setPerformaceList(res.data);
      calculateStats(res.data);
    } catch (error) {
      console.error("Error fetching performance data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate statistics for the performance data
  const calculateStats = (data) => {
    if (!data || data.length === 0) return;

    const totalStudents = data.length;
    const totalMarks = data.reduce(
      (sum, stu) => sum + stu.totalObtainedMark,
      0
    );
    const averageMark = totalMarks / totalStudents;
    const averagePercentage = (averageMark / data[0].totalFullMark) * 100;

    const lowPerformers = data.filter((stu) => {
      const percentage = (stu.totalObtainedMark / stu.totalFullMark) * 100;
      return percentage < 50;
    }).length;

    setStats({
      averageMark: averageMark.toFixed(2),
      averagePercentage: averagePercentage.toFixed(2),
      lowPerformers,
      totalStudents,
    });
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <FiBarChart2 className="mr-2 text-blue-600" />
            Subject Performance Analysis
          </h2>
          <p className="text-gray-500 mt-1">
            Track and analyze student performance by class and subject
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-xs mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class
            </label>
            <select
              value={selectedClass}
              onChange={handleClassChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Class</option>
              {teacherClasses.map((cls, idx) => (
                <option key={idx} value={cls.classId}>
                  Class {cls.classId}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={handleSubjectChange}
              disabled={!selectedClass}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            >
              <option value="">Select Subject</option>
              {subjects.map((subj, idx) => (
                <option key={idx} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-xs border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
                <FiUsers className="text-lg" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Students</p>
                <p className="text-xl font-bold text-gray-800">
                  {stats.totalStudents}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-xs border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3">
                <FiAward className="text-lg" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Average Mark</p>
                <p className="text-xl font-bold text-gray-800">
                  {stats.averageMark}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-xs border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-purple-100 text-purple-600 mr-3">
                <FiBook className="text-lg" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Average %</p>
                <p className="text-xl font-bold text-gray-800">
                  {stats.averagePercentage}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-xs border-l-4 border-red-500">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-red-100 text-red-600 mr-3">
                <FiAlertTriangle className="text-lg" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Below 50%</p>
                <p className="text-xl font-bold text-gray-800">
                  {stats.lowPerformers}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Table */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : performaceList?.length > 0 ? (
        <div className="bg-white rounded-lg shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    #
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Student
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Roll
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Full Mark
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Obtained
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {performaceList.map((stu, index) => {
                  const percentage = (
                    (stu.totalObtainedMark / stu.totalFullMark) *
                    100
                  ).toFixed(2);
                  const isLowPerformer = percentage < 50;

                  return (
                    <tr
                      key={stu.studentId}
                      className={
                        isLowPerformer ? "bg-red-50" : "hover:bg-gray-50"
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {stu.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stu.roll}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stu.totalFullMark}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stu.totalObtainedMark}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isLowPerformer ? "text-red-600" : "text-gray-900"}`}
                      >
                        {percentage}%
                        {isLowPerformer && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            Needs Attention
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        selectedSubject && (
          <div className="bg-white p-8 rounded-lg shadow-xs text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
              <FiBook className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No performance data
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              No exam results found for {selectedSubject} in Class{" "}
              {selectedClass}.
            </p>
          </div>
        )
      )}
    </div>
  );
};

export default PerformanceSummary;
