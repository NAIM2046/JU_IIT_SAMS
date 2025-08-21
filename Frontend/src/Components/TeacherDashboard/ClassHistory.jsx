import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";
import useStroge from "../../stroge/useStroge";
import {
  FiCalendar,
  FiUsers,
  FiCheckCircle,
  FiXCircle,
  FiBook,
  FiHome,
  FiArrowRight,
} from "react-icons/fi";
import { FaChalkboardTeacher } from "react-icons/fa";

const ClassHistory = () => {
  const { user } = useStroge();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const AxiosSecure = useAxiosPrivate();
  const teacherName = user.name;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await AxiosSecure.get(
          `/api/classHistory/byTeacher?teacherName=${teacherName}`
        );
        console.log("Fetched class history:", res.data);
        setHistory(res.data);
      } catch (err) {
        setError("Failed to load class history");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [teacherName, AxiosSecure]);

  const handleEnterClass = (classData) => {
    const schedule = {
      classId: classData.classId,
      subject: classData.subject,
      type: classData.type, // Assuming type is part of classData
    };
    const formattedDate = classData.date;
    navigate(`/teacherDashboard/Class/${schedule.classId}`, {
      state: {
        schedule,
        formattedDate,
        teacherName: classData.teacherName,
        batchNumber: classData.batchNumber,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
            <FaChalkboardTeacher className="mr-3 text-blue-600" />
            Class History
          </h1>
          <p className="text-gray-600">
            View your past classes and attendance records
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiXCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : history.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FiBook className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              No class history found
            </h3>
            <p className="text-gray-500">
              You haven't conducted any classes yet.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Mobile Cards View */}
            <div className="md:hidden space-y-4 p-4">
              {history.map((item, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg text-gray-800">
                      {item.classId}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        item.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <FiBook className="mr-2 text-blue-500" />
                      <span>{item.subject}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FiCalendar className="mr-2 text-blue-500" />
                      <span>{item.date}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FiUsers className="mr-2 text-blue-500" />
                      <span>{item.totalStudents} students</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-100">
                      <div className="flex space-x-4">
                        <div className="text-green-600 flex items-center">
                          <FiCheckCircle className="mr-1" />
                          <span>{item.totalPresent}</span>
                        </div>
                        <div className="text-red-600 flex items-center">
                          <FiXCircle className="mr-1" />
                          <span>{item.totalAbsent}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleEnterClass(item)}
                        className="flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        Details <FiArrowRight className="ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <div className="flex items-center">
                        <FiHome className="mr-2" /> Class
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <div className="flex items-center">
                        <FiBook className="mr-2" /> Subject
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <div className="flex items-center">
                        <FiCalendar className="mr-2" /> Date
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <div className="flex items-center">
                        <FiUsers className="mr-2" /> Total
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Present
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Absent
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {history.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {item.classId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {item.subject}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {item.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            item.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {item.totalStudents}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-green-600">
                        {item.totalPresent}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-red-600">
                        {item.totalAbsent}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEnterClass(item)}
                          className="text-blue-600 hover:text-blue-900 flex items-center justify-end w-full cursor-pointer"
                        >
                          View <FiArrowRight className="ml-1" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination would go here */}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassHistory;
