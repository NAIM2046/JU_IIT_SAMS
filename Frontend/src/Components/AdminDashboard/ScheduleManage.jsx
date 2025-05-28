import { useState, useEffect } from "react";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";
import useStroge from "../../stroge/useStroge";

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
  const { fetchClass, classlist, fetchTeacher, teacherList } = useStroge();
  const [selectedClass, setSelectedClass] = useState("6");
  const [subjectsList, setSubjectsList] = useState([]);
  
  useEffect(() => {
    const currentClass = classlist.find((cls) => cls.class === selectedClass);
    setSubjectsList(currentClass?.subjects || []);
  }, [selectedClass, classlist]);

  useEffect(() => {
    fetchClass();
    fetchTeacher();
  }, []);
  console.log("Teacher list:", teacherList); // ⬅️ Add this line

  console.log("Class list:", subjectsList); // ⬅️ Add this line

  const AxoisSecure = useAxiosPrivate();

  useEffect(() => {
    loadScheduleForClass(selectedClass);
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
          updated[day][newTime] = {
            subject: "",
            class: "",
            room: "",
            teacher: "",
          };
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
    console.log("class : " + selectedClass);
    await AxoisSecure.post("/api/addschedule", {
      classNumber: selectedClass,
      timeSlots,
      schedule: scheduleData,
    });
    alert("Schedule saved successfully!");
  };

  const loadScheduleForClass = async (classNumber) => {
    if (!classNumber) return;

    setLoading(true);

    try {
      const res = await AxoisSecure.get(`/api/getschedule/${classNumber}`);
      const data = Array.isArray(res.data) ? res.data[0] : res.data;

      setTimeSlots(Array.isArray(data?.timeSlots) ? data.timeSlots : []);
      setScheduleData(data?.schedule || {});
      // setSelectedClass(data?.classNumber); // track current class ID in state
    } catch (error) {
      console.error("Error fetching schedule for class:", error);
      setTimeSlots([]);
      setScheduleData({});
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Loading schedule...</div>;

  return (
    <div className="p-4">
      <select
        className="mb-4 p-2 border rounded"
        value={selectedClass}
        onChange={(e) => {
          const classNumber = e.target.value;
          setSelectedClass(classNumber);
          loadScheduleForClass(classNumber);
        }}
      >
        <option value="">Select Class</option>
        {classlist.map((cls) => (
          <option key={cls._id} value={cls.class}>
            {cls.class}
          </option>
        ))}
      </select>

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
                  console.log("Cell data:", cell); // ⬅️ Add this line
                  return (
                    <td key={day + slot} className="border px-2 py-1">
                      <select
                        className="w-full mb-1 text-xs p-1 border rounded"
                        value={cell.subject || ""}
                        onChange={(e) =>
                          handleCellChange(day, slot, "subject", e.target.value)
                        }
                      >
                        <option value="">Select Subject</option>
                        {subjectsList.map((subject, idx) => (
                          <option key={idx} value={subject}>
                            {subject}
                          </option>
                        ))}
                      </select>

                      <select
                        className="w-full mb-1 text-xs p-1 border rounded"
                        value={cell.class || ""}
                        onChange={(e) =>
                          handleCellChange(day, slot, "class", e.target.value)
                        }
                      >
                        <option value="">Select Class</option>
                        {classlist.map((cls) => (
                          <option key={cls._id} value={cls.class}>
                            {cls.class}
                          </option>
                        ))}
                      </select>

                      <select
                        className="w-full mb-1 text-xs p-1 border rounded"
                        value={cell.teacher || ""}
                        onChange={(e) =>
                          handleCellChange(day, slot, "teacher", e.target.value)
                        }
                      >
                        <option value="">Select Teacher</option>
                        {teacherList.map((teacher) => (
                          <option key={teacher._id} value={teacher.name}>
                            {teacher.name}
                          </option>
                        ))}
                      </select>

                      <input
                        type="text"
                        className="w-full text-xs p-1 border rounded mt-1"
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
