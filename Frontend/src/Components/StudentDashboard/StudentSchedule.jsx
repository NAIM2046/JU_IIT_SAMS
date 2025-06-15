import React, { useState, useEffect } from "react";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";
import useStroge from "../../stroge/useStroge";

const StudentSchedule = () => {
  const AxiosSecure = useAxiosPrivate();
  const [scheduleData, setScheduleData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useStroge();

  // Light color variations for visual separation
  const dayColors = {
    Monday: "bg-blue-50",
    Tuesday: "bg-purple-50",
    Wednesday: "bg-green-50",
    Thursday: "bg-amber-50",
    Friday: "bg-cyan-50",
    Saturday: "bg-gray-50",
    Sunday: "bg-gray-100",
  };

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await AxiosSecure.get(
          `/api/getschedule/${user.class}`
        );
        setScheduleData(response.data[0] || {});
      } catch (error) {
        console.error("Failed to fetch schedule:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedule();
  }, [user.class, AxiosSecure]);

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-300"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Class {scheduleData.classNumber || user.class} Schedule
          </h2>
          <p className="text-gray-500 mt-1 text-sm">Weekly timetable</p>
        </div>

        {/* Schedule Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Day
                </th>
                {scheduleData?.timeSlots?.map((slot, index) => (
                  <th
                    key={index}
                    className="px-4 py-3 text-center text-sm font-medium text-gray-700"
                  >
                    {slot}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {daysOfWeek.map((day) => (
                <tr
                  key={day}
                  className={`${dayColors[day]} border-t border-gray-200`}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-700 pl-2">
                      {day}
                    </div>
                  </td>
                  {scheduleData?.timeSlots?.map((slot, idx) => {
                    const entry = scheduleData?.schedule[day]?.[slot];

                    return (
                      <td key={idx} className="px-4 py-3 whitespace-nowrap">
                        <div
                          className={`text-center rounded-lg p-3 ${entry?.subject ? "bg-white border border-gray-200" : "bg-gray-50"}`}
                        >
                          {entry?.subject ? (
                            <>
                              <div className="font-medium text-gray-800">
                                {entry.subject}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {entry.teacher}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                Room {entry.room}
                              </div>
                            </>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentSchedule;
