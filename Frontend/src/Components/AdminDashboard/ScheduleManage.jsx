import React, { useEffect, useState } from "react";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";

const formatTime = (timeStr) => {
  const [hourStr, minuteStr] = timeStr.split(":");
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minuteStr} ${ampm}`;
};

const toMinutes = (timeStr) => {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
};

const isTimeConflict = (newStart, newEnd, exStart, exEnd) => {
  const newStartMinutes = toMinutes(newStart);
  const newEndMinutes = toMinutes(newEnd);
  const exStartMinutes = toMinutes(exStart);
  const exEndMinutes = toMinutes(exEnd);
  return (
    (newStartMinutes < exEndMinutes && newEndMinutes > exStartMinutes) ||
    (exStartMinutes < newEndMinutes && exEndMinutes > newStartMinutes)
  );
};

const ScheduleManage = () => {
  const axiosPrivate = useAxiosPrivate();

  const daylist = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const [RoomList] = useState(["301", "302", "303"]);

  const [loading, setLoading] = useState(false);
  const [classList, setClassList] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [subjectList, setSubjectList] = useState([]);
  const [classSchedule, setclassSchedule] = useState([]);
  const [teacherlist, setTeacherList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const [formData, setFormData] = useState({
    day: "",
    subject: "",
    teacherName: "",
    room: "",
    startTime: "",
    endTime: "",
  });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [classRes, teacherRes, scheduleRes] = await Promise.all([
        axiosPrivate.get("/api/getclassandsub"),
        axiosPrivate.get("/api/auth/getTeacher"),
        axiosPrivate.get("/api/getallschedule"),
      ]);

      setClassList(classRes.data);
      setTeacherList(teacherRes.data);
      setSchedules(scheduleRes.data);

      if (!selectedClass && classRes.data.length > 0) {
        const defaultClassId =
          classRes.data[0]?.classId || classRes.data[0]?.class;
        setSelectedClass(defaultClassId);
      }
    } catch (error) {
      alert("Error loading data");
      console.error(error);
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (!loaded || !selectedClass) return;

    const subjectData =
      classList.find(
        (cls) => selectedClass === cls.classId || selectedClass === cls.class
      )?.subjects || [];
    setSubjectList(subjectData);

    const filteredSchedules = schedules.filter(
      (schedule) => schedule.classId === selectedClass
    );
    setclassSchedule(filteredSchedules);
  }, [selectedClass]);

  const isconflictTime = () => {
    // console.log("Checking time conflict for:", formData);
    // console.log("Current class schedule:", classSchedule);
    const { startTime, endTime } = formData;

    return classSchedule.some((schedule) => {
      return (
        schedule.day === formData.day &&
        schedule._id !== editingId &&
        isTimeConflict(startTime, endTime, schedule.startTime, schedule.endTime)
      );
    });
  };

  const isconflictTeacher = () => {
    const { startTime, endTime, teacherName } = formData;
    return schedules.some((schedule) => {
      return (
        schedule.day === formData.day &&
        schedule.teacherName === teacherName &&
        schedule._id !== editingId &&
        isTimeConflict(startTime, endTime, schedule.startTime, schedule.endTime)
      );
    });
  };

  const isconflictRoom = () => {
    const { startTime, endTime, room } = formData;
    return schedules.some((schedule) => {
      return (
        schedule.day === formData.day &&
        schedule.room === room &&
        schedule._id !== editingId &&
        isTimeConflict(startTime, endTime, schedule.startTime, schedule.endTime)
      );
    });
  };

  const handleSaveSchedule = async () => {
    if (formData.startTime >= formData.endTime) {
      return alert("Start time must be earlier than end time");
    }
    if (isconflictTime()) {
      return alert("Time conflict with existing schedule");
    }
    if (isconflictTeacher()) {
      return alert("Teacher is already scheduled for this time");
    }
    if (isconflictRoom()) {
      return alert("Room is already booked for this time");
    }

    const newSchedule = {
      ...formData,
      classId: selectedClass,
    };

    try {
      if (editingId) {
        const res = await axiosPrivate.put(
          `/api/updateschedule/${editingId}`,
          newSchedule
        );
        if (res.data) {
          alert("Schedule updated successfully");
          setSchedules((prev) =>
            prev.map((item) =>
              item._id === editingId ? res.data.schedule : item
            )
          );
          if (res.data.schedule.classId === selectedClass) {
            setclassSchedule((prev) =>
              prev.map((item) =>
                item._id === editingId ? res.data.schedule : item
              )
            );
          }
        }
      } else {
        const res = await axiosPrivate.post("/api/addSchedule", newSchedule);
        if (res.status === 201 || res.status === 200) {
          alert("Schedule added successfully");
          setSchedules((prev) => [...prev, res.data.schedule]); // res.data should be the new schedule
          if (res.data.schedule.classId === selectedClass) {
            setclassSchedule((prev) => [...prev, res.data.schedule]);
          }
        }
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({
        day: "",
        subject: "",
        teacherName: "",
        room: "",
        startTime: "",
        endTime: "",
      });
    } catch (err) {
      console.error("Error saving schedule:", err);
      alert("Failed to save schedule.");
    }
  };

  const handleDelete = async (_id) => {
    if (!window.confirm("Are you sure you want to delete this schedule?"))
      return;

    try {
      const res = await axiosPrivate.delete(`/api/deleteschedule/${_id}`);
      if (res.status === 200) {
        alert("Schedule deleted");
        setSchedules((prev) => prev.filter((s) => s._id !== _id));
        setclassSchedule((prev) => prev.filter((s) => s._id !== _id));
      }
    } catch (err) {
      console.error("Failed to delete:", err);
      alert("Failed to delete schedule.");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Class Schedule</h1>

      <div className="mb-6">
        <label className="block mb-1 font-semibold">Select Class:</label>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="w-full p-2 border rounded"
        >
          {classList.map((cls) => (
            <option key={cls._id} value={cls.classId || cls.class}>
              {cls.classId || cls.class}
            </option>
          ))}
        </select>
      </div>

      {daylist.map((day) => {
        const schedulesForDay = classSchedule.filter((s) => s.day === day);
        return (
          <div key={day} className="mb-6">
            <h2 className="text-lg font-bold mb-2">{day}</h2>
            <div className="flex flex-wrap gap-4">
              {schedulesForDay.length > 0 ? (
                schedulesForDay.map((schedule) => (
                  <div
                    key={schedule._id}
                    className="border p-4 rounded shadow-md w-64 bg-white relative"
                  >
                    <p className="font-semibold mb-1">
                      {formatTime(schedule.startTime)} –{" "}
                      {formatTime(schedule.endTime)}
                    </p>
                    <p>📘 Subject: {schedule.subject}</p>
                    <p>👨‍🏫 Teacher: {schedule.teacherName}</p>
                    <p>🏫 Room: {schedule.room}</p>

                    <div className="flex gap-3 mt-3">
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => {
                          setFormData({
                            day: schedule.day,
                            subject: schedule.subject,
                            teacherName: schedule.teacherName,
                            room: schedule.room,
                            startTime: schedule.startTime,
                            endTime: schedule.endTime,
                          });
                          setEditingId(schedule._id);
                          setShowModal(true);
                        }}
                      >
                        <AiOutlineEdit size={20} />
                      </button>

                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleDelete(schedule._id)}
                      >
                        <AiOutlineDelete size={20} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No schedule</p>
              )}

              <button
                className="btn btn-info"
                onClick={() => {
                  setFormData({ ...formData, day });
                  setShowModal(true);
                  setEditingId(null);
                }}
              >
                Add Schedule
              </button>
            </div>
          </div>
        );
      })}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? "Edit" : "Add"} Schedule
            </h2>

            <div className="mb-2">
              <label>Day:</label>
              <select
                className="w-full border p-2"
                value={formData.day}
                onChange={(e) =>
                  setFormData({ ...formData, day: e.target.value })
                }
              >
                {daylist.map((day) => (
                  <option key={day}>{day}</option>
                ))}
              </select>
            </div>

            <div className="mb-2">
              <label>Subject:</label>
              <select
                className="w-full border p-2"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
              >
                <option value="" disabled>
                  Select Subject
                </option>
                {subjectList.map((sub, idx) => (
                  <option key={idx}>{sub}</option>
                ))}
              </select>
            </div>

            <div className="mb-2">
              <label>Teacher Name:</label>
              <select
                className="w-full border p-2"
                value={formData.teacherName}
                onChange={(e) =>
                  setFormData({ ...formData, teacherName: e.target.value })
                }
              >
                <option value="" disabled>
                  Select Teacher
                </option>
                {teacherlist.map((teacher) => (
                  <option key={teacher._id} value={teacher.name}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-2">
              <label>Room:</label>
              <select
                className="w-full border p-2"
                value={formData.room}
                onChange={(e) =>
                  setFormData({ ...formData, room: e.target.value })
                }
              >
                <option value="" disabled>
                  Select Room
                </option>
                {RoomList.map((room, idx) => (
                  <option key={idx}>{room}</option>
                ))}
              </select>
            </div>

            <div className="mb-2 flex gap-2">
              <div className="w-1/2">
                <label>Start Time:</label>
                <input
                  type="time"
                  className="w-full border p-2"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                />
              </div>
              <div className="w-1/2">
                <label>End Time:</label>
                <input
                  type="time"
                  className="w-full border p-2"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                className="bg-gray-400 px-4 py-2 rounded"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={handleSaveSchedule}
              >
                {editingId ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleManage;
