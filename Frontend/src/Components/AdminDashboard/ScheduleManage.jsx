import React, { useEffect, useState } from "react";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";
import { AiOutlineEdit, AiOutlineDelete, AiOutlinePlus } from "react-icons/ai";
import { FiClock, FiBook, FiUser, FiHome } from "react-icons/fi";

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
  console.log("Checking conflict:", {
    newStart,
    newEnd,
    exStart,
    exEnd,
  });
  return (
    (newStartMinutes < exEndMinutes && newEndMinutes > exStartMinutes) ||
    (exStartMinutes < newEndMinutes && exEndMinutes > newStartMinutes)
  );
};

// Skeleton Loader Components
const ScheduleCardSkeleton = () => (
  <div className="border border-gray-200 rounded-xl p-5 bg-white animate-pulse">
    <div className="absolute top-4 right-4 flex gap-2">
      <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
      <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
    </div>
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
        <div className="p-2 bg-gray-200 rounded-full">
          <div className="w-5 h-5"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </div>
      <div className="flex items-start gap-3">
        <div className="p-2 bg-gray-200 rounded-full mt-1">
          <div className="w-5 h-5"></div>
        </div>
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-200 rounded-full">
          <div className="w-5 h-5"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-200 rounded-full">
          <div className="w-5 h-5"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  </div>
);

const DaySectionSkeleton = () => (
  <div className="mb-8">
    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
      <div className="flex items-center">
        <div className="w-2 h-8 bg-gray-300 rounded-full mr-3"></div>
        <div className="h-6 bg-gray-300 rounded w-24"></div>
      </div>
      <div className="w-32 h-10 bg-gray-200 rounded-lg"></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(3)].map((_, index) => (
        <ScheduleCardSkeleton key={index} />
      ))}
    </div>
  </div>
);

const LoadingSpinner = ({ size = "medium" }) => {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12",
  };

  return (
    <div
      className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`}
    ></div>
  );
};

const ScheduleManage = () => {
  const axiosPrivate = useAxiosPrivate();

  const daylist = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const [RoomList] = useState(["Lab1", "Lab2", "Lab3", "Lab4", "LabD"]);

  const [loading, setLoading] = useState(false);
  const [classList, setClassList] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [subjectList, setSubjectList] = useState([{}]);
  const [classSchedule, setclassSchedule] = useState([]);
  const [teacherlist, setTeacherList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [batchNumber, setBatchNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    day: "",
    subject: "",
    teacherName: "",
    teacherId: "",
    room: "",
    startTime: "",
    endTime: "",
    active: true,
  });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [classRes, teacherRes, scheduleRes] = await Promise.all([
        axiosPrivate.get("/api/getclassandsub"),
        axiosPrivate.get("/api/auth/getTeacher"),
        axiosPrivate.get("/api/getallschedule"),
      ]);
      const filteredTeachers = teacherRes.data.filter((t) => t.active === true);
      setClassList(classRes.data);
      setTeacherList(filteredTeachers);
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
      classList.find((cls) => selectedClass === cls.class) || [];
    console.log("subject filter", subjectData);
    console.log("classList", classList);
    setSubjectList(subjectData?.subjects);
    setBatchNumber(subjectData?.batchNumber);

    const filteredSchedules = schedules.filter(
      (schedule) => schedule.classId === selectedClass
    );
    setclassSchedule(filteredSchedules);
  }, [selectedClass]);

  const isconflictTime = () => {
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
    if (!batchNumber) {
      return alert("this semester do not assented any batch");
    }

    setSaving(true);
    const newSchedule = {
      ...formData,
      classId: selectedClass,
      batchNumber: batchNumber,
      subject: JSON.parse(formData.subject),
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
          setSchedules((prev) => [...prev, res.data.schedule]);
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
        teacherId: "",
        room: "",
        startTime: "",
        endTime: "",
        active: true,
      });
    } catch (err) {
      console.error("Error saving schedule:", err);
      alert("Failed to save schedule.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (_id) => {
    if (!window.confirm("Are you sure you want to delete this schedule?"))
      return;

    setDeletingId(_id);
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
    } finally {
      setDeletingId(null);
    }
  };

  // Main loading state
  if (loading && !loaded) {
    return (
      <div className="max-w-7xl mx-auto bg-gray-50 min-h-screen p-6">
        <div className="bg-white rounded-lg p-6">
          {/* Header Skeleton */}
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div className="w-full md:w-64">
                <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
            {/* Day sections skeleton */}
            {[...Array(7)].map((_, index) => (
              <DaySectionSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Class Schedule Management
        </h1>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="w-full md:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              disabled={loading}
            >
              {classList.map((cls) => (
                <option key={cls._id} value={cls.classId || cls.class}>
                  {cls.classId || cls.class}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          // Loading state for class schedule
          <div className="animate-pulse">
            {[...Array(7)].map((_, index) => (
              <DaySectionSkeleton key={index} />
            ))}
          </div>
        ) : (
          // Actual content
          daylist.map((day) => {
            const schedulesForDay = classSchedule
              .filter((s) => s.day === day)
              .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));

            return (
              <div key={day} className="mb-8">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <div className="w-2 h-8 bg-blue-600 rounded-full mr-3"></div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {day}
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setFormData({ ...formData, day });
                      setShowModal(true);
                      setEditingId(null);
                    }}
                    disabled={loading}
                    className="flex items-center gap-2 text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <AiOutlinePlus size={16} className="stroke-[3]" />
                    <span>Add Schedule</span>
                  </button>
                </div>

                {schedulesForDay.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {schedulesForDay.map((schedule) => (
                      <div
                        key={schedule._id}
                        className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200 bg-white relative group"
                      >
                        {/* Loading overlay for delete */}
                        {deletingId === schedule._id && (
                          <div className="absolute inset-0 bg-white bg-opacity-80 rounded-xl flex items-center justify-center z-10">
                            <div className="flex items-center gap-2 text-blue-600">
                              <LoadingSpinner size="small" />
                              <span className="text-sm font-medium">
                                Deleting...
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Action buttons with fade-in effect */}
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => {
                              setFormData({
                                day: schedule.day,
                                subject: JSON.stringify(schedule.subject),
                                teacherName: schedule.teacherName,
                                teacherId: schedule.teacherId,
                                room: schedule.room,
                                startTime: schedule.startTime,
                                endTime: schedule.endTime,
                                active: true,
                              });
                              setEditingId(schedule._id);
                              setShowModal(true);
                            }}
                            className="p-2 rounded-lg bg-white shadow-sm hover:bg-blue-50 text-blue-600 hover:text-blue-700 transition-colors"
                            aria-label="Edit"
                            title="Edit"
                            disabled={deletingId === schedule._id}
                          >
                            <AiOutlineEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(schedule._id)}
                            className="p-2 rounded-lg bg-white shadow-sm hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors"
                            aria-label="Delete"
                            title="Delete"
                            disabled={deletingId === schedule._id}
                          >
                            <AiOutlineDelete size={18} />
                          </button>
                        </div>

                        {/* Card content */}
                        <div className="space-y-4">
                          {/* Time section */}
                          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                            <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                              <FiClock size={18} />
                            </div>
                            <span className="font-medium text-gray-800">
                              {formatTime(schedule.startTime)} -{" "}
                              {formatTime(schedule.endTime)}
                            </span>
                          </div>

                          {/* Subject section */}
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-green-100 rounded-full text-green-600 mt-1">
                              <FiBook size={18} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-800">
                                {schedule.subject.title}
                              </h3>
                              <p className="text-sm text-gray-500">
                                Code: {schedule.subject.code}
                              </p>
                              <p>{schedule.batchNumber}</p>
                            </div>
                          </div>

                          {/* Teacher section */}
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-full text-purple-600">
                              <FiUser size={18} />
                            </div>
                            <span className="text-gray-700">
                              {schedule.teacherName}
                            </span>
                          </div>

                          {/* Room section */}
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 rounded-full text-orange-600">
                              <FiHome size={18} />
                            </div>
                            <span className="text-gray-700">
                              {schedule.room}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No schedules for this day</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="border-b px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingId ? "Edit Schedule" : "Add New Schedule"}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Day
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.day}
                  onChange={(e) =>
                    setFormData({ ...formData, day: e.target.value })
                  }
                  disabled={saving}
                >
                  <option value="">Select Day</option>
                  {daylist.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.subject}
                  onChange={(e) => {
                    setFormData({ ...formData, subject: e.target.value });
                    const filterTecher = classSchedule.find(
                      (sch) =>
                        sch.subject &&
                        JSON.stringify(sch.subject) === e.target.value
                    );
                    if (filterTecher) {
                      setFormData((prev) => ({
                        ...prev,
                        teacherName: filterTecher.teacherName,
                        teacherId: filterTecher.teacherId,
                      }));
                    }
                  }}
                  disabled={saving}
                >
                  <option value="" disabled>
                    Select Subject
                  </option>
                  {subjectList.map((sub, idx) => (
                    <option key={idx} value={JSON.stringify(sub)}>
                      {sub.title} ({sub.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teacher
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.teacherId}
                  onChange={(e) => {
                    const selectedTeacher = teacherlist.find(
                      (t) => t._id === e.target.value
                    );
                    setFormData({
                      ...formData,
                      teacherName: selectedTeacher.name,
                      teacherId: selectedTeacher._id,
                    });
                  }}
                  disabled={saving}
                >
                  <option value="" disabled>
                    Select Teacher
                  </option>
                  {teacherlist.map((teacher) => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.room}
                  onChange={(e) =>
                    setFormData({ ...formData, room: e.target.value })
                  }
                  disabled={saving}
                >
                  <option value="" disabled>
                    Select Room
                  </option>
                  {RoomList.map((room, idx) => (
                    <option key={idx} value={room}>
                      {room}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    disabled={saving}
                  />
                </div>
              </div>
            </div>

            <div className="border-t px-6 py-4 flex justify-end gap-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                onClick={() => setShowModal(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-20 flex items-center justify-center"
                onClick={handleSaveSchedule}
                disabled={saving}
              >
                {saving ? (
                  <LoadingSpinner size="small" />
                ) : editingId ? (
                  "Update"
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleManage;
