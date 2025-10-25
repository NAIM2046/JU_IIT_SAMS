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
  FaChevronRight,
  FaGraduationCap,
} from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { PiMarkdownLogo, PiPercent } from "react-icons/pi";
import useStroge from "../../stroge/useStroge";

const TeacherSection = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useStroge();
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const navItems = [
    {
      path: "/teacherDashboard",
      icon: <FaHome className="text-lg" />,
      label: "Dashboard",
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
      path: "/teacherDashboard/profile",
      icon: <CgProfile className="text-lg" />,
      label: "Profile",
      isActive: (currentPath) => currentPath === "/teacherDashboard/profile",
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
      icon: <FaGraduationCap className="text-lg" />,
      label: "Incourse Marks",
      isActive: (currentPath) =>
        currentPath === "/teacherDashboard/manageIncoursemark",
    },
    {
      path: "/teacherDashboard/viewAttendanceSummary",
      icon: <PiPercent className="text-lg" />,
      label: "Attendance Summary",
      isActive: (currentPath) =>
        currentPath === "/teacherDashboard/viewAttendanceSummary",
    },
    {
      path: "/teacherDashboard/finalMarkInput",
      icon: <PiMarkdownLogo className="text-lg" />,
      label: "Final Marks",
      isActive: (currentPath) =>
        currentPath === "/teacherDashboard/finalMarkInput",
    },
  ];

  if (user?.isCommittee) {
    navItems.push({
      path: "/ExamCommitteeDashboard",
      icon: <FaChalkboardTeacher className="text-lg" />,
      label: "Exam Committee",
      isActive: (currentPath) => currentPath === "/ExamCommitteeDashboard",
    });
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 overflow-x-hidden">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row w-full max-w-full overflow-hidden ">
        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center justify-between bg-white shadow-lg p-4 border-b border-gray-200 sticky top-0 z-40 w-full">
          <button
            onClick={toggleMenu}
            className="text-gray-600 hover:text-blue-600 transition-all duration-300 p-2 rounded-lg hover:bg-blue-50"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <FaTimes className="text-2xl" />
            ) : (
              <FaBars className="text-2xl" />
            )}
          </button>
          <div className="flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg shadow-md">
            <FaChalkboardTeacher className="mr-2" />
            <span className="font-semibold">Teacher Portal</span>
          </div>
          <div className="w-10"></div> {/* Spacer for balance */}
        </div>

        {/* Sidebar */}
        <aside
          className={`transform ${isMenuOpen ? "translate-x-0" : "-translate-x-full"} 
          ${isCollapsed ? "w-20" : "w-64"} 
          md:translate-x-0 transition-all duration-300 ease-in-out fixed md:static 
          inset-y-0 left-0 bg-white shadow-xl z-40 border-r border-gray-200
          overflow-y-auto flex flex-col min-h-screen md:h-[calc(100vhpx)]`}
        >
          <div className="p-4 h-full flex flex-col">
            {/* Header */}
            <div
              className={`mb-8 px-2 py-4 border-b border-gray-100 ${isCollapsed ? "text-center" : ""}`}
            >
              <div className="flex items-center justify-between">
                <h2
                  className={`font-bold text-gray-800 flex items-center ${isCollapsed ? "justify-center w-full" : ""}`}
                >
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg shadow-md">
                    <FaChalkboardTeacher className="text-white text-xl" />
                  </div>
                  {!isCollapsed && (
                    <span className="ml-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Teacher Dashboard
                    </span>
                  )}
                </h2>

                {/* Desktop collapse button */}
                <button
                  onClick={toggleSidebar}
                  className={`hidden md:flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-all duration-300 ${isCollapsed ? "rotate-180" : ""}`}
                  aria-label={
                    isCollapsed ? "Expand sidebar" : "Collapse sidebar"
                  }
                >
                  <FaChevronRight className="text-gray-500 text-sm" />
                </button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1">
              <ul className="space-y-1">
                {navItems.map((item) => {
                  const active = item.isActive(location.pathname);
                  return (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative
                          ${
                            active
                              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200"
                              : "text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md"
                          } ${isCollapsed ? "justify-center" : ""}`}
                      >
                        <span
                          className={`text-lg ${active ? "text-white" : "text-gray-500 group-hover:text-blue-600"} ${isCollapsed ? "" : "mr-3"}`}
                        >
                          {item.icon}
                        </span>
                        {!isCollapsed && (
                          <>
                            <span className="font-medium">{item.label}</span>
                            {active && (
                              <div className="absolute right-3 w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </>
                        )}

                        {/* Tooltip for collapsed state */}
                        {isCollapsed && (
                          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                            {item.label}
                          </div>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* User info at bottom */}
            <div
              className={`mt-auto p-4 border-t border-gray-200 ${isCollapsed ? "text-center" : ""}`}
            >
              <div
                className={`flex items-center ${isCollapsed ? "justify-center" : ""}`}
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                    {user?.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover border-2 border-white"
                      />
                    ) : (
                      <FaUser className="text-white" />
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                {!isCollapsed && (
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {user?.name || "Teacher"}
                    </p>
                    <p className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full inline-block">
                      Teacher Account
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile menu */}
        {isMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden backdrop-blur-sm"
            onClick={toggleMenu}
          />
        )}

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-300 min-h-[calc(100vh-64px)] w-full overflow-x-hidden ${
            isCollapsed ? "md:ml-0" : "md:ml-0"
          }`}
        >
          <div className="p-2 md:p-2 lg:p-8 w-full max-w-full">
            {/* Breadcrumb or header area */}
            <div className="mb-2">
              <div className="flex items-center justify-between">
                {/* Mobile collapse button */}
                <button
                  onClick={toggleSidebar}
                  className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow duration-300 flex-shrink-0 ml-2"
                  aria-label="Toggle sidebar"
                >
                  <FaChevronRight className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* Content Container */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 min-h-[500px] p-4 md:p-6 lg:p-8 transition-all duration-300 hover:shadow-md w-full overflow-x-hidden">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeacherSection;
