import React, { useState, useEffect } from "react";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";
import useStroge from "../../stroge/useStroge";
import { useNavigate } from "react-router-dom";

const TeacherHome = () => {
  // Example: Schedule data (later you can fetch from API)
  const [schedules, setSchedules] = useState([]);
  const { user } = useStroge();
  const navigate = useNavigate();

  const AxiosSecure = useAxiosPrivate();
  useEffect(() => {
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    console.log("Today is:", today); // Check today's date
    const teacherName = user.name; // Replace with dynamic value later

    AxiosSecure.get("/api/getallschedule")
      .then((res) => {
        const todaySchedules = [];

        res.data.forEach((item) => {
          const daySchedule = item.schedule?.[today];
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
      })
      .catch((error) => {
        console.error("Error fetching schedules:", error);
      });
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-center text-2xl font-bold mb-6">ToDay Schedule </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {schedules?.length > 0 ? (
          schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="bg-blue-900 shadow-lg rounded-lg p-6 text-white hover:shadow-lg transition"
              onClick={() =>
                navigate(`/teacherDashboard/Class/${schedule.class}`, {
                  state: { schedule },
                })
              }
            >
              <h2 className="text-xl font-semibold mb-2">{schedule.subject}</h2>
              <p className=" mb-1">
                <strong>Time:</strong> {schedule.time}
              </p>
              <p className=" mb-1">
                <strong>Room:</strong> {schedule.room}
              </p>
              <p className="">
                <strong>Class:</strong> {schedule.class}
              </p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 col-span-3">
            No schedules for today.
          </p>
        )}
      </div>
    </div>
  );
};

export default TeacherHome;
