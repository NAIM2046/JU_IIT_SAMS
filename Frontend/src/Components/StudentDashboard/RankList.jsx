import React, { useEffect, useState } from "react";
import useStroge from "../../stroge/useStroge";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";

const RankList = () => {
  const AxiosSecure = useAxiosPrivate();
  const [rankList, setRankList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useStroge();
  const classNumber = user?.class;

  useEffect(() => {
    const fetchRankList = async () => {
      try {
        const res = await AxiosSecure.get(
          `/api/exam/rank_summary/${classNumber}`
        );
        setRankList(res.data);
      } catch (error) {
        console.error("Error fetching rank list:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (classNumber) {
      fetchRankList();
    }
  }, [classNumber, AxiosSecure]);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-semibold text-white">
              Class {classNumber} Rank List
            </h2>
            <div className="mt-2 md:mt-0 bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm text-white">
              Total Students: {rankList.length}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Rank
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
                    Obtained
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Total
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
                {rankList.map((item, index) => {
                  const percentage = (
                    (item.totalGetMarks / item.totalFullMark) *
                    100
                  ).toFixed(1);
                  const isCurrentUser = item._id === user?._id;

                  return (
                    <tr
                      key={item._id || index}
                      className={
                        isCurrentUser
                          ? "bg-blue-50 font-medium"
                          : "hover:bg-gray-50"
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span
                            className={`inline-flex items-center justify-center h-8 w-8 rounded-full ${
                              index < 3
                                ? index === 0
                                  ? "bg-yellow-100 text-yellow-800"
                                  : index === 1
                                    ? "bg-gray-100 text-gray-800"
                                    : "bg-amber-100 text-amber-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {item.rank}
                          </span>
                          {index < 3 && (
                            <span className="ml-2 text-xs text-gray-500">
                              {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={
                                item.photoURL ||
                                "https://i.ibb.co/G9wkJbX/user.webp"
                              }
                              alt={item.name}
                            />
                          </div>
                          <div className="ml-4">
                            <div
                              className={`text-sm ${isCurrentUser ? "text-blue-600" : "text-gray-900"} font-medium`}
                            >
                              {item.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              Roll: {item.rollNumber || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.totalGetMarks}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.totalFullMark}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-20 mr-2">
                            <div className="relative pt-1">
                              <div className="flex mb-2 items-center justify-between">
                                <div>
                                  <span
                                    className={`text-xs font-semibold inline-block py-1 px-2 rounded-full ${percentage >= 80 ? "text-green-600 bg-green-200" : percentage >= 50 ? "text-blue-600 bg-blue-200" : "text-red-600 bg-red-200"}`}
                                  >
                                    {percentage}%
                                  </span>
                                </div>
                              </div>
                              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                                <div
                                  style={{ width: `${percentage}%` }}
                                  className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${percentage >= 80 ? "bg-green-500" : percentage >= 50 ? "bg-blue-500" : "bg-red-500"}`}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Current User Highlight */}
        {!isLoading && rankList.some((item) => item._id === user?._id) && (
          <div className="px-6 py-3 bg-blue-50 border-t border-gray-200 text-sm text-blue-700">
            <span className="font-medium">Note:</span> Your position is
            highlighted in blue
          </div>
        )}
      </div>
    </div>
  );
};

export default RankList;
