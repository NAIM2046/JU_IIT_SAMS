import { useState, useEffect } from "react";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const ScheduleManage = () => {
  const [scheduleData, setScheduleData] = useState({});
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const AxoisSecure = useAxiosPrivate();

  useEffect(() => {
    AxoisSecure.get("/api/getschedule")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data[0] : res.data;
        console.log("Fetched schedule:", data);

        setTimeSlots(Array.isArray(data.timeSlots) ? data.timeSlots : []);
        setScheduleData(data.schedule || {});
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleCellChange = (day, time, field, value) => {
    setScheduleData((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [time]: {
          ...prev[day]?.[time],
          [field]: value,
        },
      },
    }));
  };

  const addTimeSlot = () => {
    const newTime = prompt("Enter new time slot (e.g., 12:00-13:00):");
    if (newTime) {
      setTimeSlots((prevSlots) => [...prevSlots, newTime]);

      setScheduleData((prev) => {
        const updated = { ...prev };
        days.forEach((day) => {
          if (!updated[day]) updated[day] = {};
          updated[day][newTime] = { subject: "", class: "", room: "" };
        });
        return updated;
      });
    }
  };

  const editTimeSlot = (oldTime) => {
    const newTime = prompt("Edit time slot:", oldTime);
    if (!newTime || newTime === oldTime || timeSlots.includes(newTime)) return;

    // Step 1: Update timeSlots
    setTimeSlots((prev) =>
      prev.map((slot) => (slot === oldTime ? newTime : slot))
    );

    // Step 2: Migrate data for all days
    setScheduleData((prev) => {
      const updated = { ...prev };
      days.forEach((day) => {
        const dayData = updated[day] || {};
        const cellData = dayData[oldTime];

        if (cellData) {
          // Copy old data to new time
          dayData[newTime] = { ...cellData };
          delete dayData[oldTime]; // Remove old time
        }

        updated[day] = { ...dayData };
      });
      return updated;
    });
  };

  const deleteTimeSlot = (time) => {
    if (!confirm(`Delete time slot ${time}?`)) return;

    setTimeSlots((prev) => prev.filter((slot) => slot !== time));

    setScheduleData((prev) => {
      const updated = { ...prev };
      days.forEach((day) => {
        if (updated[day]) {
          delete updated[day][time];
        }
      });
      return updated;
    });
  };

  const saveSchedule = async () => {
    await AxoisSecure.post("/api/addschedule", {
      timeSlots,
      schedule: scheduleData,
    });
    alert("Schedule saved successfully!");
  };

  if (loading) return <div className="p-4">Loading schedule...</div>;

  return (
    <div className="p-4">
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr>
              <th className="border px-2 py-1">Time</th>
              {days.map((day) => (
                <th key={day} className="border px-2 py-1">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((slot) => (
              <tr key={slot}>
                <td className="border px-2 py-1 align-top">
                  <div className="flex flex-col items-start gap-1">
                    <span>{slot}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => editTimeSlot(slot)}
                        className="text-xs bg-yellow-500 text-white px-2 py-0.5 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteTimeSlot(slot)}
                        className="text-xs bg-red-500 text-white px-2 py-0.5 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </td>
                {days.map((day) => {
                  const cell = scheduleData[day]?.[slot] || {};
                  return (
                    <td key={day + slot} className="border px-2 py-1">
                      <input
                        type="text"
                        className="w-full mb-1 text-xs p-1 border rounded"
                        placeholder="Subject"
                        value={cell.subject || ""}
                        onChange={(e) =>
                          handleCellChange(day, slot, "subject", e.target.value)
                        }
                      />
                      <input
                        type="text"
                        className="w-full mb-1 text-xs p-1 border  rounded focus:border-red-600"
                        placeholder="Class"
                        value={cell.class || ""}
                        onChange={(e) =>
                          handleCellChange(day, slot, "class", e.target.value)
                        }
                      />
                      <input
                        type="text"
                        className="w-full text-xs p-1 border rounded"
                        placeholder="Room"
                        value={cell.room || ""}
                        onChange={(e) =>
                          handleCellChange(day, slot, "room", e.target.value)
                        }
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={addTimeSlot}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          Add Time Slot
        </button>
        <button
          onClick={saveSchedule}
          className="bg-green-600 text-white px-3 py-1 rounded"
        >
          Save Schedule
        </button>
      </div>
    </div>
  );
};

export default ScheduleManage;
