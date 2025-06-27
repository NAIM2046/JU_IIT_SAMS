import React, { useEffect, useState } from "react";
import useStroge from "../../stroge/useStroge";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";
import { FiCalendar, FiBook, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { PulseLoader } from "react-spinners";

const StudentsAttendance = () => {
  const { user } = useStroge();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const AxiosSecure = useAxiosPrivate();

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await AxiosSecure.get(
          `/api/attendance/getAttendanceHistory/${user._id}/${user.class}`
        );
        setAttendance(response.data || []);
        setError(null);
      } catch (error) {
        console.error("Error fetching attendance data:", error);
        setError("Failed to load attendance data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (user?._id && user?.class) {
      fetchAttendance();
    }
  }, [user]);

  // Group by month for better organization
  const groupByMonth = (records) => {
    const months = {};

    records.forEach((recordGroup) => {
      const date = new Date(recordGroup.parsedDate);
      const monthYear = `${date.toLocaleString("default", { month: "long" })} ${date.getFullYear()}`;

      if (!months[monthYear]) {
        months[monthYear] = [];
      }

      months[monthYear].push(recordGroup);
    });

    return months;
  };

  const attendanceByMonth = groupByMonth(attendance);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Attendance History</h2>
        <p className="text-gray-600">View your attendance records by date</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <PulseLoader color="#3B82F6" size={10} />
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      ) : attendance.length === 0 ? (
        <div className="bg-blue-50 rounded-lg p-6 text-center">
          <FiCalendar className="mx-auto text-4xl text-blue-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-800 mb-1">
            No Attendance Records
          </h3>
          <p className="text-gray-600">
            Your attendance records will appear here once available.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(attendanceByMonth).map(([month, records]) => (
            <div key={month} className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 bg-gray-100 px-4 py-2 rounded-lg">
                {month}
              </h3>

              <div className="space-y-3">
                {records.map((recordGroup, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-xl p-4 shadow-sm bg-white hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <FiCalendar className="text-blue-500" />
                      </div>
                      <h3 className="font-medium text-gray-700">
                        {new Date(recordGroup.parsedDate).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </h3>
                    </div>

                    <div className="flex gap-3">
                      {recordGroup.records.map((record, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                        >
                          <div className="bg-purple-100 p-2 rounded-full">
                            <FiBook className="text-purple-500" />
                          </div>
                          <div className="flex">
                            <p className="font-medium text-gray-800">
                              {record.subject}
                            </p>
                          </div>
                          <div
                            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                              record.status === "A"
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {record.status === "A" ? (
                              <>
                                <FiXCircle className="inline mr-1" />
                                Absent
                              </>
                            ) : (
                              <>
                                <FiCheckCircle className="inline mr-1" />
                                Present
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentsAttendance;
