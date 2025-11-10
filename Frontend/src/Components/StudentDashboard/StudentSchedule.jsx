import React, { useState, useEffect } from "react";
import useStroge from "../../stroge/useStroge";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaChalkboardTeacher,
} from "react-icons/fa";

const StudentSchedule = () => {
  const { user } = useStroge();
  const [schedules, setSchedules] = useState([]);
  const [selectedDay, setSelectedDay] = useState("All");
  const classNumber = user?.class;
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await axiosPrivate.get("/api/getallschedule");
        const classSchedules = res.data.filter(
          (schedule) => schedule.classId === classNumber
        );
        setSchedules(classSchedules);
      } catch (error) {
        console.error("Error fetching schedules:", error);
      }
    };
    fetchSchedules();
  }, [classNumber, axiosPrivate]);

  // Filter schedules based on selected day
  const filteredSchedules =
    selectedDay === "All"
      ? schedules
      : schedules.filter((schedule) => schedule.day === selectedDay);

  // Get unique days for filter dropdown
  const days = ["All", ...new Set(schedules.map((item) => item.day))];

  // Group schedules by day
  const schedulesByDay = filteredSchedules.reduce((acc, schedule) => {
    if (!acc[schedule.day]) acc[schedule.day] = [];
    acc[schedule.day].push(schedule);
    return acc;
  }, {});

  // Sort days with today's day first
  const dayOrder = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const todayName = dayOrder[new Date().getDay()];
  const sortedDays = Object.keys(schedulesByDay).sort((a, b) => {
    if (a === todayName) return -1;
    if (b === todayName) return 1;
    return dayOrder.indexOf(a) - dayOrder.indexOf(b);
  });

  // Format time
  const formatTime = (time24) => {
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-blue-600 p-3 rounded-full shadow-md">
              <FaCalendarAlt className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Class Schedule
              </h1>
              <p className="text-gray-600">Class {classNumber}</p>
            </div>
          </div>

          {/* Day Filter */}
          <div className="flex justify-center mb-6">
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 shadow-sm"
            >
              {days.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Schedule Section */}
        {filteredSchedules.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <FaCalendarAlt className="text-gray-300 text-4xl mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No classes found
            </h3>
            <p className="text-gray-500">
              {selectedDay !== "All"
                ? "No classes on selected day."
                : "No schedule available for your class."}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedDays.map((day) => (
              <div
                key={day}
                className={`rounded-xl shadow-lg overflow-hidden border ${
                  day === todayName
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-100 bg-white"
                } transition duration-300`}
              >
                {/* Day Header */}
                <div
                  className={`p-4 text-white font-bold text-xl ${
                    day === todayName ? "bg-blue-600" : "bg-gray-700"
                  }`}
                >
                  {day}
                  {day === todayName && (
                    <span className="ml-2 text-sm bg-white text-blue-600 px-2 py-0.5 rounded-md">
                      Today
                    </span>
                  )}
                </div>

                {/* Classes List */}
                <div className="p-4 grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                  {schedulesByDay[day]
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((schedule) => (
                      <div
                        key={schedule._id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-300 bg-white"
                      >
                        <h3 className="font-bold text-gray-800 text-lg mb-1">
                          {schedule.subject.title}
                        </h3>
                        <p className="text-gray-500 text-sm mb-3">
                          {schedule.subject.code} • {schedule.subject.type}
                        </p>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center text-gray-700">
                            <FaClock className="text-green-500 mr-2" />
                            <span>
                              {formatTime(schedule.startTime)} -{" "}
                              {formatTime(schedule.endTime)}
                            </span>
                          </div>

                          <div className="flex items-center text-gray-700">
                            <FaChalkboardTeacher className="text-blue-500 mr-2" />
                            <span>{schedule.teacherName}</span>
                          </div>

                          <div className="flex items-center text-gray-700">
                            <FaMapMarkerAlt className="text-red-500 mr-2" />
                            <span>Room: {schedule.room}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentSchedule;
