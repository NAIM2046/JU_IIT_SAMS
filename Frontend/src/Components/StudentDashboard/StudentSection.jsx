import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  FaAd,
  FaBook,
  FaCalendar,
  FaContao,
  FaHome,
  FaList,
  FaShoppingCart,
  FaUsers,
} from "react-icons/fa";
import useStroge from "../../stroge/useStroge";

import useAxiosPrivate from "../../TokenAdd/useAxiosPrivate";
import Navbar from "../../Shared/Navbar";

const StudentSection = () => {
  const AxiosSecure = useAxiosPrivate();
  const { user } = useStroge();

  console.log(user);

  return (
    <div>
      {/* Header with avatar */}
      <div className="flex justify-between items-center mt-1 px-6">
        <Navbar></Navbar>
      </div>

      {/* Sidebar + Main Content + Right Side Panel */}
      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-44 min-h-screen bg-orange-400">
          <ul className="menu p-4">
            <li>
              <NavLink to="/studentDashboard/classroutine">
                <FaHome /> Class Routine
              </NavLink>
            </li>
            <li>
              <NavLink to="/dashboard/performance">
                <FaBook /> Performance Summary
              </NavLink>
            </li>
            <li>
              <NavLink to="/dashboard/ranklist">
                <FaUsers /> Rank & Leaderboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/dashboard/badges">
                <FaAd /> Badges & Points
              </NavLink>
            </li>

            <li>
              <NavLink to={`/studentDashboard/profile`}>
                <FaUsers /> Profile
              </NavLink>
            </li>
            <li>
              <NavLink to={`/studentDashboard/notice`}>
                <FaContao /> Notice
              </NavLink>
            </li>
            <div className="divider"></div>
            <li>
              <NavLink to="/">
                <FaHome /> Home
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4">
          <Outlet />
        </div>

        {/* Right Sidebar for Badges & Recommendations */}
        <div className="w-64 p-4 bg-gray-100 border-l hidden md:block">
          {/* Rank Badge */}
          <div className="bg-white p-4 rounded-xl shadow-md mb-4">
            <h4 className="text-lg font-bold mb-2">🏅 Your Rank</h4>
            <p className="text-2xl text-orange-600 font-extrabold">
              #5 in Class
            </p>
          </div>

          {/* Recommended Actions */}
          <div className="bg-white p-4 rounded-xl shadow-md">
            <h4 className="text-lg font-bold mb-2">🌟 Recommendations</h4>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Attend all remaining monthly exams</li>
              <li>Improve Math score by 10%</li>
              <li>Review English grammar lessons</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSection;
