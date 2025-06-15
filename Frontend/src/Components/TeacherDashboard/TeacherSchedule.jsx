import React, { useEffect, useState } from "react";
import useStroge from "../../stroge/useStroge";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";
import { FiClock, FiBook, FiHome, FiUser } from "react-icons/fi";
import { FaChalkboardTeacher } from "react-icons/fa";

const TeacherSchedule = () => {
  const [allSchedules, setAllSchedules] = useState([]);
  const [matrixData, setMatrixData] = useState({});
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uniqueClasses, setUniqueClasses] = useState([]);
  const [uniqueSubjects, setUniqueSubjects] = useState([]);
  const { user } = useStroge();
  const AxiosSecure = useAxiosPrivate();
  const teacherName = user.name;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await AxiosSecure.get("/api/getallschedule");
        setAllSchedules(res.data);

        // Extract unique classes and subjects
        const classes = new Set();
        const subjects = new Set();

        res.data.forEach((item) => {
          const days = Object.keys(item.schedule);
          const schedule = item.schedule;

          days.forEach((day) => {
            const timeSlots = Object.keys(schedule[day]);
            timeSlots.forEach((time) => {
              if (schedule[day][time].teacher === user.name) {
                classes.add(schedule[day][time].class);
                subjects.add(schedule[day][time].subject);
              }
            });
          });
        });

        setUniqueClasses(Array.from(classes));
        setUniqueSubjects(Array.from(subjects));
      } catch (error) {
        console.error("Error fetching schedules:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.name, AxiosSecure]);

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
        tempMatrix[day] = {};
        allSchedules.forEach((classItem) => {
          const daySchedule = classItem.schedule[day];

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

      const sortedTimeSlots = Array.from(timeSlotSet).sort((a, b) =>
        a.localeCompare(b)
      );
      setTimeSlots(sortedTimeSlots);
      setMatrixData(tempMatrix);
    }
  }, [allSchedules, teacherName]);

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
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
            <FaChalkboardTeacher className="mr-3 text-blue-600" />
            Teaching Schedule
          </h1>
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="bg-white p-3 rounded-lg shadow-sm flex items-center">
              <FiUser className="text-blue-500 mr-2" />
              <span className="font-medium">Teacher: </span>
              <span className="ml-1">{teacherName}</span>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <span className="font-medium">Classes: </span>
              {uniqueClasses.join(", ") || "None"}
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <span className="font-medium">Subjects: </span>
              {uniqueSubjects.join(", ") || "None"}
            </div>
          </div>
        </div>

        {/* Schedule Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="p-4 text-left min-w-[120px]">Day / Time</th>
                  {timeSlots.map((time, idx) => (
                    <th key={idx} className="p-4 text-center min-w-[150px]">
                      <div className="flex items-center justify-center">
                        <FiClock className="mr-2" />
                        {time}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Object.entries(matrixData).map(([day, times]) => (
                  <tr key={day} className="hover:bg-gray-50">
                    <td className="p-4 font-bold text-gray-700">{day}</td>
                    {timeSlots.map((time) => (
                      <td key={time} className="p-4">
                        {times[time] ? (
                          <div className="bg-blue-50 rounded-lg p-3 h-full">
                            <div className="font-semibold text-blue-700 flex items-center">
                              <FiBook className="mr-2" />
                              {times[time].subject}
                            </div>
                            <div className="text-sm text-gray-600 mt-1 flex items-center">
                              <FiHome className="mr-2" />
                              Class {times[time].classNumber} • Room{" "}
                              {times[time].room}
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-400 text-center font-bold">
                            ------
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-3">
          <div className="flex items-center text-sm">
            <div className="w-4 h-4 bg-blue-600 rounded mr-2"></div>
            <span>Time Slot</span>
          </div>
          <div className="flex items-center text-sm">
            <div className="w-4 h-4 bg-blue-50 rounded mr-2"></div>
            <span>Your Class</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherSchedule;
