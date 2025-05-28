import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import Navbar from "../../Shared/Navbar";
import { FaHome, FaBars, FaRoute, FaList } from "react-icons/fa";
import useStroge from "../../stroge/useStroge";
import { PiExamFill } from "react-icons/pi";

const TeacherSection = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useStroge();
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  console.log(user);
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center justify-between bg-blue-500 p-4">
        <button onClick={toggleMenu} className="text-white text-2xl">
          <FaBars />
        </button>
      </div>

      <div className="flex flex-1 flex-col md:flex-row">
        {/* Sidebar */}
        <div
          className={`bg-blue-500 w-[50%]  md:w-64 p-4 space-y-4
          ${isMenuOpen ? "block absolute" : "hidden"} md:block min-h-screen`}
        >
          <ul className="menu space-y-2">
            <li>
              <NavLink
                to="/teacherDashboard"
                className="flex items-center space-x-1 text-white hover:text-gray-200"
                onClick={() => setIsMenuOpen(false)} // auto close menu on click
              >
                <FaHome />
                <span>Teacher Home</span>
              </NavLink>
              <NavLink
                to="/teacherDashboard/schedule"
                className="flex items-center space-x-1 text-white hover:text-gray-200"
                onClick={() => setIsMenuOpen(false)} // auto close menu on click
              >
                <FaList />
                <span>Schedule</span>
              </NavLink>
              <NavLink
                to="/teacherDashboard/exam"
                className="flex items-center space-x-1 text-white hover:text-gray-200"
                onClick={() => setIsMenuOpen(false)} // auto close menu on click
              >
                <PiExamFill/>
                <span>Exam</span>
              </NavLink>
            </li>
            {/* You can add more links here */}
          </ul>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default TeacherSection;
