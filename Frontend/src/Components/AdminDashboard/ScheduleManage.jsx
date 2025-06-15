import { useState, useEffect } from "react";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";
import { toast } from "react-toastify";
import { FiEdit2, FiTrash2, FiPlus, FiSave, FiClock } from "react-icons/fi";
import { FaChalkboardTeacher, FaSchool, FaBook } from "react-icons/fa";

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
  const axiosPrivate = useAxiosPrivate();
  const [scheduleData, setScheduleData] = useState({});
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teacherList, setTeacherList] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [subjectsList, setSubjectsList] = useState([]);
  const [classlist, setClassList] = useState([]);
  const [isAddingTimeSlot, setIsAddingTimeSlot] = useState(false);
  const [newTimeSlot, setNewTimeSlot] = useState("");

  useEffect(() => {
    fetchTeachers();
    fetchClass();
  }, []);

  useEffect(() => {
    if (selectedClass && classlist.length > 0) {
      loadScheduleForClass(selectedClass);
      const currentClass = classlist.find((cls) => cls.class === selectedClass);
      setSubjectsList(currentClass?.subjects || []);
    }
  }, [selectedClass, classlist]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await axiosPrivate.get("/api/auth/getTeacher");
      setTeacherList(res.data);
    } catch (error) {
      toast.error("Failed to fetch teachers");
      console.error("Error fetching teachers:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClass = async () => {
    try {
      setLoading(true);
      const response = await axiosPrivate.get("/api/getclassandsub");
      setClassList(response.data);
      if (response.data.length > 0) {
        setSelectedClass(response.data[0].class);
      }
    } catch (error) {
      toast.error("Failed to fetch classes");
      console.error("Error fetching class data:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleAddTimeSlot = () => {
    if (!newTimeSlot) {
      toast.error("Please enter a time slot");
      return;
    }

    if (timeSlots.includes(newTimeSlot)) {
      toast.error("This time slot already exists");
      return;
    }

    setTimeSlots((prevSlots) => [...prevSlots, newTimeSlot].sort());

    setScheduleData((prev) => {
      const updated = { ...prev };
      days.forEach((day) => {
        if (!updated[day]) updated[day] = {};
        updated[day][newTimeSlot] = {
          subject: "",
          class: selectedClass,
          room: "",
          teacher: "",
        };
      });
      return updated;
    });

    setNewTimeSlot("");
    setIsAddingTimeSlot(false);
    toast.success("Time slot added successfully");
  };

  const editTimeSlot = (oldTime) => {
    const newTime = prompt("Edit time slot:", oldTime);
    if (!newTime || newTime === oldTime) return;

    if (timeSlots.includes(newTime)) {
      toast.error("This time slot already exists");
      return;
    }

    setTimeSlots((prev) =>
      prev.map((slot) => (slot === oldTime ? newTime : slot)).sort()
    );

    setScheduleData((prev) => {
      const updated = { ...prev };
      days.forEach((day) => {
        const dayData = updated[day] || {};
        const cellData = dayData[oldTime];

        if (cellData) {
          dayData[newTime] = { ...cellData };
          delete dayData[oldTime];
        }

        updated[day] = { ...dayData };
      });
      return updated;
    });

    toast.success("Time slot updated successfully");
  };

  const deleteTimeSlot = (time) => {
    if (!confirm(`Are you sure you want to delete the time slot ${time}?`))
      return;

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

    toast.success("Time slot deleted successfully");
  };

  const saveSchedule = async () => {
    if (!selectedClass) {
      toast.error("Please select a class first");
      return;
    }

    try {
      setLoading(true);
      await axiosPrivate.post("/api/addschedule", {
        classNumber: selectedClass,
        timeSlots,
        schedule: scheduleData,
      });
      toast.success("Schedule saved successfully!");
    } catch (error) {
      toast.error("Failed to save schedule");
      console.error("Error saving schedule:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadScheduleForClass = async (classNumber) => {
    if (!classNumber) return;

    setLoading(true);

    try {
      const res = await axiosPrivate.get(`/api/getschedule/${classNumber}`);
      const data = Array.isArray(res.data) ? res.data[0] : res.data;

      setTimeSlots(Array.isArray(data?.timeSlots) ? data.timeSlots : []);
      setScheduleData(data?.schedule || {});
    } catch (error) {
      console.error("Error fetching schedule for class:", error);
      setTimeSlots([]);
      setScheduleData({});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Schedule Management
        </h1>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="w-full md:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Class
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              disabled={loading}
            >
              {classlist.map((cls) => (
                <option key={cls._id} value={cls.class}>
                  Class {cls.class}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-2">
            {!isAddingTimeSlot ? (
              <button
                onClick={() => setIsAddingTimeSlot(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={loading || !selectedClass}
              >
                <FiPlus /> Add Time Slot
              </button>
            ) : (
              <div className="flex items-end gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Time Slot
                  </label>
                  <input
                    type="text"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 09:00-10:00"
                    value={newTimeSlot}
                    onChange={(e) => setNewTimeSlot(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleAddTimeSlot}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <FiPlus /> Add
                </button>
                <button
                  onClick={() => {
                    setIsAddingTimeSlot(false);
                    setNewTimeSlot("");
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Slots
                  </th>
                  {days.map((day) => (
                    <th
                      key={day}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {timeSlots.length > 0 ? (
                  timeSlots.map((slot) => (
                    <tr key={slot} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FiClock className="mr-2 text-blue-500" />
                          <span className="font-medium">{slot}</span>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => editTimeSlot(slot)}
                            className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-200"
                          >
                            <FiEdit2 size={12} /> Edit
                          </button>
                          <button
                            onClick={() => deleteTimeSlot(slot)}
                            className="flex items-center gap-1 text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200"
                          >
                            <FiTrash2 size={12} /> Delete
                          </button>
                        </div>
                      </td>
                      {days.map((day) => {
                        const cell = scheduleData[day]?.[slot] || {};
                        return (
                          <td key={day + slot} className="px-6 py-4">
                            <div className="space-y-2">
                              <div>
                                <label className="block text-xs text-gray-500 mb-1 flex items-center">
                                  <FaBook className="mr-1" /> Subject
                                </label>
                                <select
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  value={cell.subject || ""}
                                  onChange={(e) =>
                                    handleCellChange(
                                      day,
                                      slot,
                                      "subject",
                                      e.target.value
                                    )
                                  }
                                >
                                  <option value="">Select Subject</option>
                                  {subjectsList.map((subject, idx) => (
                                    <option key={idx} value={subject}>
                                      {subject}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-xs text-gray-500 mb-1 flex items-center">
                                  <FaChalkboardTeacher className="mr-1" />{" "}
                                  Teacher
                                </label>
                                <select
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  value={cell.teacher || ""}
                                  onChange={(e) =>
                                    handleCellChange(
                                      day,
                                      slot,
                                      "teacher",
                                      e.target.value
                                    )
                                  }
                                >
                                  <option value="">Select Teacher</option>
                                  {teacherList.map((teacher) => (
                                    <option
                                      key={teacher._id}
                                      value={teacher.name}
                                    >
                                      {teacher.name}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-xs text-gray-500 mb-1 flex items-center">
                                  <FaSchool className="mr-1" /> Room
                                </label>
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="Room number"
                                  value={cell.room || ""}
                                  onChange={(e) =>
                                    handleCellChange(
                                      day,
                                      slot,
                                      "room",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No time slots available. Add a time slot to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={saveSchedule}
            disabled={loading || timeSlots.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          >
            <FiSave /> Save Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleManage;
