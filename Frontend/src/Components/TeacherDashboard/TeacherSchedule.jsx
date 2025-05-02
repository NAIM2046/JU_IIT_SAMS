import React, { useEffect, useState } from "react";
import useStroge from "../../stroge/useStroge";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";

const TeacherSchedule = () => {
  const [allSchedules, setAllSchedules] = useState([]);
  const [matrixData, setMatrixData] = useState({});
  const [timeSlots, setTimeSlots] = useState([]);
  const { user } = useStroge();
  const AxiosSecure = useAxiosPrivate();
  const teacherName = user.name; // Set your teacher name
  console.log(user);
  useEffect(() => {
    // Simulated API data
    AxiosSecure.get("/api/getallschedule")
      .then((res) => {
        console.log(res.data);
        setAllSchedules(res.data);
      })
      .catch((error) => {
        console.error("Error fetching schedules:", error);
      });
  }, []);

  useEffect(() => {
    if (allSchedules.length > 0) {
      const days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];
      const timeSlotSet = new Set();

      const tempMatrix = {};

      days.forEach((day) => {
        tempMatrix[day] = {}; // Initialize day
        allSchedules.forEach((classItem) => {
          const { classNumber, schedule } = classItem;
          const daySchedule = schedule[day];

          if (daySchedule) {
            Object.entries(daySchedule).forEach(([time, slot]) => {
              timeSlotSet.add(time);

              if (slot?.teacher === teacherName) {
                tempMatrix[day][time] = {
                  subject: slot.subject,
                  classNumber: slot.class,
                  room: slot.room,
                };
              }
            });
          }
        });
      });

      const sortedTimeSlots = Array.from(timeSlotSet).sort((a, b) => {
        // You can improve sorting if needed
        return a.localeCompare(b);
      });

      setTimeSlots(sortedTimeSlots);
      setMatrixData(tempMatrix);
    }
  }, [allSchedules]);

  return (
    <div className="p-4">
      <h1 className="text-center text-2xl font-bold mb-6">
        Teacher Schedule Matrix
      </h1>

      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse border border-gray-300 text-center">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="border border-gray-300 p-2">Day / Time</th>
              {timeSlots.map((time, idx) => (
                <th key={idx} className="border border-gray-300 p-2">
                  {time}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(matrixData).map(([day, times]) => (
              <tr key={day} className="hover:bg-gray-100">
                <td className="border border-gray-300 p-2 font-bold">{day}</td>
                {timeSlots.map((time) => (
                  <td key={time} className="border border-gray-300 p-2">
                    {times[time] ? (
                      <div>
                        <div className="font-semibold">
                          {times[time].subject}
                        </div>
                        <div className="text-sm">
                          Class {times[time].classNumber}
                        </div>
                        <div className="text-sm">Room {times[time].room}</div>
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeacherSchedule;
