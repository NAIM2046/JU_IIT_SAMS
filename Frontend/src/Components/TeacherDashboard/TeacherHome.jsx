import React, { useState, useEffect } from "react";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";
import useStroge from "../../stroge/useStroge";
import { useNavigate } from "react-router-dom";
import {
  FiClock,
  FiBook,
  FiUsers,
  FiHome,
  FiCalendar,
  FiXCircle,
} from "react-icons/fi";

const formatTime = (timeStr) => {
  const [hourStr, minuteStr] = timeStr.split(":");
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minuteStr} ${ampm}`;
};

const TeacherHome = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useStroge();
  const navigate = useNavigate();

  const date = new Date();
  const formattedDate = `${String(date.getDate()).padStart(2, "0")}${String(
    date.getMonth() + 1
  ).padStart(2, "0")}${date.getFullYear()}`;

  const todayName = date.toLocaleDateString("en-US", { weekday: "long" });
  const todayDateStr = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const AxiosSecure = useAxiosPrivate();

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const teacherId = user._id;
        const res = await AxiosSecure.get("/api/getallschedule");

        const todaySchedules = [];
        console.log("Fetched schedules:", res.data);
        console.log("user", user);
        res.data.forEach((schedule) => {
          if (schedule.teacherId === teacherId && schedule.day === todayName) {
            todaySchedules.push(schedule);
          }
        });
        console.log("Today's schedules:", todaySchedules);

        setSchedules(todaySchedules);
      } catch (error) {
        console.error("Error fetching schedules:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [user.name, todayName, AxiosSecure]);
  console.log("Schedules for today:", schedules);
  console.log(user);

  const handleCardClick = (schedule) => {
    if (!schedule.active) {
      return; // Don't navigate if schedule is inactive
    }

    navigate(`/teacherDashboard/Class/${schedule.classId}`, {
      state: {
        schedule: {
          classId: schedule.classId,
          subject: schedule.subject.code,
          type: schedule.subject.type,
          teacherId: schedule.teacherId,
          teacherName: schedule.teacherName,
          subjectName: schedule.subject.title,
        },
        formattedDate,
        teacherName: user.name,
        batchNumber: schedule.batchNumber,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Today's Schedule
          </h1>
          <div className="flex items-center text-gray-600">
            <FiCalendar className="mr-2" />
            <span>{todayDateStr}</span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : schedules?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {schedules.map((schedule, index) => (
              <div
                key={index}
                className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 transform ${
                  schedule.active
                    ? "hover:shadow-lg hover:-translate-y-1 cursor-pointer border border-blue-500"
                    : "cursor-not-allowed opacity-70 border border-gray-300"
                }`}
                onClick={() => handleCardClick(schedule)}
              >
                <div className="p-6">
                  {/* Status Badge */}
                  {!schedule.active && (
                    <div className="flex items-center justify-end mb-2">
                      <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
                        <FiXCircle className="mr-1" />
                        Inactive
                      </span>
                    </div>
                  )}

                  <div className="justify-between items-start mb-4">
                    <h2
                      className={`text-xl font-semibold truncate ${
                        schedule.active ? "text-gray-800" : "text-gray-500"
                      }`}
                    >
                      {schedule.subject.title}
                    </h2>
                    <p
                      className={
                        schedule.active ? "text-gray-600" : "text-gray-400"
                      }
                    >
                      {schedule.subject.code}
                    </p>
                    <span
                      className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                        schedule.active
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {schedule.classId}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div
                      className={`flex items-center ${
                        schedule.active ? "text-gray-600" : "text-gray-400"
                      }`}
                    >
                      <FiClock
                        className={`mr-2 ${
                          schedule.active ? "text-blue-500" : "text-gray-400"
                        }`}
                      />
                      <span className="font-semibold mb-1">
                        {formatTime(schedule.startTime)} –{" "}
                        {formatTime(schedule.endTime)}
                      </span>
                    </div>
                    <div
                      className={`flex items-center ${
                        schedule.active ? "text-gray-600" : "text-gray-400"
                      }`}
                    >
                      <FiHome
                        className={`mr-2 ${
                          schedule.active ? "text-blue-500" : "text-gray-400"
                        }`}
                      />
                      <span>Room: {schedule.room}</span>
                    </div>
                  </div>
                </div>
                <div
                  className={`px-6 py-3 border-t ${
                    schedule.active
                      ? "bg-gray-50 border-gray-100"
                      : "bg-gray-100 border-gray-200"
                  }`}
                >
                  {schedule.active ? (
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                      View Class Details →
                    </button>
                  ) : (
                    <button className="text-gray-500 font-medium text-sm cursor-not-allowed">
                      Class Inactive
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FiBook className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              No classes scheduled for today
            </h3>
            <p className="text-gray-500">
              You don't have any classes scheduled for {todayName}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherHome;
