import React from "react";
import useStroge from "../../stroge/useStroge";
import { useState } from "react";
import { useEffect } from "react";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";
import {
  FaCalendarAlt,
  FaClock,
  FaUserTie,
  FaMapMarkerAlt,
  FaBook,
  FaLaptop,
  FaChalkboardTeacher,
  FaFilter,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

const StudentSchedule = () => {
  const { user } = useStroge();
  const [schedules, setSchedules] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [selectedDay, setSelectedDay] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [expandedDays, setExpandedDays] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const classNumber = user?.class;
  const axiosPrivate = useAxiosPrivate();

  // Convert 24-hour time to 12-hour format
  const convertTo12Hour = (time24) => {
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Get unique days and types for filters
  const days = ["All", ...new Set(schedules.map((item) => item.day))];
  const types = ["All", ...new Set(schedules.map((item) => item.subject.type))];

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await axiosPrivate.get("/api/getallschedule");
        const classSchedules = res.data.filter(
          (schedule) => schedule.classId === classNumber
        );
        setSchedules(classSchedules);
        setFilteredSchedules(classSchedules);
      } catch (error) {
        console.error("Error fetching schedules:", error);
      }
    };
    fetchSchedules();
  }, [classNumber, axiosPrivate]);

  // Filter schedules based on selected day and type
  useEffect(() => {
    let filtered = schedules;

    if (selectedDay !== "All") {
      filtered = filtered.filter((schedule) => schedule.day === selectedDay);
    }

    if (selectedType !== "All") {
      filtered = filtered.filter(
        (schedule) => schedule.subject.type === selectedType
      );
    }

    setFilteredSchedules(filtered);
  }, [selectedDay, selectedType, schedules]);

  // Group schedules by day
  const schedulesByDay = filteredSchedules.reduce((acc, schedule) => {
    if (!acc[schedule.day]) {
      acc[schedule.day] = [];
    }
    acc[schedule.day].push(schedule);
    return acc;
  }, {});

  // Sort days in order
  const dayOrder = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const sortedDays = Object.keys(schedulesByDay).sort(
    (a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b)
  );

  // Toggle day expansion for mobile
  const toggleDayExpansion = (day) => {
    setExpandedDays((prev) => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  // Function to get subject icon based on type
  const getSubjectIcon = (type) => {
    switch (type) {
      case "Lab":
        return <FaLaptop className="text-purple-500 text-base" />;
      case "Theory":
        return <FaBook className="text-blue-500 text-base" />;
      default:
        return <FaBook className="text-gray-500 text-base" />;
    }
  };

  // Function to get type badge color
  const getTypeBadgeColor = (type) => {
    switch (type) {
      case "Lab":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Theory":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Function to get day color
  const getDayColor = (day) => {
    const colors = {
      Sunday: "from-red-500 to-pink-500",
      Monday: "from-blue-500 to-cyan-500",
      Tuesday: "from-green-500 to-emerald-500",
      Wednesday: "from-yellow-500 to-orange-500",
      Thursday: "from-purple-500 to-indigo-500",
      Friday: "from-indigo-500 to-blue-500",
      Saturday: "from-gray-600 to-gray-700",
    };
    return colors[day] || "from-gray-500 to-gray-600";
  };

  // Check if today matches schedule day
  const isToday = (day) => {
    const today = new Date().toLocaleString("en-us", { weekday: "long" });
    return day === today;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header - Mobile Optimized */}
        <div className="flex flex-col space-y-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl shadow-lg">
              <FaCalendarAlt className="text-white text-xl" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-800 truncate">
                Class Schedule
              </h1>
              <p className="text-gray-600 text-sm flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                {classNumber} • {schedules.length} classes
              </p>
            </div>
          </div>

          {/* Quick Stats - Horizontal Scroll for Mobile */}
          <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 min-w-[100px] flex-shrink-0">
              <div className="text-xs text-gray-500">Total</div>
              <div className="text-lg font-bold text-gray-800">
                {schedules.length}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 min-w-[100px] flex-shrink-0">
              <div className="text-xs text-gray-500">Theory</div>
              <div className="text-lg font-bold text-blue-600">
                {schedules.filter((s) => s.subject.type === "Theory").length}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 min-w-[100px] flex-shrink-0">
              <div className="text-xs text-gray-500">Labs</div>
              <div className="text-lg font-bold text-purple-600">
                {schedules.filter((s) => s.subject.type === "Lab").length}
              </div>
            </div>
          </div>
        </div>

        {/* Filters - Collapsible for Mobile */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          {/* Filter Header - Mobile */}
          <div
            className="flex items-center justify-between cursor-pointer md:cursor-auto"
            onClick={() => setShowFilters(!showFilters)}
          >
            <div className="flex items-center space-x-2">
              <FaFilter className="text-gray-400" />
              <span className="font-medium text-gray-700">Filters</span>
            </div>
            <div className="md:hidden">
              {showFilters ? <FaChevronUp /> : <FaChevronDown />}
            </div>
          </div>

          {/* Filter Content */}
          <div
            className={`${showFilters ? "block" : "hidden md:block"} mt-4 md:mt-0`}
          >
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-6">
              <div className="flex flex-col space-y-3 md:flex-row md:items-center md:space-x-4 md:space-y-0">
                {/* Day Filter */}
                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-medium text-gray-600">
                    Day
                  </label>
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {days.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type Filter */}
                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-medium text-gray-600">
                    Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {types.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Reset Filters */}
              {(selectedDay !== "All" || selectedType !== "All") && (
                <button
                  onClick={() => {
                    setSelectedDay("All");
                    setSelectedType("All");
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 self-start"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Schedule Display - Mobile Optimized */}
        {filteredSchedules.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <FaCalendarAlt className="text-gray-300 text-4xl mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No classes found
            </h3>
            <p className="text-gray-500 text-sm">
              {selectedDay !== "All" || selectedType !== "All"
                ? "Try adjusting your filters to see more results."
                : "No schedule available for your class."}
            </p>
          </div>
        ) : (
          <div className="space-y-4 overflow-x-hidden">
            {sortedDays.map((day) => (
              <div
                key={day}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-hidden"
              >
                {/* Day Header - Clickable on Mobile */}
                <div
                  className={`bg-gradient-to-r ${getDayColor(day)} p-4 text-white cursor-pointer md:cursor-auto`}
                  onClick={() => toggleDayExpansion(day)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <h2 className="text-lg font-bold">{day}</h2>
                      {isToday(day) && (
                        <span className="bg-white/30 text-xs px-2 py-1 rounded-full">
                          Today***
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
                        {schedulesByDay[day].length} class
                        {schedulesByDay[day].length !== 1 ? "es" : ""}
                      </span>
                      <div className="md:hidden">
                        {expandedDays[day] ? (
                          <FaChevronUp />
                        ) : (
                          <FaChevronDown />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Classes for the day - Collapsible on Mobile */}
                <div
                  className={`${expandedDays[day] ? "block" : "hidden md:block"} p-4 `}
                >
                  {/* Mobile: Vertical List */}
                  <div className="md:hidden space-y-3 overflow-hidden">
                    {schedulesByDay[day]
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((schedule, index) => (
                        <div
                          key={schedule._id}
                          className="border border-gray-200 rounded-lg p-4 bg-white mx-auto max-w-[300px] "
                        >
                          {/* Subject Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <div className="p-2 bg-gray-100 rounded-lg">
                                {getSubjectIcon(schedule.subject.type)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-bold text-gray-800 text-base truncate">
                                  {schedule.subject.title}
                                </h3>
                                <p className="text-xs text-gray-600 truncate">
                                  {schedule.subject.code}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded-full border ${getTypeBadgeColor(schedule.subject.type)} flex-shrink-0 ml-2`}
                            >
                              {schedule.subject.type}
                            </span>
                          </div>

                          {/* Class Details - Stacked for Mobile */}
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-700">
                              <FaClock className="mr-2 text-green-500 text-sm flex-shrink-0" />
                              <span className="font-medium">
                                {convertTo12Hour(schedule.startTime)} -{" "}
                                {convertTo12Hour(schedule.endTime)}
                              </span>
                            </div>

                            <div className="flex items-center text-sm text-gray-700">
                              <FaChalkboardTeacher className="mr-2 text-blue-500 text-sm flex-shrink-0" />
                              <span className="truncate">
                                Prof. {schedule.teacherName}
                              </span>
                            </div>

                            <div className="flex items-center text-sm text-gray-700">
                              <FaMapMarkerAlt className="mr-2 text-red-500 text-sm flex-shrink-0" />
                              <span>{schedule.room}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Desktop: Horizontal Scroll */}
                  <div className="hidden md:block">
                    <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      {schedulesByDay[day]
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map((schedule, index) => (
                          <div
                            key={schedule._id}
                            className="min-w-[280px] max-w-[350px] flex-shrink-0 border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300 bg-white hover:border-blue-200"
                          >
                            {/* Subject Header */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                  {getSubjectIcon(schedule.subject.type)}
                                </div>
                                <div>
                                  <h3 className="font-bold text-gray-800 text-lg">
                                    {schedule.subject.title}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    {schedule.subject.code}
                                  </p>
                                </div>
                              </div>
                              <span
                                className={`text-xs font-medium px-3 py-1 rounded-full border ${getTypeBadgeColor(schedule.subject.type)}`}
                              >
                                {schedule.subject.type}
                              </span>
                            </div>

                            {/* Class Details */}
                            <div className="space-y-3">
                              <div className="flex items-center text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                                <FaClock className="mr-3 text-green-500 text-lg" />
                                <div>
                                  <div className="font-semibold">
                                    {convertTo12Hour(schedule.startTime)} -{" "}
                                    {convertTo12Hour(schedule.endTime)}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                                <FaChalkboardTeacher className="mr-3 text-blue-500 text-lg" />
                                <div>
                                  <div className="font-medium">
                                    Prof. {schedule.teacherName}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                                <FaMapMarkerAlt className="mr-3 text-red-500 text-lg" />
                                <div>
                                  <div className="font-medium">
                                    {schedule.room}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* Desktop Scroll Hint */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-center text-sm text-gray-500">
                        ← Scroll for more classes →
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State for No Filters */}
        {schedules.length > 0 && filteredSchedules.length === 0 && (
          <div className="text-center py-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-md mx-auto">
              <FaFilter className="text-gray-300 text-3xl mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-700 mb-2">
                No matching classes
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                No classes match your current filter criteria.
              </p>
              <button
                onClick={() => {
                  setSelectedDay("All");
                  setSelectedType("All");
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors duration-200 text-sm"
              >
                Show All Classes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentSchedule;
