import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  FaCalendarAlt,
  FaHome,
  FaUser,
  FaExclamationTriangle,
  FaBullhorn,
  FaChartBar,
  FaAward,
  FaClipboardCheck,
  FaBars,
  FaTimes,
  FaChevronRight,
  FaUserGraduate,
} from "react-icons/fa";
import useStroge from "../../stroge/useStroge";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";
import Navbar from "../../Shared/Navbar";
import Footer from "../../Shared/Footer";

const StudentSection = () => {
  const AxiosSecure = useAxiosPrivate();
  const { user } = useStroge();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const navigationItems = [
    {
      to: "/studentDashboard/classroutine",
      icon: <FaCalendarAlt className="text-lg" />,
      label: "Class Routine",
      description: "Check your daily schedule",
      color: "from-blue-500 to-cyan-500",
    },
    {
      to: "/studentDashboard/incourse_mark",
      icon: <FaChartBar className="text-lg" />,
      label: "Incourse Mark",
      description: "Monitor your grades",
      color: "from-green-500 to-emerald-500",
    },
    {
      to: "/studentDashboard/semesterFinalResult",
      icon: <FaAward className="text-lg" />,
      label: "Semester Final Result",
      description: "View final results",
      color: "from-yellow-500 to-orange-500",
    },
    {
      to: "/studentDashboard/attendance",
      icon: <FaClipboardCheck className="text-lg" />,
      label: "Attendance",
      description: "Check presence records",
      color: "from-purple-500 to-pink-500",
    },
    {
      to: "/studentDashboard/profile",
      icon: <FaUser className="text-lg" />,
      label: "Profile",
      description: "Update personal info",
      color: "from-indigo-500 to-blue-500",
    },
    {
      to: "/studentDashboard/failSubjects",
      icon: <FaExclamationTriangle className="text-lg" />,
      label: "Fail Subjects",
      description: "Review retake courses",
      color: "from-red-500 to-pink-500",
    },
    {
      to: "/studentDashboard/notice",
      icon: <FaBullhorn className="text-lg" />,
      label: "Notices",
      description: "College announcements",
      color: "from-gray-600 to-gray-700",
    },
    {
      to: "/studentDashboard/exam_routine",
      icon: <FaCalendarAlt className="text-lg" />,
      label: "Exam Routine",
      description: "Exam schedule planner",
      color: "from-gray-600 to-gray-700",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <Navbar />

      {/* Mobile Header */}
      <div className="md:hidden bg-white shadow-lg border-b border-gray-200 px-4 py-4 flex justify-between items-center sticky top-0 ">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl shadow-md">
            <FaUserGraduate className="text-white text-lg" />
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Student Portal
            </h2>
            <p className="text-xs text-gray-500">
              Welcome, {user?.name?.split(" ")[0] || "Student"}!
            </p>
          </div>
        </div>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200 shadow-sm"
        >
          {sidebarOpen ? (
            <FaTimes className="text-gray-700 text-xl" />
          ) : (
            <FaBars className="text-gray-700 text-xl" />
          )}
        </button>
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          ${isCollapsed ? "w-30" : "w-80"} 
          md:translate-x-0 transition-all duration-300 ease-in-out fixed md:static 
          inset-y-0 left-0 bg-white shadow-2xl z-30 border-r border-gray-200
          overflow-y-auto flex flex-col`}
        >
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div
              className={`flex items-center justify-between ${isCollapsed ? "flex-col space-y-4" : ""}`}
            >
              <div
                className={`flex items-center ${isCollapsed ? "flex-col text-center" : "space-x-3"}`}
              >
                <div className="bg-white/20 p-3 rounded-2xl shadow-lg">
                  <FaUserGraduate className="text-2xl" />
                </div>
                {!isCollapsed && (
                  <div>
                    <h1 className="text-xl font-bold">Student Dashboard</h1>
                    <p className="text-blue-100 text-sm opacity-90">
                      {user?.department || "Computer Science"}
                    </p>
                  </div>
                )}
              </div>

              {/* Collapse Button */}
              <button
                onClick={toggleCollapse}
                className={`hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-300 ${isCollapsed ? "rotate-180" : ""}`}
              >
                <FaChevronRight className="text-white text-sm" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 p-4">
            <nav>
              <ul className="space-y-2">
                {navigationItems.map((item, index) => (
                  <li key={index}>
                    <NavLink
                      to={item.to}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `group flex items-center p-4  rounded-2xl transition-all duration-300 relative overflow-hidden
                        ${
                          isActive
                            ? `bg-gradient-to-r ${item.color} text-white shadow-lg transform scale-105`
                            : "bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md border border-gray-100"
                        }
                        ${isCollapsed ? "justify-center " : ""}`
                      }
                    >
                      {/* Background glow effect */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                      ></div>

                      <div
                        className={`relative flex items-center ${isCollapsed ? "" : "space-x-4"} w-full`}
                      >
                        <div
                          className={`p-3 rounded-xl shadow-sm ${({
                            isActive,
                          }) =>
                            isActive
                              ? "bg-white/20"
                              : `bg-gradient-to-r ${item.color} text-white`}`}
                        >
                          {item.icon}
                        </div>

                        {!isCollapsed && (
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-current">
                              {item.label}
                            </div>
                            <div
                              className={`text-sm ${({ isActive }) =>
                                isActive ? "text-blue-100" : "text-gray-500"}`}
                            >
                              {item.description}
                            </div>
                          </div>
                        )}

                        {!isCollapsed && (
                          <FaChevronRight
                            className={`text-sm transition-transform duration-300 ${({
                              isActive,
                            }) =>
                              isActive
                                ? "text-white transform translate-x-1"
                                : "text-gray-400"}`}
                          />
                        )}
                      </div>

                      {/* Tooltip for collapsed state */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-2 px-1 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 shadow-lg">
                          <div className="font-semibold">{item.label}</div>
                          <div className="text-gray-300 text-xs">
                            {item.description}
                          </div>
                        </div>
                      )}
                    </NavLink>
                  </li>
                ))}

                {/* Separator */}
                <li className="border-t border-gray-200 my-4"></li>

                {/* Additional Links */}
                <li>
                  <NavLink
                    to="/"
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `group flex items-center p-4 rounded-2xl transition-all duration-300
                      ${isActive ? "bg-blue-50 text-blue-600 border border-blue-200" : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"}
                      ${isCollapsed ? "justify-center" : ""}`
                    }
                  >
                    <div className="p-3 rounded-xl bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-sm">
                      <FaHome className="text-lg" />
                    </div>
                    {!isCollapsed && (
                      <span className="ml-4 font-medium">Back to Home</span>
                    )}
                  </NavLink>
                </li>
              </ul>
            </nav>
          </div>

          {/* User Profile Section */}
          {!isCollapsed && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-3 p-3 bg-white rounded-2xl shadow-sm border border-gray-200">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-md">
                    {user?.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="w-full h-full rounded-2xl object-cover"
                      />
                    ) : (
                      <FaUserGraduate className="text-white text-lg" />
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">
                    {user?.name || "Student"}
                  </p>
                  <p className="text-sm text-gray-600 truncate">
                    {user?.studentId || "ID: N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Overlay for mobile menu */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main
          className={`flex-1 transition-all duration-300 ${isCollapsed ? "md:ml-0" : ""}`}
        >
          <div className="p-4 md:p-6 lg:p-8">
            {/* Content Header */}
            <div className="mb-6 md:mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                    Welcome {user?.name?.split(" ")[0] || "Student"}! 👋
                  </h1>
                </div>

                {/* Mobile collapse button */}
                <button
                  onClick={toggleCollapse}
                  className="hidden md:flex items-center justify-center w-10 h-10 rounded-2xl bg-white shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200"
                >
                  <FaChevronRight
                    className={`text-gray-600 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}
                  />
                </button>
              </div>
            </div>

            {/* Content Container */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 min-h-[calc(100vh-12rem)] p-6 md:p-8 transition-all duration-300 hover:shadow-md">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default StudentSection;
