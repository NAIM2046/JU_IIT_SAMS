import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import Navbar from "../../Shared/Navbar";
import {
  FaHome,
  FaBars,
  FaTimes,
  FaCalendarAlt,
  FaHistory,
  FaBullhorn,
  FaChalkboardTeacher,
  FaUser,
} from "react-icons/fa";
import { PiExamFill, PiMarkdownLogo, PiPercent } from "react-icons/pi";
import useStroge from "../../stroge/useStroge";

const TeacherSection = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useStroge();
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const navItems = [
    {
      path: "/teacherDashboard",
      icon: <FaHome className="text-lg" />,
      label: "Dashboard",
      // Custom match function for exact matching
      isActive: (currentPath) => currentPath === "/teacherDashboard",
    },
    {
      path: "/teacherDashboard/schedule",
      icon: <FaCalendarAlt className="text-lg" />,
      label: "Schedule",
      isActive: (currentPath) => currentPath === "/teacherDashboard/schedule",
    },
    {
      path: "/teacherDashboard/classhistory",
      icon: <FaHistory className="text-lg" />,
      label: "Class History",
      isActive: (currentPath) =>
        currentPath === "/teacherDashboard/classhistory",
    },
    {
      path: "/teacherDashboard/notice",
      icon: <FaBullhorn className="text-lg" />,
      label: "Notices",
      isActive: (currentPath) => currentPath === "/teacherDashboard/notice",
    },
    {
      path: "/teacherDashboard/exam",
      icon: <PiExamFill className="text-lg" />,
      label: "Exams",
      isActive: (currentPath) => currentPath === "/teacherDashboard/exam",
    },
    {
      path: "/teacherDashboard/performanceSummary",
      icon: <PiPercent className="text-lg" />,
      label: "Performance Summary",
      isActive: (currentPath) =>
        currentPath === "/teacherDashboard/performanceSummary",
    },
    {
      path: "/teacherDashboard/manageIncoursemark",
      icon: <PiPercent className="text-lg" />,
      label: "Manage-Incourse-Mark",
      isActive: (currentPath) =>
        currentPath === "/teacherDashboard/manageIncoursemark",
    },
    {
      path: "/teacherDashboard/viewAttendanceSummary",
      icon: <PiPercent className="text-lg" />,
      label: "View-Attendance-Summary",
      isActive: (currentPath) =>
        currentPath === "/teacherDashboard/viewAttendanceSummary",
    },
    {
      path: "/teacherDashboard/finalMarkInput",
      icon: <PiMarkdownLogo className="text-lg" />,
      label: "Final-Mark-Input",
      isActive: (currentPath) =>
        currentPath === "/teacherDashboard/finalMarkInput",
    },
  ];

  if (user?.isCommittee) {
    navItems.push({
      path: "/ExamCommitteeDashboard",
      icon: <FaChalkboardTeacher className="text-lg" />,
      label: "Exam Committee Dashboard",
      isActive: (currentPath) => currentPath === "/ExamCommitteeDashboard",
    });
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 ">
      <Navbar />

      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center justify-between bg-white shadow-sm p-4 border-b">
        <button
          onClick={toggleMenu}
          className="text-gray-600 hover:text-blue-600 transition-colors"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <FaTimes className="text-2xl" />
          ) : (
            <FaBars className="text-2xl" />
          )}
        </button>
        <div className="flex items-center">
          <FaChalkboardTeacher className="text-blue-600 mr-2" />
          <span className="font-medium text-gray-700">Teacher Portal</span>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`transform ${isMenuOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 transition-transform duration-300 ease-in-out fixed md:static 
          inset-y-0 left-0 w-64 bg-white shadow-lg md:shadow-none z-40 border-r border-gray-200
          overflow-y-auto`}
        >
          <div className="p-4 h-full flex flex-col">
            <div className="mb-8 px-2 py-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <FaChalkboardTeacher className="mr-2 text-blue-600" />
                <span className="hidden md:inline">Teacher Dashboard</span>
              </h2>
            </div>

            <nav className="flex-1">
              <ul className="space-y-2">
                {navItems.map((item) => {
                  const active = item.isActive(location.pathname);
                  return (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200
                          ${
                            active
                              ? "bg-blue-100 text-blue-700 font-medium shadow-inner"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                          }`}
                      >
                        <span className="text-lg mr-3">{item.icon}</span>
                        <span>{item.label}</span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* User info at bottom */}
            <div className="mt-auto p-4 border-t border-gray-200">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <FaUser className="text-blue-600" />
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 truncate max-w-[150px]">
                    {user?.name || "Teacher"}
                  </p>
                  <p className="text-xs text-gray-500">Teacher Account</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile menu */}
        {isMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={toggleMenu}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300 mx-auto w-full max-w-7xl">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[calc(100vh-8rem)] p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeacherSection;
