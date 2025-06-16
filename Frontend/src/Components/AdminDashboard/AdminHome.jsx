import React from "react";
import {
  FiUsers,
  FiBook,
  FiCalendar,
  FiBarChart2,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
} from "react-icons/fi";

const AdminHome = () => {
  // Sample data - in a real app this would come from API/state
  const recentActivities = [
    {
      id: 1,
      user: "Ms. Johnson",
      action: "added exam results",
      time: "10 mins ago",
      icon: <FiBarChart2 className="text-blue-500" />,
    },
    {
      id: 2,
      user: "Admin",
      action: "updated school calendar",
      time: "25 mins ago",
      icon: <FiCalendar className="text-purple-500" />,
    },
    {
      id: 3,
      user: "Mr. Smith",
      action: "uploaded lesson plans",
      time: "1 hour ago",
      icon: <FiBook className="text-green-500" />,
    },
  ];

  const performanceAlerts = [
    {
      id: 1,
      class: "Class 9 Science",
      issue: "10 students below 40%",
      severity: "high",
    },
    {
      id: 2,
      class: "Class 7B",
      issue: "Attendance drop (15%)",
      severity: "medium",
    },
    {
      id: 3,
      class: "Class 11 Math",
      issue: "3 late submissions",
      severity: "low",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with quick actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Admin Dashboard
            </h1>
            <p className="text-gray-500 mt-1">Welcome back, Admin</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center">
              <FiCalendar className="mr-2" /> Add Event
            </button>
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center">
              <FiUsers className="mr-2" /> Manage Users
            </button>
          </div>
        </div>

        {/* Summary Cards - Enhanced with icons and trends */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white shadow rounded-xl p-6 border-l-4 border-blue-500">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold text-gray-600 flex items-center">
                  <FiUsers className="mr-2 text-blue-500" /> Total Students
                </h2>
                <p className="text-3xl font-bold text-gray-800 mt-2">1,320</p>
              </div>
              <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                +5.2%
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-2">From 1,256 last month</p>
          </div>

          <div className="bg-white shadow rounded-xl p-6 border-l-4 border-green-500">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold text-gray-600 flex items-center">
                  <FiUsers className="mr-2 text-green-500" /> Total Teachers
                </h2>
                <p className="text-3xl font-bold text-gray-800 mt-2">87</p>
              </div>
              <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                +2.4%
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-2">From 85 last term</p>
          </div>

          <div className="bg-white shadow rounded-xl p-6 border-l-4 border-purple-500">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold text-gray-600 flex items-center">
                  <FiBook className="mr-2 text-purple-500" /> Active Classes
                </h2>
                <p className="text-3xl font-bold text-gray-800 mt-2">24</p>
              </div>
              <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                +1 new
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-2">3 classes completed</p>
          </div>

          <div className="bg-white shadow rounded-xl p-6 border-l-4 border-yellow-500">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold text-gray-600 flex items-center">
                  <FiDollarSign className="mr-2 text-yellow-500" /> Fees
                  Collected
                </h2>
                <p className="text-3xl font-bold text-gray-800 mt-2">$42,580</p>
              </div>
              <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                92%
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-2">$3,720 pending</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Exam Performance Chart (placeholder) */}
            <div className="bg-white shadow rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-700 flex items-center">
                  <FiBarChart2 className="mr-2 text-blue-500" /> Exam
                  Performance
                </h2>
                <select className="bg-gray-100 border border-gray-300 text-gray-700 py-1 px-3 rounded-lg focus:outline-none">
                  <option>This Term</option>
                  <option>Last Term</option>
                  <option>This Year</option>
                </select>
              </div>
              <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                <p className="text-gray-500">
                  [Bar chart visualization would appear here]
                </p>
              </div>
              <div className="mt-4 flex justify-between text-sm text-gray-500">
                <span>Class 9</span>
                <span>Class 10</span>
                <span>Class 11</span>
                <span>Class 12</span>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white shadow rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                <FiClock className="mr-2 text-purple-500" /> Recent Activities
              </h2>
              <ul className="space-y-4">
                {recentActivities.map((activity) => (
                  <li key={activity.id} className="flex items-start">
                    <div className="bg-gray-100 p-2 rounded-full mr-3">
                      {activity.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800">
                        <span className="font-medium">{activity.user}</span>{" "}
                        {activity.action}
                      </p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <button className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium">
                View all activities →
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <div className="bg-white shadow rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-700 flex items-center">
                  <FiCalendar className="mr-2 text-green-500" /> Upcoming Events
                </h2>
                <button className="text-sm text-blue-600 hover:text-blue-800">
                  View All
                </button>
              </div>
              <ul className="space-y-4">
                <li className="pb-4 border-b border-gray-100">
                  <div className="flex items-start">
                    <div className="bg-blue-100 text-blue-800 p-2 rounded-lg mr-3">
                      <FiCalendar className="text-lg" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">
                        Physics Exam
                      </h3>
                      <p className="text-sm text-gray-500">
                        June 20, 2023 • 9:00 AM
                      </p>
                      <p className="text-sm mt-1">Class 9-12</p>
                    </div>
                  </div>
                </li>
                <li className="pb-4 border-b border-gray-100">
                  <div className="flex items-start">
                    <div className="bg-purple-100 text-purple-800 p-2 rounded-lg mr-3">
                      <FiUsers className="text-lg" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">
                        Parent Meeting
                      </h3>
                      <p className="text-sm text-gray-500">
                        June 25, 2023 • 2:00 PM
                      </p>
                      <p className="text-sm mt-1">Main Auditorium</p>
                    </div>
                  </div>
                </li>
                <li className="pb-4">
                  <div className="flex items-start">
                    <div className="bg-yellow-100 text-yellow-800 p-2 rounded-lg mr-3">
                      <FiBook className="text-lg" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">
                        Library Audit
                      </h3>
                      <p className="text-sm text-gray-500">
                        June 22, 2023 • All Day
                      </p>
                      <p className="text-sm mt-1">Library Committee</p>
                    </div>
                  </div>
                </li>
              </ul>
            </div>

            {/* Performance Alerts */}
            <div className="bg-white shadow rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                <FiAlertTriangle className="mr-2 text-red-500" /> Performance
                Alerts
              </h2>
              <ul className="space-y-3">
                {performanceAlerts.map((alert) => (
                  <li key={alert.id} className="flex items-start">
                    <div
                      className={`mt-1 mr-3 ${
                        alert.severity === "high"
                          ? "text-red-500"
                          : alert.severity === "medium"
                            ? "text-yellow-500"
                            : "text-blue-500"
                      }`}
                    >
                      <FiAlertTriangle />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">
                        {alert.class}
                      </h3>
                      <p className="text-sm text-gray-600">{alert.issue}</p>
                      <button className="mt-1 text-xs text-blue-600 hover:text-blue-800">
                        View details
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <button className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium">
                View all alerts →
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <FiCheckCircle className="mr-2 text-green-500" /> Quick Stats
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-500">Attendance Today</p>
              <p className="text-2xl font-bold text-gray-800">94%</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-500">Pending Approvals</p>
              <p className="text-2xl font-bold text-gray-800">12</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-500">New Messages</p>
              <p className="text-2xl font-bold text-gray-800">5</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-500">Tasks Due</p>
              <p className="text-2xl font-bold text-gray-800">3</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
