import React, { useEffect, useState } from "react";
import useStroge from "../../stroge/useStroge";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";
import {
  FiClock,
  FiBook,
  FiMapPin,
  FiCalendar,
  FiUser,
  FiPower,
} from "react-icons/fi";

const formatTime = (timeStr) => {
  const [hourStr, minuteStr] = timeStr.split(":");
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minuteStr} ${ampm}`;
};

// Color palette for different days
const dayColors = {
  Sunday: "bg-gradient-to-r from-purple-500 to-pink-500",
  Monday: "bg-gradient-to-r from-blue-500 to-cyan-500",
  Tuesday: "bg-gradient-to-r from-green-500 to-emerald-500",
  Wednesday: "bg-gradient-to-r from-yellow-500 to-amber-500",
  Thursday: "bg-gradient-to-r from-orange-500 to-red-500",
  Friday: "bg-gradient-to-r from-indigo-500 to-violet-500",
  Saturday: "bg-gradient-to-r from-rose-500 to-fuchsia-500",
};

const TeacherSchedule = () => {
  const [allSchedules, setAllSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useStroge();
  const AxiosSecure = useAxiosPrivate();
  const teacherName = user?.name;

  // Get today's day name and reorder days array
  const getOrderedDays = () => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    
    const today = new Date().getDay(); // 0 for Sunday, 1 for Monday, etc.
    const todayName = days[today];
    
    // Reorder array: today first, then the remaining days
    const reorderedDays = [
      todayName,
      ...days.filter(day => day !== todayName)
    ];
    
    return reorderedDays;
  };

  const [orderedDays, setOrderedDays] = useState([]);

  useEffect(() => {
    // Set ordered days when component mounts
    setOrderedDays(getOrderedDays());
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await AxiosSecure.get("/api/getallschedule");
        const filteredSchedules = res.data.filter(
          (schedule) => schedule.teacherName === teacherName
        );
        setAllSchedules(filteredSchedules);
      } catch (error) {
        console.error("Error fetching schedules:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.name, AxiosSecure]);

  const toggleScheduleStatus = async (schedule) => {
    const confirm = window.confirm(
      `Are you sure you want to ${
        schedule.active ? "deactivate" : "activate"
      } this class?`
    );
    if (!confirm) return;
    setLoading(true);
    try {
      const updatedSchedule = {
        ...schedule,
        active: !schedule.active,
      };

      const res = await AxiosSecure.put(`/api/updateactivestatus/`, {
        teacherId: schedule.teacherId,
        courseCode: schedule.subject.code,
        status: updatedSchedule.active,
      });
      console.log(res.data);
      setAllSchedules((prev) =>
        prev.map((s) =>
          s.subject.code === updatedSchedule.subject.code
            ? { ...s, active: updatedSchedule.active }
            : s
        )
      );
    } catch (error) {
      console.error("Error updating schedule status:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-8xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                My Teaching Schedule
              </h1>
              <p className="text-gray-600 mt-2">
                Here's your weekly teaching timetable
              </p>
            </div>
            <div className="flex items-center mt-4 md:mt-0 bg-blue-100 px-4 py-2 rounded-full">
              <FiUser className="text-blue-600 mr-2" />
              <span className="font-medium text-blue-800">{teacherName}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {orderedDays.map((day) => {
            const schedulesForDay = allSchedules
              .filter((schedule) => schedule.day === day)
              .sort((a, b) => a.startTime.localeCompare(b.startTime));

            // Check if this day is today
            const isToday = day === getOrderedDays()[0];

            return (
              <div
                key={day}
                className={`bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg ${
                  isToday ? "ring-2 ring-blue-500 ring-opacity-50" : ""
                }`}
              >
                <div className={`${dayColors[day]} p-4 relative`}>
                  {isToday && (
                    <span className="absolute top-2 right-2 bg-white text-blue-600 text-xs font-bold px-2 py-1 rounded-full">
                      TODAY
                    </span>
                  )}
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <FiCalendar className="mr-2" />
                    {day}
                    {isToday && " (Today)"}
                  </h2>
                </div>
                <div className="p-4">
                  {schedulesForDay.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {schedulesForDay.map((schedule) => (
                        <div
                          key={schedule._id}
                          className={`border-l-4 rounded-lg bg-white p-4 shadow-sm hover:shadow-md transition-shadow ${
                            schedule.isActive === false
                              ? "border-gray-300 opacity-70 bg-gray-50"
                              : "border-blue-500"
                          } ${isToday ? "ring-1 ring-blue-200" : ""}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3
                              className={`text-lg font-bold ${
                                schedule.isActive === false
                                  ? "text-gray-500"
                                  : "text-gray-800"
                              }`}
                            >
                              {schedule.subject?.title}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  schedule.active === false
                                    ? "bg-gray-200 text-gray-600"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {schedule.subject?.type}
                              </span>
                              <button
                                onClick={() => toggleScheduleStatus(schedule)}
                                className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                                  schedule.active === false
                                    ? "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                    : "bg-green-100 text-green-600 hover:bg-green-200"
                                }`}
                                title={
                                  schedule.active === false
                                    ? "Activate class"
                                    : "Deactivate class"
                                }
                              >
                                <FiPower
                                  className={`text-sm ${
                                    schedule.active === false
                                      ? "text-gray-500"
                                      : "text-green-600"
                                  }`}
                                />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div
                              className={`flex items-center ${
                                schedule.active === false
                                  ? "text-gray-400"
                                  : "text-gray-600"
                              }`}
                            >
                              <FiBook
                                className={`mr-2 ${
                                  schedule.active === false
                                    ? "text-gray-400"
                                    : "text-blue-500"
                                }`}
                              />
                              <span>{schedule.subject?.code}</span>
                            </div>

                            <div
                              className={`flex items-center ${
                                schedule.active === false
                                  ? "text-gray-400"
                                  : "text-gray-600"
                              }`}
                            >
                              <FiClock
                                className={`mr-2 ${
                                  schedule.active === false
                                    ? "text-gray-400"
                                    : "text-purple-500"
                                }`}
                              />
                              <span>
                                {formatTime(schedule.startTime)} -{" "}
                                {formatTime(schedule.endTime)}
                              </span>
                            </div>

                            <div
                              className={`flex items-center ${
                                schedule.active === false
                                  ? "text-gray-400"
                                  : "text-gray-600"
                              }`}
                            >
                              <FiMapPin
                                className={`mr-2 ${
                                  schedule.active === false
                                    ? "text-gray-400"
                                    : "text-green-500"
                                }`}
                              />
                              <span>Room: {schedule.room}</span>
                            </div>

                            <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center">
                              <span
                                className={`inline-block text-sm px-3 py-1 rounded-full ${
                                  schedule.active === false
                                    ? "bg-gray-200 text-gray-600"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                Class: {schedule.classId}
                              </span>
                              <span
                                className={`text-xs font-medium px-2 py-1 rounded-full ${
                                  schedule.active === false
                                    ? "bg-red-100 text-red-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {schedule.active === false
                                  ? "Inactive"
                                  : "Active"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <FiCalendar className="mx-auto text-4xl text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">
                        No classes scheduled
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        {isToday ? "No classes today!" : "Enjoy your day off!"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TeacherSchedule;