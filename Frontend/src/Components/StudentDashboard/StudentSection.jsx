import React, { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  FaAd,
  FaBook,
  FaContao,
  FaDollarSign,
  FaHome,
  FaIdCard,
  FaUsers,
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

  const classNumber = user.class;

  useEffect(() => {
    AxiosSecure.get(`/api/exam/rank_summary/${classNumber}`).then((res) => {
      setRanklist(res.data);
    });
  }, [AxiosSecure, classNumber]);

  const currentStudentRank = ranklist.find(
    (student) => student._id === user._id
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Mobile Sidebar Toggle Button */}
      <div className="md:hidden bg-white shadow sticky top-0 z-50 px-4 py-2 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-orange-500">Student Panel</h2>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle Sidebar"
          className="text-3xl text-gray-800 focus:outline-none"
        >
          ☰
        </button>
      </div>

      <div className="flex flex-col order-1 md:flex-row">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "block absolute z-40" : "hidden"
          } md:block bg-orange-400 w-44 min-h-screen p-4 text-white font-semibold`}
        >
          <ul className="space-y-2 text-white font-medium">
            {[
              {
                to: "/studentDashboard/classroutine",
                icon: <FaHome className="text-lg" />,
                label: "Class Routine",
              },
              {
                to: "/studentDashboard/performance",
                icon: <FaBook className="text-lg" />,
                label: "Subjects Performance",
              },
              {
                to: "/studentDashboard/ranklist",
                icon: <MdOutlineFormatListNumbered className="text-lg" />,
                label: "Rank List",
              },
              {
                to: "/dashboard/badges",
                icon: <FaAd className="text-lg" />,
                label: "Badges & Points",
              },
              {
                to: "/studentDashboard/profile",
                icon: <FaUsers className="text-lg" />,
                label: "Profile",
              },
              {
                to: "/studentDashboard/reportCard",
                icon: <FaIdCard className="text-lg" />,
                label: "View ReportCard",
              },
              {
                to: "/studentDashboard/notice",
                icon: <FaContao className="text-lg" />,
                label: "Notice",
              },
            ].map((item, index) => (
              <li key={index}>
                <NavLink
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                      isActive ? "bg-blue-600 text-white" : "hover:bg-blue-500"
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}

            <div className="border-t border-gray-400 my-3" />

            <li>
              <NavLink
                to="/"
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive ? "bg-blue-600 text-white" : "hover:bg-blue-500"
                  }`
                }
              >
                <FaHome className="text-lg" />
                <span>Home</span>
              </NavLink>
            </li>
          </ul>
        </aside>

        {/* Main Content */}
        <main className="flex-col-1 md:flex-1 order-3 md:order-2">
          <Outlet />
        </main>

        {/* Right Profile Sidebar */}
        <aside className="w-full  md:w-50 lg:w-80 p-4 order-2 md:order-3">
          <div className="bg-white rounded-xl shadow p-4">
            <h4 className="text-lg font-bold mb-2">🎮 Your Profile Badge</h4>

            {currentStudentRank ? (
              <>
                <div className="flex justify-between items-center">
                  <p className="text-xl  text-green-500 font-bold">
                    #{currentStudentRank.rank} in Class
                  </p>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total Marks</p>
                    <p className="text-md font-bold text-green-600">
                      {currentStudentRank.totalGetMarks}/
                      {currentStudentRank.totalFullMark}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-1">🎯 Progress</p>
                  <div className="w-full bg-gray-200 h-4 rounded-full">
                    <div
                      className={`h-4 rounded-full transition-all duration-300 ${
                        (currentStudentRank.totalGetMarks /
                          currentStudentRank.totalFullMark) *
                          100 >=
                        80
                          ? "bg-yellow-400"
                          : (currentStudentRank.totalGetMarks /
                                currentStudentRank.totalFullMark) *
                                100 >=
                              50
                            ? "bg-gray-400"
                            : "bg-orange-400"
                      }`}
                      style={{
                        width: `${(currentStudentRank.totalGetMarks / currentStudentRank.totalFullMark) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Badge Name */}
                <div className="text-center mt-6">
                  {(() => {
                    const percentage =
                      (currentStudentRank.totalGetMarks /
                        currentStudentRank.totalFullMark) *
                      100;

                    let badge = {
                      title: "",
                      color: "",
                      emoji: "",
                      gradient: "",
                      remark: "",
                    };

                    if (percentage >= 80) {
                      badge = {
                        title: "Gold Champion",
                        color: "text-yellow-500",
                        emoji: "🥇",
                        gradient:
                          "from-yellow-400 via-yellow-300 to-yellow-500",
                        remark: "Remarkable Student",
                      };
                    } else if (percentage >= 50) {
                      badge = {
                        title: "Silver Warrior",
                        color: "text-gray-600",
                        emoji: "🥈",
                        gradient: "from-gray-300 via-gray-200 to-gray-400",
                        remark: "Consistent Performer",
                      };
                    } else {
                      badge = {
                        title: "Bronze Starter",
                        color: "text-orange-600",
                        emoji: "🥉",
                        gradient:
                          "from-orange-400 via-orange-300 to-orange-500",
                        remark: "Keep Going!",
                      };
                    }

                    return (
                      <div
                        className={`inline-block px-6 py-4 rounded-xl bg-gradient-to-br ${badge.gradient} shadow-lg`}
                      >
                        <p className={`font-bold text-xl ${badge.color}`}>
                          {badge.emoji} {badge.title}
                        </p>
                        <p className="text-sm mt-1 text-white italic">
                          {badge.remark}
                        </p>
                      </div>
                    );
                  })()}
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-sm">Loading your rank...</p>
            )}
          </div>
        </aside>
      </div>

      <div className="order-4">
        <Footer />
      </div>
    </div>
  );
};

export default StudentSection;
