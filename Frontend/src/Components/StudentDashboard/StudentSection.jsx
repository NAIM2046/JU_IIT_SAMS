import React, { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  FaBook,
  FaHome,
  FaUsers,
  FaIdCard,
  FaBell,
  FaChartLine,
  FaTrophy,
  FaListAlt,
} from "react-icons/fa";
import { MdOutlineFormatListNumbered } from "react-icons/md";
import useStroge from "../../stroge/useStroge";
import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";
import Navbar from "../../Shared/Navbar";
import Footer from "../../Shared/Footer";

const StudentSection = () => {
  const AxiosSecure = useAxiosPrivate();
  const { user } = useStroge();
  const [ranklist, setRanklist] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const classNumber = user?.class;

  useEffect(() => {
    if (classNumber) {
      AxiosSecure.get(`/api/exam/rank_summary/${classNumber}`).then((res) => {
        setRanklist(res.data);
      });
    }
  }, [AxiosSecure, classNumber]);

  const currentStudentRank = ranklist.find(
    (student) => student._id === user?._id
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      {/* Mobile Header */}
      <div className="md:hidden bg-white shadow-sm px-4 py-3 flex justify-between items-center sticky top-0 z-30">
        <h2 className="text-lg font-semibold text-blue-600">
          Student Dashboard
        </h2>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-600 focus:outline-none"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      <div className="flex flex-col md:flex-row flex-1">
        {/* Sidebar - Light Blue */}
        <aside
          className={`${sidebarOpen ? "block absolute z-20 w-64 h-full" : "hidden"} 
          md:block bg-white w-64 border-r border-gray-200 shadow-sm`}
        >
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-6 px-2">
              Student Menu
            </h3>
            <nav>
              <ul className="space-y-1">
                {[
                  {
                    to: "/studentDashboard/classroutine",
                    icon: <FaHome />,
                    label: "Class Routine",
                  },
                  {
                    to: "/studentDashboard/performance",
                    icon: <FaChartLine />,
                    label: "Performance",
                  },
                  {
                    to: "/studentDashboard/ranklist",
                    icon: <FaTrophy />,
                    label: "Rank List",
                  },
                  {
                    to: "/studentDashboard/badges",
                    icon: <FaListAlt />,
                    label: "Achievements",
                  },
                  {
                    to: "/studentDashboard/profile",
                    icon: <FaUsers />,
                    label: "Profile",
                  },
                  {
                    to: "/studentDashboard/reportCard",
                    icon: <FaIdCard />,
                    label: "Report Card",
                  },
                  {
                    to: "/studentDashboard/notice",
                    icon: <FaBell />,
                    label: "Notices",
                  },
                ].map((item, index) => (
                  <li key={index}>
                    <NavLink
                      to={item.to}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-gray-600 hover:bg-blue-50 hover:text-blue-600 ${
                          isActive ? "bg-blue-50 text-blue-600 font-medium" : ""
                        }`
                      }
                    >
                      <span className="text-blue-500">{item.icon}</span>
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                ))}

                <li className="border-t border-gray-100 my-2"></li>

                <li>
                  <NavLink
                    to="/"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <span className="text-blue-500">
                      <FaHome />
                    </span>
                    <span>Back to Home</span>
                  </NavLink>
                </li>
              </ul>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-white md:bg-gray-50 p-4 md:p-6">
          <Outlet />
        </main>

        {/* Right Profile Panel - Light Gray */}
        <aside className="w-full md:w-72 lg:w-80 p-4 bg-white md:bg-gray-50">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              Your Academic Profile
            </h4>

            {currentStudentRank ? (
              <div className="space-y-5">
                {/* Rank Display */}
                <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">Current Rank</p>
                    <p className="text-2xl font-bold text-blue-600">
                      #{currentStudentRank.rank}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total Marks</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {currentStudentRank.totalGetMarks}
                      <span className="text-gray-400">
                        /{currentStudentRank.totalFullMark}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>
                      {Math.round(
                        (currentStudentRank.totalGetMarks /
                          currentStudentRank.totalFullMark) *
                          100
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
                      style={{
                        width: `${(currentStudentRank.totalGetMarks / currentStudentRank.totalFullMark) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Badge */}
                <div className="text-center pt-4">
                  {(() => {
                    const percentage =
                      (currentStudentRank.totalGetMarks /
                        currentStudentRank.totalFullMark) *
                      100;
                    let badge = {
                      title: "",
                      color: "",
                      emoji: "",
                      bg: "",
                      remark: "",
                    };

                    if (percentage >= 80) {
                      badge = {
                        title: "Gold Scholar",
                        color: "text-yellow-600",
                        emoji: "🥇",
                        bg: "bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200",
                        remark: "Exceptional Performance!",
                      };
                    } else if (percentage >= 50) {
                      badge = {
                        title: "Silver Achiever",
                        color: "text-gray-700",
                        emoji: "🥈",
                        bg: "bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200",
                        remark: "Great Progress!",
                      };
                    } else {
                      badge = {
                        title: "Rising Star",
                        color: "text-blue-600",
                        emoji: "⭐",
                        bg: "bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200",
                        remark: "Keep Improving!",
                      };
                    }

                    return (
                      <div className={`${badge.bg} p-4 rounded-lg border`}>
                        <div className="text-4xl mb-2">{badge.emoji}</div>
                        <h5 className={`font-semibold ${badge.color}`}>
                          {badge.title}
                        </h5>
                        <p className="text-sm text-gray-600 mt-1">
                          {badge.remark}
                        </p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="animate-pulse flex justify-center">
                  <div className="h-8 w-8 bg-blue-200 rounded-full"></div>
                </div>
                <p className="text-gray-500 mt-3">
                  Loading your academic data...
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>

      <Footer />
    </div>
  );
};

export default StudentSection;
