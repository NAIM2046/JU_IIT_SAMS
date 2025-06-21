import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  FaHome,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaBook,
  FaUsers,
  FaBell,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import Navbar from "../../Shared/Navbar";

const Admin = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  const navItems = [
    {
      path: "/adminDashboard",
      icon: <FaHome className="mr-3" />,
      label: "Admin Home",
      end: true, // This ensures exact matching
    },
    {
      path: "/adminDashboard/addteacher",
      icon: <FaChalkboardTeacher className="mr-3" />,
      label: "Add Teacher",
    },
    {
      path: "/adminDashboard/addstudent",
      icon: <FaUserGraduate className="mr-3" />,
      label: "Add Student",
    },
    {
      path: "/adminDashboard/manageschedule",
      icon: <FaBook className="mr-3" />,
      label: "Manage Schedule",
    },
    {
      path: "/adminDashboard/classManage",
      icon: <FaUsers className="mr-3" />,
      label: "Class Management",
    },
    {
      path: "/adminDashboard/noticeManage",
      icon: <FaBell className="mr-3" />,
      label: "Notice Management",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      {/* Mobile Sidebar Toggle Button */}
      <div className="md:hidden flex items-center justify-between bg-white shadow-sm p-4 border-b">
        <button
          onClick={toggleSidebar}
          className="text-gray-600 hover:text-orange-500 transition-colors"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? (
            <FaTimes className="text-2xl" />
          ) : (
            <FaBars className="text-2xl" />
          )}
        </button>
        <div className="flex items-center">
          <FaChalkboardTeacher className="text-orange-500 mr-2" />
          <span className="font-medium text-gray-700">Admin Portal</span>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 transition-transform duration-300 ease-in-out fixed md:static 
          inset-y-0 left-0 w-64 bg-[#00FFFF] text-black shadow-lg md:shadow-none z-40
          overflow-y-auto`}
        >
          <div className="p-4 h-full flex flex-col">
            <div className="mb-8 hidden md:block px-2 py-4">
              <h2 className="text-xl font-semibold flex items-center">
                <FaChalkboardTeacher className="mr-2" />
                Admin Dashboard
              </h2>
            </div>

            <nav className="flex-1">
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      end={item.end} // Use the end prop for exact matching
                      className={({ isActive }) =>
                        `flex items-center px-4 py-3 rounded-lg transition-colors
                        ${
                          isActive
                            ? "bg-orange-600 text-white font-medium"
                            : "hover:bg-orange-400"
                        }`
                      }
                    >
                      {item.icon}
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Divider and Home Link */}
            <div className="mt-auto">
              <div className="border-t border-orange-400 my-4"></div>
              <ul className="space-y-2">
                <li>
                  <NavLink
                    to="/"
                    className="flex items-center px-4 py-3 rounded-lg hover:bg-orange-400 transition-colors"
                  >
                    <FaHome className="mr-3" />
                    Back to Home
                  </NavLink>
                </li>
              </ul>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile menu */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={toggleSidebar}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[calc(100vh-8rem)]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;
