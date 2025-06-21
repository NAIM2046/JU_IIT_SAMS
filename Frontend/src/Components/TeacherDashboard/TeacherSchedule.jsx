import React, { useEffect, useState } from "react";
import useStroge from "../../stroge/useStroge";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";
import { FiClock, FiBook, FiMapPin, FiCalendar } from "react-icons/fi";

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

const TeacherSchedule = () => {
  const [allSchedules, setAllSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useStroge();
  const AxiosSecure = useAxiosPrivate();
  const teacherName = user.name;

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          My Teaching Schedule
        </h1>
        <p className="text-gray-600 mb-8">
          Welcome, {teacherName}. Here's your weekly schedule.
        </p>

        <div className="space-y-8">
          {days.map((day) => {
            const schedulesForDay = allSchedules
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
                          <div className="flex items-center text-gray-600">
                            <FiBook className="mr-2" />
                            <span> class: {schedule.classId}</span>
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
  );
};

export default TeacherSchedule;
