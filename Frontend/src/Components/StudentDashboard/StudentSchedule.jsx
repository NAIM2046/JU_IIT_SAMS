import React, { useState } from "react";
import { useEffect } from "react";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";
import useStroge from "../../stroge/useStroge";

const StudentSchedule = () => {
  const AxiosSecure = useAxiosPrivate();
  const [scheduleData, setScheduleData] = useState({});
  const { user } = useStroge();

  useEffect(() => {
    AxiosSecure.get(`/api/getschedule/${user.class}`)
      .then((response) => {
        console.log("Schedule data:", response.data);
        setScheduleData(response.data[0]);
      })
      .catch((error) => {
        console.error("Failed to fetch schedule:", error);
      });
  }, []);

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">
        Class {scheduleData.classNumber} Schedule
      </h2>
      <div className="overflow-auto">
        <table className="min-w-full border border-gray-300 text-sm text-center">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">Day</th>
              {scheduleData?.timeSlots?.map((slot, index) => (
                <th key={index} className="border border-gray-300 px-4 py-2">
                  {slot}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {daysOfWeek.map((day) => (
              <tr key={day}>
                <td className="border border-gray-300 px-4 py-2 font-semibold">
                  {day}
                </td>
                {scheduleData?.timeSlots?.map((slot, idx) => {
                  const entry = scheduleData?.schedule[day]?.[slot];
                  return (
                    <td key={idx} className="border border-gray-300 px-4 py-2">
                      {entry.subject ? (
                        <>
                          <div className="font-medium">{entry.subject}</div>
                          <div className="text-xs">Room: {entry.room}</div>
                          <div className="text-xs text-gray-500">
                            {entry.teacher}
                          </div>
                        </>
                      ) : (
                        "----"
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentSchedule;
