import React, { useState, useEffect } from "react";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";
import useStroge from "../../stroge/useStroge";
import { FiBook, FiCalendar, FiClock, FiMapPin } from "react-icons/fi";

const formatTime = (timeStr) => {
  const [hourStr, minuteStr] = timeStr.split(":");
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minuteStr} ${ampm}`;
};

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const StudentSchedule = () => {
  const AxiosSecure = useAxiosPrivate();
  const [scheduleData, setScheduleData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useStroge();

  // Light color variations for visual separation

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await AxiosSecure.get(
          `/api/getschedule/${user.class}`
        );
        setScheduleData(response.data || {});
      } catch (error) {
        console.error("Failed to fetch schedule:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedule();
  }, [user.class, AxiosSecure]);
  console.log("Schedule Data:", scheduleData);

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
            Class {user.class} Schedule
          </h2>
          <p className="text-gray-500 mt-1 text-sm">Weekly timetable</p>
        </div>

        {/* Schedule Table */}
        <div className="overflow-x-auto">
          <div className="space-y-8">
            {days.map((day) => {
              const schedulesForDay = scheduleData
                .filter((schedule) => schedule.day === day)
                .sort((a, b) => a.startTime.localeCompare(b.startTime));

              return (
                <div
                  key={day}
                  className="bg-white rounded-xl shadow-md overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
                    <h2 className="text-xl font-bold text-white">{day}</h2>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    {schedulesForDay.length > 0 ? (
                      <div className="flex space-x-4 min-w-max">
                        {schedulesForDay.map((schedule) => (
                          <div
                            key={schedule._id}
                            className="border-1 border-blue-500 px-4 py-3 hover:bg-blue-50 transition-colors min-w-[250px]"
                          >
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {schedule.subjectName}
                            </h3>
                            <div className="flex items-center text-gray-600 mb-1">
                              <FiClock className="mr-2" />
                              <span>
                                {formatTime(schedule.startTime)} -{" "}
                                {formatTime(schedule.endTime)}
                              </span>
                            </div>
                            <div className="flex items-center text-gray-600 mb-1">
                              <FiMapPin className="mr-2" />
                              <span>Room {schedule.room}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <FiBook className="mr-2" />
                              <span>{schedule.subject}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <FiCalendar className="mx-auto text-3xl mb-2" />
                        <p>No classes scheduled</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSchedule;
