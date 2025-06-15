import React, { useState, useEffect } from "react";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";
import useStroge from "../../stroge/useStroge";
import { useNavigate } from "react-router-dom";
import { FiClock, FiBook, FiUsers, FiHome, FiCalendar } from "react-icons/fi";

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
        const teacherName = user.name;
        const res = await AxiosSecure.get("/api/getallschedule");

        const todaySchedules = [];
        res.data.forEach((item) => {
          const daySchedule = item.schedule?.[todayName];
          if (daySchedule) {
            item.timeSlots.forEach((slot) => {
              const slotData = daySchedule[slot];
              if (
                slotData &&
                slotData.teacher?.toLowerCase() === teacherName.toLowerCase()
              ) {
                todaySchedules.push({
                  id: item._id,
                  subject: slotData.subject,
                  class: slotData.class,
                  room: slotData.room,
                  time: slot,
                });
              }
            });
          }
        });

        setSchedules(todaySchedules);
      } catch (error) {
        console.error("Error fetching schedules:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [user.name, todayName, AxiosSecure]);

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
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-gray-100"
                onClick={() =>
                  navigate(`/teacherDashboard/Class/${schedule.class}`, {
                    state: { schedule, formattedDate, teacherName: user.name },
                  })
                }
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-semibold text-gray-800 truncate">
                      {schedule.subject}
                    </h2>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {schedule.class}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <FiClock className="mr-2 text-blue-500" />
                      <span>{schedule.time}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FiHome className="mr-2 text-blue-500" />
                      <span>Room: {schedule.room}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
                  <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                    View Class Details →
                  </button>
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
